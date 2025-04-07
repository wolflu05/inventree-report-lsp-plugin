import { createRoot } from "react-dom/client";
import App from './App.tsx'

import type { GetFeatureType } from "./types/InvenTree.ts";
import { MantineProvider } from "@mantine/core";

export const getReportEditor: GetFeatureType = (params) => {
  const { featureContext, inventreeContext } = params;

  const root = createRoot(featureContext.ref);

  root.render(
    <MantineProvider
      theme={inventreeContext.theme}
      forceColorScheme={inventreeContext.colorScheme}
      getRootElement={() => featureContext.ref}
    >
      <App params={params} />
    </MantineProvider>
  );

  return () => {
    root.unmount();
  }
}
