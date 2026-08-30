import { GoogleGenAI } from '@google/genai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

export async function extractReceiptData(base64Image) {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY não configurada no .env');
  }

  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  
  const prompt = `Analise esta imagem de cupom fiscal, nota fiscal ou recibo no Brasil.
Retorne ESTRITAMENTE um JSON válido:
{
  "amount": number,
  "category": "combustivel" | "alimentacao" | "hospedagem" | "pedagio" | "manutencao" | "outros",
  "establishment": string,
  "date": "YYYY-MM-DD",
  "description": string,
  "paymentMethod": "pix" | "cartao_credito" | "cartao_debito" | "dinheiro"
}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image
            }
          }
        ]
      }
    ]
  });

  const responseText = response.text || '';
  const cleanJson = responseText.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
  return JSON.parse(cleanJson);
}
