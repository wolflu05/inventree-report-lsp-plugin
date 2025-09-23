from types import NoneType
from typing import get_type_hints, get_args, get_origin
from django.db import models
from report.mixins import QuerySet
from report.models import (
    BaseContextExtension,
    ReportContextExtension,
    LabelContextExtension,
    ReportSnippet,
)
from report.helpers import report_model_types


def parse_docstring(docstring: str):
    """Parse the docstring of a type object and return a dictionary of sections."""
    sections = {}
    current_section = None

    for line in docstring.splitlines():
        stripped = line.strip()

        if not stripped:
            continue

        if stripped.endswith(":"):
            current_section = stripped.rstrip(":")
            sections[current_section] = {}
        elif ":" in stripped and current_section:
            name, doc = stripped.split(":", 1)
            sections[current_section][name.strip()] = doc.strip()

    return sections


def get_type_str(type_obj):
    """Get the type str of a type object, including any generic parameters."""
    if origin := get_origin(type_obj):
        if origin is QuerySet:
            origin = models.QuerySet

        return f"{get_type_str(origin)}[{', '.join(get_type_str(arg) for arg in get_args(type_obj))}]"

    if type_obj is NoneType:
        return "None"

    if type_obj.__module__ == "builtins":
        return type_obj.__name__

    return f"{type_obj.__module__}.{type_obj.__name__}"


def context_to_typedef(context_type):
    attr_docs = parse_docstring(context_type.__doc__).get("Attributes", {})

    return {
        k: {
            "type": get_type_str(v),
            "docs": attr_docs.get(k, ""),
        }
        for k, v in get_type_hints(context_type).items()
    }


def collect_inventree_data(collector):
    # Filter out any templates that are not related to reports or labels
    collector.templates = {
        name: value
        for name, value in collector.templates.items()
        if (name.startswith("report/") or name.startswith("label/"))
        and name.endswith("_base.html")
    }

    # Add the base template for each report and label with its context for each model
    base_context = context_to_typedef(BaseContextExtension)
    label_context = context_to_typedef(LabelContextExtension)
    report_context = context_to_typedef(ReportContextExtension)

    for model in report_model_types():
        model_key = model.__name__.lower()

        for type_, context in [("label", label_context), ("report", report_context)]:
            collector.templates[f"_base/{type_}/{model_key}.html"] = {
                "path": "",
                "extends": None,
                "blocks": [],
                "context": {
                    **base_context,
                    **context,
                    **context_to_typedef(
                        get_type_hints(model.report_context).get("return")
                    ),
                },
            }

    # Add snippets to the templates
    for snippet in ReportSnippet.objects.all():
        collector.templates[f"{snippet.snippet.name}"] = {
            "path": "",
            "extends": None,
            "blocks": [],
            "context": {},
        }

    # Cleanup the global context
    collector.global_template_context = {}

    # Cleanup static files
    collector.static_files = [
        name
        for name in collector.static_files
        if name.startswith("img/") or name.startswith("tabler-icons/")
    ]

    # Cleanup urls
    collector.urls = {}
