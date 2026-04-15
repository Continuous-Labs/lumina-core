import { TranslationProvider, ProviderOptions } from './base.js';

/**
 * OpenAI Translation Provider
 * 
 * Supports standard GPT-3.5 and GPT-4 models. 
 * Reliable and widely used for high-fidelity translations.
 */
export class OpenAIProvider implements TranslationProvider {
  name = 'openai';
  private apiKey: string;
  private model: string;

  constructor(options: ProviderOptions) {
    this.apiKey = options.apiKey || '';
    this.model = options.model || 'gpt-3.5-turbo';
  }

  async translate(texts: string[], targetLocale: string, sourceLocale: string): Promise<string[]> {
    if (!this.apiKey) {
      throw new Error('OpenAI API Key is missing. Set LUMINA_OPENAI_API_KEY environment variable.');
    }

    const prompt = `
You are a professional translator for software internationalization.
Translate the following JSON array of strings from "${sourceLocale}" to "${targetLocale}".
Maintain any placeholders like {0}, {1} exactly as they are.
Return ONLY a JSON array of strings in the exact same order.

Input: ${JSON.stringify(texts)}
`.trim();

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        temperature: 0,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`OpenAI API Error: ${JSON.stringify(data)}`);
    }

    const resultText = data.choices[0].message.content;
    
    // Extract JSON array from potentially markdown-wrapped response
    const jsonMatch = resultText.match(/\[.*\]/s);
    if (!jsonMatch) {
      throw new Error('Could not parse JSON array from OpenAI response');
    }
    
    return JSON.parse(jsonMatch[0]);
  }
}
