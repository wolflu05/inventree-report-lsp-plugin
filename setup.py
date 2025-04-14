# -*- coding: utf-8 -*-

import importlib
import importlib.util
import os
import setuptools

"""This file is used to package the reporteditor plugin.

- It was generated by the InvenTree Plugin Creator tool - version 1.2.0
- Ref: https://github.com/inventree/plugin_creator
"""

"""Read the plugin version from the source code."""
module_path = os.path.join(os.path.dirname(__file__), "report_lsp", "__init__.py")
spec = importlib.util.spec_from_file_location("report_lsp", module_path)
report_lsp = importlib.util.module_from_spec(spec)
spec.loader.exec_module(report_lsp)

with open('README.md', encoding='utf-8') as f:
    long_description = f.read()

setuptools.setup(
    name="inventree-report-lsp-plugin",
    version=report_lsp.PLUGIN_VERSION,
    author="wolflu05",
    author_email="76838159+wolflu05@users.noreply.github.com",
    description="A report editor plugin that is powered by an LSP",
    long_description=long_description,
    long_description_content_type='text/markdown',
    url="https://github.com/wolflu05/inventree-report-lsp-plugin",
    license="GPL-3.0",
    packages=setuptools.find_packages(),
    include_package_data=True,
    install_requires=[
        # Enter your plugin library dependencies here
        "websockets==15.0.1",
        "pyjwt==2.10.1",
        "django-template-lsp==1.2.0",
    ],
    setup_requires=[
        "wheel",
        "twine",
    ],
    python_requires=">=3.9",
    entry_points={
        "inventree_plugins": [
            "reporteditor = report_lsp.core:ReportEditor"
        ],
        "console_scripts": [
            "inventree-report-lsp=report_lsp.lsp.server:cli"
        ],
    },
)
