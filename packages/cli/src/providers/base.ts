export interface TranslationProvider {
  name: string;
  translate(texts: string[], targetLocale: string, sourceLocale: string): Promise<string[]>;
}

export interface ProviderOptions {
  apiKey?: string;
  model?: string;
  endpoint?: string;
}
