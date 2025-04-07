import { LspState, useEditorState } from "./editorStore"

export const StatusBar = () => {
  const lspState = useEditorState((s) => s.lspState);
  const wsState = useEditorState((s) => s.wsState);

  return (
    <div style={{ background: "var(--mantine-color-blue-9)", display: "flex", flexDirection: "row-reverse", paddingRight: "0.5rem" }}>
      <span style={{ color: "white", fontSize: "0.8rem" }}>
        {lspState === LspState.Stopped && "LSP Stopped"}
        {lspState === LspState.Starting && "Starting LSP..."}
        {lspState === LspState.Running && "LSP Running"}

        {" ("}
        {wsState === WebSocket.CONNECTING && "Connecting..."}
        {wsState === WebSocket.OPEN && "Connected"}
        {wsState === WebSocket.CLOSING && "Closing..."}
        {wsState === WebSocket.CLOSED && "Disconnected"}
        {")"}
      </span>
    </div>
  )
}
