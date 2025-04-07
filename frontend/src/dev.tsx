import { getReportEditor } from "./report-editor.tsx";

export const renderDebug = (ref: HTMLDivElement) => {
  getReportEditor({
    featureContext: {
      ref,
      registerHandlers: (handlers) => {
        handlers.setCode("print('Hello, World!')");
      },
      template: {
        pk: 1,
        name: "Test Template",
        description: "A test template",
        model_type: "part",
        filters: "",
        filename_pattern: "test",
        enabled: true,
        template: "print('Hello, World!')"
      }
    },
    inventreeContext: {
      colorScheme: "dark",
      theme: undefined,
    },
    serverContext: {
      lspToken: "",
    }
  })
}
