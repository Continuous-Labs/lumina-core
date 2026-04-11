import { TranslationProvider, ProviderOptions } from './base.js';

export class GeminiProvider implements TranslationProvider {
  name = 'gemini';
  private apiKey: string;
  private model: string;

  constructor(options: ProviderOptions) {
    this.apiKey = options.apiKey || '';
    this.model = options.model || 'gemini-1.5-flash';
  }

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
    // Extract JSON array from potentially markdown-wrapped response
    const jsonMatch = resultText.match(/\[.*\]/s);
    if (!jsonMatch) throw new Error('Could not parse JSON array from Gemini response');
    
    return JSON.parse(jsonMatch[0]);
  }
}
