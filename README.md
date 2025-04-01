# Report Editor

A report editor plugins that is powered by an LSP

## Installation

### InvenTree Plugin Manager

Install the `inventree-report-editor-plugin` from the Admin Center.

## Configuration

... todo ...

## Usage

... todo ...

## Development

For this plugin to work in development, the inventree source has to be patched:

1. Add this to the InvenTree `vite.config.ts`:

   ```diff
          proxy: {
            '/media': {
              target: 'http://localhost:8000',
              changeOrigin: true,
              secure: true
            },
   +        '/static/plugins/report-editor/dist/': {
   +          target: 'http://localhost:5212',
   +          changeOrigin: true,
   +          secure: true,
   +          ws: true
   +        },
   +        "/plugin/report-editor/ws": {
   +          target: "http://localhost:8765",
   +          changeOrigin: true,
   +          secure: true,
   +          ws: true,
   +        }
          },
   ```

2. Remove Strict Mode temporary from `src/frontend/src/main.tsx`:

   ```diff
    ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
   -  <React.StrictMode>
          <MainView />
   -  </React.StrictMode>
    );
   ```

3. Set the `INVENTREE_REPORT_EDITOR_DEV` to `True`
4. Install this package as editable pip package into your venv via

   ```bash
   pip install -e path/to/the/inventree-report-editor-plugin
   ```

5. Run the LSP in the background by invoking the `inventree-report-editor-lsp` command in a terminal where the venv is activated.
