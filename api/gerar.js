// api/gerar.js
export default async function handler(req, res) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido. Use POST.' });
    }

    const API_KEY = process.env.GEMINI_API_KEY;
    const { nivel, assunto } = req.body;

    try {
        // Usando o modelo exato que apareceu na sua lista (índice 2)
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ 
                    parts: [{ 
                        text: `Atue como professor especialista. Gere uma questão de múltipla escolha para o nível "${nivel}" sobre o assunto "${assunto}". 
                        Responda APENAS o objeto JSON puro, sem markdown, neste formato:
                        {"pergunta":"...","alternativas":["...","...","...","..."],"correta":0,"explicacao":"..."}` 
                    }] 
                }],
                generationConfig: {
                    temperature: 0.7
                }
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({ 
                error: `Erro Google: ${data.error?.message || 'Falha na API'}` 
            });
        }

        const textoIA = data.candidates[0].content.parts[0].text;
        
        // Limpeza para garantir que pegamos apenas o JSON entre as chaves { }
        const jsonMatch = textoIA.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
            const questao = JSON.parse(jsonMatch[0]);
            return res.status(200).json(questao);
        } else {
            throw new Error("A IA não retornou um JSON válido.");
        }

    } catch (error) {
        return res.status(500).json({ error: "Erro no Servidor: " + error.message });
    }
}
