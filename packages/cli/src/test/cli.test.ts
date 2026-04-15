import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GeminiProvider } from '../providers/gemini.js'
import { OllamaProvider } from '../providers/ollama.js'
import { OpenAIProvider } from '../providers/openai.js'
import { AnthropicProvider } from '../providers/anthropic.js'

describe('CLI Providers', () => {
  const mockFetch = vi.fn()
  global.fetch = mockFetch

  beforeEach(() => {
    mockFetch.mockReset()
  })

  describe('GeminiProvider', () => {
    it('should translate text using Gemini API', async () => {
      const provider = new GeminiProvider({ apiKey: 'test-key' })
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          candidates: [{
            content: { parts: [{ text: '["Hola", "Mundo"]' }] }
          }]
        })
      })

      const results = await provider.translate(['Hello', 'World'], 'es', 'en')
      
      expect(results).toEqual(['Hola', 'Mundo'])
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('generativelanguage.googleapis.com'),
        expect.any(Object)
      )
    })

    it('should throw error if API key is missing', async () => {
      const provider = new GeminiProvider({ apiKey: '' })
      await expect(provider.translate(['Hi'], 'es', 'en')).rejects.toThrow('Gemini API Key is missing')
    })
  })

  describe('OllamaProvider', () => {
    it('should translate text using local Ollama API', async () => {
      const provider = new OllamaProvider({ endpoint: 'http://localhost:11434/api/generate' })
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          response: '["Hola"]'
        })
      })

      const results = await provider.translate(['Hello'], 'es', 'en')
      expect(results).toEqual(['Hola'])
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:11434/api/generate',
        expect.any(Object)
      )
    })
  })

  describe('OpenAIProvider', () => {
    it('should translate text using OpenAI API', async () => {
      const provider = new OpenAIProvider({ apiKey: 'test-key' })
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{
            message: { content: '["Hola"]' }
          }]
        })
      })

      const results = await provider.translate(['Hello'], 'es', 'en')
      expect(results).toEqual(['Hola'])
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.any(Object)
      )
    })
  })

  describe('AnthropicProvider', () => {
    it('should translate text using Anthropic API', async () => {
      const provider = new AnthropicProvider({ apiKey: 'test-key' })
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          content: [{ text: '["Hola"]' }]
        })
      })

      const results = await provider.translate(['Hello'], 'es', 'en')
      expect(results).toEqual(['Hola'])
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.anthropic.com/v1/messages',
        expect.any(Object)
      )
    })
  })
})
