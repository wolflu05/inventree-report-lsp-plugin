# Report LSP Editor

[![License: GPL3](https://img.shields.io/badge/License-GPLv3-yellow.svg)](https://opensource.org/license/gpl-3-0)
![CI](https://github.com/wolflu05/inventree-report-lsp-plugin/actions/workflows/ci.yml/badge.svg)

A report editor plugin that is powered by [django-template-lsp](https://github.com/fourdigits/django-template-lsp).

![Screenshot](https://github.com/user-attachments/assets/4acfc96f-878b-42aa-8c40-d7e8b29f89a0)

## ⚙️ Installation

Install the `inventree-report-lsp-plugin` from the Admin Center.

Start the LSP server. TODO add docker guide with setup and required Caddy changes.

> [!IMPORTANT]
> At least InvenTree v0.18.0 is required to use this plugin.

## 🏃 Usage

Goto the Admin Center > Label Templates or Report Templates. Click on any in the table and select the "Report Editor". For the first load, this can take some time (up to ~30s) until the data is collected.

## 🧑‍💻 Development

For this plugin to work in development, the inventree source has to be patched temporary:

1. Add this to the InvenTree `vite.config.ts`:

   ```diff
          proxy: {
            '/media': {
              target: 'http://localhost:8000',
              changeOrigin: true,
              secure: true
            },
   +        '/static/plugins/report-lsp/dist/': {
   +          target: 'http://localhost:5212',
   +          changeOrigin: true,
   +          secure: true,
   +          ws: true
   +        },
   +        "/plugin/report-lsp/ws": {
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

3. Set the `INVENTREE_REPORT_LSP_DEV` to `True` before starting the dev server
4. Install this package as editable pip package into your venv via

   ```bash
   pip install -e path/to/the/inventree-report-lsp-plugin
   ```

5. Install frontend dependencies via `cd frontend && npm ci`
6. Run the LSP in the background by invoking the `inventree-report-lsp` command in a terminal where the venv is activated. (If you want to use a custom djlsp instance because you want to do changes there, you need to specify the `INVENTREE_DJANGO_LSP_SERVER_CMD` env variable. E.g. `/path/to/django-template-lsp/env/bin/djlsp`)
7. Run the Frontend dev server via `cd frontend && npm run dev`
