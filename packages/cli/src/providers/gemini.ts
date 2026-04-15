import { TranslationProvider, ProviderOptions } from './base.js';

/**
 * Google Gemini Translation Provider
 * 
 * Uses Google's Gemini models (like gemini-1.5-flash) to perform 
 * contextual translations. This provider is usually preferred for its 
 * speed and strong understanding of developer-centric placeholders.
 */
export class GeminiProvider implements TranslationProvider {
  name = 'gemini';
  private apiKey: string;
  private model: string;

  constructor(options: ProviderOptions) {
    this.apiKey = options.apiKey || '';
    // Flash is default because it's fast and cheap for i18n tasks
    this.model = options.model || 'gemini-1.5-flash';
  }

  /**
   * Translates a batch of texts using a structured prompt.
   * 
   * It forces the AI to behave as a translation engine and return 
   * only a valid JSON array, ensuring the output can be automatically 
   * parsed and saved to the locale files.
   */
  async translate(texts: string[], targetLocale: string, sourceLocale: string): Promise<string[]> {
    if (!this.apiKey) throw new Error('Gemini API Key is missing');

    const prompt = `
      You are a professional translator for software internationalization.
      Translate the following JSON array of strings from "${sourceLocale}" to "${targetLocale}".
      Maintain any placeholders like {0}, {1} exactly as they are.
      Return ONLY a JSON array of strings in the exact same order.
      
      Input: ${JSON.stringify(texts)}
    `.trim();

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const data = await response.json();
    if (!response.ok) throw new Error(`Gemini API Error: ${JSON.stringify(data)}`);

    const resultText = data.candidates[0].content.parts[0].text;
    
    // We use a regex to find the JSON array in the response. 
    // This is a "defensive" measure because LLMs sometimes wrap 
    // their response in markdown code blocks (```json ... ```).
    const jsonMatch = resultText.match(/\[.*\]/s);
    if (!jsonMatch) throw new Error('Could not parse JSON array from Gemini response');
    
    return JSON.parse(jsonMatch[0]);
  }
}
