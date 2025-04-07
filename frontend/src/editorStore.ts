import { create } from "zustand";
import { State as LspState } from "vscode-languageclient/lib/common/client";

export { LspState };
export type WebSocketState =
  | typeof WebSocket.CONNECTING
  | typeof WebSocket.OPEN
  | typeof WebSocket.CLOSING
  | typeof WebSocket.CLOSED;

interface EditorState {
  lspState: LspState;
  ws: WebSocket | null;
  wsState: WebSocketState;
}

export const useEditorState = create<EditorState>()(() => ({
  lspState: LspState.Starting,
  ws: null,
  wsState: WebSocket.CLOSED,
}));
