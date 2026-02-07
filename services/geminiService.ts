
import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    // Correctly initialize GoogleGenAI with the API key from environment variables as per guidelines
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async generateDescription(productName: string, cuisineType: string): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Escreva uma descrição curta, viciante e persuasiva para um prato de cardápio chamado "${productName}" em um restaurante de "${cuisineType}". Use no máximo 200 caracteres.`,
      });
      return response.text || 'Erro ao gerar descrição.';
    } catch (error) {
      console.error('Gemini error:', error);
      return 'Não foi possível gerar a descrição automaticamente.';
    }
  }

  async suggestPrice(productName: string, ingredients: string): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Sugira um preço justo para um prato "${productName}" feito com "${ingredients}". Responda apenas com o valor em reais (ex: R$ 35,00) e uma justificativa curtíssima.`,
      });
      return response.text || 'R$ 0,00';
    } catch (error) {
      console.error('Gemini error:', error);
      return 'Erro na sugestão.';
    }
  }
}

export const geminiService = new GeminiService();
