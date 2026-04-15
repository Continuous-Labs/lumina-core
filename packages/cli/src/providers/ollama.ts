import { TranslationProvider, ProviderOptions } from './base.js';

/**
 * Ollama Translation Provider
 * 
 * Perfect for teams that want to keep their translation pipeline entirely local 
 * or private. It interacts with a local Ollama instance (e.g., running Llama 3).
 */
export class OllamaProvider implements TranslationProvider {
  name = 'ollama';
  private endpoint: string;
  private model: string;

  constructor(options: ProviderOptions) {
    this.endpoint = options.endpoint || 'http://localhost:11434/api/generate';
    this.model = options.model || 'llama3';
  }

  async translate(texts: string[], targetLocale: string, sourceLocale: string): Promise<string[]> {
    const prompt = `
      You are a professional translator. 
      Translate this JSON array from "${sourceLocale}" to "${targetLocale}". 
      Keep placeholders like {0} unchanged. 
      Return only the JSON array.
      
      Input: ${JSON.stringify(texts)}
    `.trim();

    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        prompt: prompt,
        stream: false,
        format: 'json'
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(`Ollama API Error: ${data.error || 'Unknown error'}`);

    // Ollama with format: 'json' returns the object directly
    return JSON.parse(data.response);
  }
}
