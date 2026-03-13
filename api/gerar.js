// api/gerar.js
export default async function handler(req, res) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    if (req.method !== 'POST') return res.status(405).json({ error: 'Apenas POST' });

    const API_KEY = process.env.GEMINI_API_KEY;
    const { nivel, assunto } = req.body;

    try {
        // Usando v1beta que aceita melhor comandos de texto para JSON
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ 
                    parts: [{ 
                        text: `Atue como professor especialista. Gere uma questão de múltipla escolha para o nível "${nivel}" sobre o assunto "${assunto}". Responda APENAS o objeto JSON puro, sem markdown, neste formato: {"pergunta":"...","alternativas":["...","...","...","..."],"correta":0,"explicacao":"..."}` 
                    }] 
                }]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({ error: data.error?.message || "Erro no Google" });
        }

        // Pega o texto bruto da IA
        let textoIA = data.candidates[0].content.parts[0].text;
        
        // Limpeza manual: busca o que está entre chaves { } para evitar erros de formatação
        const jsonMatch = textoIA.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
            const jsonFinal = JSON.parse(jsonMatch[0]);
            return res.status(200).json(jsonFinal);
        } else {
            throw new Error("A IA não retornou um formato JSON reconhecível.");
        }

    } catch (e) {
        return res.status(500).json({ error: "ERRO NO SERVIDOR: " + e.message });
    }
}
