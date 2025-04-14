# inventree-report-lsp-plugin

[![License: GPL3](https://img.shields.io/badge/License-GPLv3-yellow.svg)](https://opensource.org/license/gpl-3-0)
![CI](https://github.com/wolflu05/inventree-report-lsp-plugin/actions/workflows/ci.yml/badge.svg)

A report editor plugin that is powered by [django-template-lsp](https://github.com/fourdigits/django-template-lsp).

![Screenshot](https://github.com/user-attachments/assets/7ef62cea-ab03-4e6e-a25b-5e67df56ad5b)

## ⚙️ Installation

1. Install the `inventree-report-lsp-plugin` from the Admin Center > Plugins > Install plugin. (Make sure the user interface plugin integration is enabled.)
2. Now the LSP server needs to be started separately via the `inventree-report-lsp` cmd and the requests to `/plugins/report-lsp/ws` need to be proxied to it. If you're using the official docker stack, follow the guide below:

> [!IMPORTANT]
> At least InvenTree v0.18.0 is required to use this plugin.

### 🐳 Docker

Add this extra container to the `docker-compose.yml` file:

```yml
    inventree-report-lsp:
        image: inventree/inventree:${INVENTREE_TAG:-stable}
        container_name: inventree-report-lsp
        command: /bin/ash -c "invoke plugins && inventree-report-lsp"
        env_file:
            - .env
        volumes:
            - ${INVENTREE_EXT_VOLUME}:/home/inventree/data:z
        restart: unless-stopped
```

Add this `proxy_route` to the `Caddyfile`:

```diff
                 forward_auth {$INVENTREE_SERVER:"http://inventree-server:8000"} {
                         uri /auth/
                 }
         }
 
+        reverse_proxy /plugin/report-lsp/ws "http://inventree-report-lsp:8765"
 
         # All other requests are proxied to the InvenTree server
         reverse_proxy {$INVENTREE_SERVER:"http://inventree-server:8000"} {
```

## 🏃 Usage

Goto the Admin Center > Label Templates or Report Templates. Click on any in the table and select the "Report Editor". For the first load, this can take some time (up to ~30s) until the data is collected. The status bar at the bottom should show `LSP Running (Connected)` when its ready.

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
