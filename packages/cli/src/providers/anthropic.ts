import { TranslationProvider, ProviderOptions } from './base.js';

/**
 * Anthropic Translation Provider
 * 
 * Uses Claude (e.g., Claude 3 Haiku or Claude 3.5 Sonnet). 
 * Known for its exceptional reasoning and context-aware translations.
 */
export class AnthropicProvider implements TranslationProvider {
  name = 'anthropic';
  private apiKey: string;
  private model: string;

  constructor(options: ProviderOptions) {
    this.apiKey = options.apiKey || '';
    this.model = options.model || 'claude-3-haiku-20240307';
  }

  async translate(texts: string[], targetLocale: string, sourceLocale: string): Promise<string[]> {
    if (!this.apiKey) {
      throw new Error('Anthropic API Key is missing. Set LUMINA_ANTHROPIC_API_KEY environment variable.');
    }

    const prompt = `
You are a professional translator for software internationalization.
Translate the following JSON array of strings from "${sourceLocale}" to "${targetLocale}".
Maintain any placeholders like {0}, {1} exactly as they are.
Return ONLY a JSON array of strings in the exact same order.

Input: ${JSON.stringify(texts)}
`.trim();

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 2048,
        temperature: 0,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`Anthropic API Error: ${JSON.stringify(data)}`);
    }

    const resultText = data.content[0].text;
    
    // Extract JSON array from potentially markdown-wrapped response
    const jsonMatch = resultText.match(/\[.*\]/s);
    if (!jsonMatch) {
      throw new Error('Could not parse JSON array from Anthropic response');
    }
    
    return JSON.parse(jsonMatch[0]);
  }
}
