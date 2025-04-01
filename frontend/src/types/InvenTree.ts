// These types are currently copied from the InvenTree source code until they are moved to a shared package.

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface PluginUIFeature {
  plugin_name: string;
  feature_type: string;
  key: string;
  title: string;
  description?: string;
  icon?: string;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  options?: any;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  context?: any;
  source: string;
}

export type TemplateI = {
  pk: number;
  name: string;
  description: string;
  model_type: string;
  filters: string;
  filename_pattern: string;
  enabled: boolean;
  template: string;
};

// #region  Type Helpers
export type BaseUIFeature = {
  featureType: string;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  requestContext: Record<string, any>;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  responseOptions: Record<string, any>;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  featureContext: Record<string, any>;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  featureReturnType: any;
};

export type PluginUIGetFeatureType<
  T extends BaseUIFeature,
  ServerContext extends Record<string, unknown>
> = (params: {
  featureContext: T["featureContext"];
  inventreeContext: {
    colorScheme: "dark" | "light";
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    theme: any;
  };
  serverContext: ServerContext;
}) => T["featureReturnType"];

export type PluginUIFuncWithoutInvenTreeContextType<T extends BaseUIFeature> = (
  featureContext: T["featureContext"]
) => T["featureReturnType"];

export type PluginUIFeatureAPIResponse<T extends BaseUIFeature> = {
  feature_type: T["featureType"];
  source: string;
} & T["responseOptions"];

// #region Types
export type TemplateEditorUIFeature = {
  featureType: "template_editor";
  requestContext: {
    template_type: "labeltemplate" | "reporttemplate";
    template_model: string;
  };
  responseOptions: PluginUIFeature;
  featureContext: {
    ref: HTMLDivElement;
    registerHandlers: (handlers: {
      setCode: (code: string) => void;
      getCode: () => string;
    }) => void;
    template: TemplateI;
  };
  featureReturnType: (() => void) | undefined;
};

/* eslint-enable @typescript-eslint/no-explicit-any */

export type GetFeatureType = PluginUIGetFeatureType<
  TemplateEditorUIFeature,
  {
    lspToken: string;
  }
>;
