import { injectIntoGlobalHook } from "http://localhost:5173/static/plugins/report-lsp/dist/@react-refresh";
injectIntoGlobalHook(window);
window.$RefreshReg$ = () => {};
window.$RefreshSig$ = () => (type) => type;

export const getReportEditor = (...args) => {
    let unmountHandler;
    const run = async () => {
        await import("http://localhost:5173/static/plugins/report-lsp/dist/@vite/client");
        const { getReportEditor } = await import("http://localhost:5173/static/plugins/report-lsp/dist/src/main.tsx");
        unmountHandler = getReportEditor(...args);
    };
    run();

    return () => {
        unmountHandler?.();
    }
};
