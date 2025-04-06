import { injectIntoGlobalHook } from "http://localhost:5173/static/plugins/report-editor/dist/@react-refresh";
injectIntoGlobalHook(window);
window.$RefreshReg$ = () => {};
window.$RefreshSig$ = () => (type) => type;

export const getReportEditor = (...args) => {
    let unmountHandler;
    const run = async () => {
        await import("http://localhost:5173/static/plugins/report-editor/dist/@vite/client");
        const { getReportEditor } = await import("http://localhost:5173/static/plugins/report-editor/dist/src/report-editor.tsx");
        unmountHandler = getReportEditor(...args);
    };
    run();

    return () => {
        unmountHandler?.();
    }
};
