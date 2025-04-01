"""A report editor plugins that is powered by an LSP"""

import os

import jwt
import datetime
from rest_framework.request import Request
from django.conf import settings

from plugin import InvenTreePlugin
from plugin.mixins import UserInterfaceMixin, UrlsMixin

from . import PLUGIN_VERSION


class ReportEditor(UserInterfaceMixin, UrlsMixin, InvenTreePlugin):
    """ReportEditor - custom InvenTree plugin."""

    # Plugin metadata
    TITLE = "report editor"
    NAME = "reporteditor"
    SLUG = "report-editor"
    DESCRIPTION = "A report editor plugin that is powered by an LSP"
    VERSION = PLUGIN_VERSION

    # Additional project information
    AUTHOR = "wolflu05"
    WEBSITE = "https://github.com/wolflu05/inventree-report-editor-plugin"
    LICENSE = "GPL-3.0"

    # Optionally specify supported InvenTree versions
    MIN_VERSION = '0.17.10'
    # MAX_VERSION = '2.0.0'

    def get_ui_template_editors(self, request, context, **kwargs):
        return [
            {
                'key': 'report-editor',
                'title': 'Report Editor',
                'icon': 'ti:brand-vscode:outline',
                'context': {
                    "lspToken": self._generate_lsp_token(request),
                },
                'source': self.plugin_static_file('report-editor.dev.js:getReportEditor' if os.environ.get('INVENTREE_REPORT_EDITOR_DEV', False) else 'dist/report-editor.js:getReportEditor'),
            }
        ]

    def _generate_lsp_token(self, request: Request) -> str:
        if not (request.user and request.user.is_authenticated and request.user.is_staff):
            return ""

        return jwt.encode({
            "user": request.user.id,
            "workspace": settings.BASE_DIR.absolute().as_posix(),
            "exp": datetime.datetime.now(tz=datetime.timezone.utc) + datetime.timedelta(days=1)
        }, settings.SECRET_KEY, algorithm='HS256')
