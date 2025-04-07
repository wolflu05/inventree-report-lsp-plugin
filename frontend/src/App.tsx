import type { GetFeatureType } from "./types/InvenTree";
import { useCallback, useEffect, useMemo, useRef } from "react";

import '@codingame/monaco-vscode-html-default-extension';
import '@codingame/monaco-vscode-html-language-features-default-extension';
import '@codingame/monaco-vscode-emmet-default-extension'
import { LogLevel } from '@codingame/monaco-vscode-api';
import { toSocket, WebSocketMessageReader, WebSocketMessageWriter } from 'vscode-ws-jsonrpc';
import type { MonacoEditorLanguageClientWrapper, WrapperConfig } from 'monaco-editor-wrapper';
import { MonacoEditorReactComp } from '@typefox/monaco-editor-react';
import { configureDefaultWorkerFactory } from 'monaco-editor-wrapper/workers/workerLoaders';
import djangoHtmlTmLanguageJson from './assets/django-html.tmLanguage.json?raw';
import { LspState, useEditorState, type WebSocketState } from "./editorStore";
import { StatusBar } from "./StatusBar";


const extensionFiles = new Map<string, string | URL>();
extensionFiles.set('./django-html.tmLanguage.json', djangoHtmlTmLanguageJson);

const useWrapperConfig = ({ theme, lspToken }: { theme: "dark" | "light", lspToken: string }) => {
  const wrapperConfig: WrapperConfig = useMemo(() => {
    const ws = new WebSocket(`/plugin/report-lsp/ws?token=${encodeURIComponent(lspToken)}`);
    const iWebSocket = toSocket(ws);
    const reader = new WebSocketMessageReader(iWebSocket);
    const writer = new WebSocketMessageWriter(iWebSocket);

    useEditorState.setState({ ws, wsState: ws.readyState as WebSocketState, lspState: LspState.Starting });
    const updateWsState = () => {
      useEditorState.setState({ wsState: ws.readyState as WebSocketState });
    }
    ws.addEventListener("open", updateWsState);
    ws.addEventListener("close", updateWsState);

    return {
      $type: 'extended',
      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      htmlContainer: document.getElementById('monaco-editor-root')!,
      logLevel: LogLevel.Trace,
      vscodeApiConfig: {
        userConfiguration: {
          json: JSON.stringify({
            "workbench.colorTheme": theme === "dark" ? "Default Dark Modern" : "Default Light Modern",
          }),
        },
        enableExtHostWorker: true,
      },
      editorAppConfig: {
        monacoWorkerFactory: configureDefaultWorkerFactory,
      },
      languageClientConfigs: {
        configs: {
          html: {
            name: "Django Template LSP",
            connection: {
              options: {
                $type: "WebSocketDirect",
                webSocket: ws,
                startOptions: {
                  reportStatus: true,
                  onCall: (languageClient) => {
                    if (!languageClient) return;

                    useEditorState.setState({ lspState: languageClient.state });
                    languageClient.onDidChangeState(e => {
                      useEditorState.setState({ lspState: e.newState });
                    });
                  }
                }
              },
              messageTransports: { reader, writer },
            },
            clientOptions: {
              documentSelector: ['html'],
            }
          }
        }
      },
      extensions: [{
        config: {
          name: 'django-extension',
          publisher: "wolflu05",
          version: "0.1.0",
          engines: {
            vscode: "*"
          },
          contributes: {
            grammars: [{
              language: "html",
              scopeName: "text.html.django",
              path: "./django-html.tmLanguage.json",
            }]
          }
        },
        filesOrContents: extensionFiles
      }]
    }
  }, [lspToken, theme]);

  return wrapperConfig;
};

export default function App({ params }: { params: Parameters<GetFeatureType>[0] }) {
  const {
    featureContext: { registerHandlers, template },
  } = params;
  const wrapperRef = useRef<MonacoEditorLanguageClientWrapper>();
  const hasRegisteredRef = useRef(false);
  const tempCodeRef = useRef<string>();

  const wrapperConfig = useWrapperConfig({
    theme: params.inventreeContext.colorScheme,
    lspToken: params.serverContext.lspToken,
  });

  useEffect(() => {
    if (hasRegisteredRef.current) return;

    registerHandlers({
      setCode: (code: string) => {
        tempCodeRef.current = code;
      },
      getCode: () => {
        return wrapperRef.current?.getTextContents()?.modified ?? "";
      },
    });
    hasRegisteredRef.current = true;
  }, [registerHandlers]);

  const handleEditorDidMount = useCallback((wrapper: MonacoEditorLanguageClientWrapper) => {
    wrapperRef.current = wrapper;

    if (tempCodeRef.current) {
      const type = template.template.match(/\/media\/report\/(label|report)/)?.[1] ?? "report";

      wrapper.updateCodeResources({
        modified: {
          uri: `templates/_base/${type}/${template.model_type}.html`,
          text: tempCodeRef.current,
        },
      })
    }
  }, [template.model_type, template.template]);

  return (
    <div style={{ height: "100%", width: "100%", display: "flex", position: "relative", flexDirection: "column" }}>
      <MonacoEditorReactComp
        wrapperConfig={wrapperConfig}
        style={{ flex: 1 }}
        onLoad={handleEditorDidMount}
        onError={(error) => {
          console.error(error);
        }}
      />
      <StatusBar />
    </div>
  );
}
