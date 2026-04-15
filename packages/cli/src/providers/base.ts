/**
 * Lumina AI Translation Provider Interface
 * 
 * All AI adapters (Gemini, ChatGPT, Anthropic, Ollama) must implement 
 * this interface to be compatible with the Lumina CLI.
 */

export interface TranslationProvider {
  /** Descriptive name of the provider (e.g., 'Google Gemini') */
  name: string;

  /**
   * The core translation method. 
   * It takes a batch of texts and returns their translations.
   * 
   * @param texts Array of original strings to translate.
   * @param targetLocale The language to translate into.
   * @param sourceLocale The language the texts are currently in.
   */
  translate(texts: string[], targetLocale: string, sourceLocale: string): Promise<string[]>;
}

/**
 * Universal options for AI providers.
 */
export interface ProviderOptions {
  apiKey?: string;
  model?: string;
  endpoint?: string;
}
