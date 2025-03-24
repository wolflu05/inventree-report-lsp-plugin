"""A report editor plugins that is powered by an LSP"""

from plugin import InvenTreePlugin

from plugin.mixins import UserInterfaceMixin

from . import PLUGIN_VERSION


class reporteditor(UserInterfaceMixin, InvenTreePlugin):

    """reporteditor - custom InvenTree plugin."""

    # Plugin metadata
    TITLE = "report editor"
    NAME = "reporteditor"
    SLUG = "report-editor"
    DESCRIPTION = "A report editor plugin that is powered by an LSP"
    VERSION = PLUGIN_VERSION

    # Additional project information
    AUTHOR = "wolflu05"
    WEBSITE = "https://github.com/wolflu05/inventree-report-editor-plugin"
    LICENSE = "MIT"

    # Optionally specify supported InvenTree versions
    # MIN_VERSION = '0.18.0'
    # MAX_VERSION = '2.0.0'
    
    
    
    
    

    # User interface elements (from UserInterfaceMixin)
    # Ref: https://docs.inventree.org/en/stable/extend/plugins/ui/
    
    
