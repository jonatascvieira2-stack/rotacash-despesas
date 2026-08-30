export async function analisarReciboComGemini(base64Image) {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: "Extraia o valor total, a data e o nome do estabelecimento deste recibo. Retorne em formato JSON." },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: base64Image 
              }
            }
          ]
        }]
      })
    });

    const data = await response.json();
    const textoExtraido = data.candidates[0].content.parts[0].text;
    
    return textoExtraido;

  } catch (error) {
    console.error("Erro ao analisar recibo com Gemini:", error);
    return null;
  }
}