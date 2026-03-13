// api/gerar.js
export default async function handler(req, res) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

    const API_KEY = process.env.GEMINI_API_KEY;
    const { nivel, assunto } = req.body;

    try {
        // MUDANÇA AQUI: Trocamos para o modelo 1.5-flash (Estável e compatível)
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `Gere uma questão JSON para o nível ${nivel} sobre o assunto ${assunto}. Responda APENAS o JSON puro neste formato: {"pergunta":"...","alternativas":["...","...","...","..."],"correta":0,"explicacao":"..."}` }] }]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({ error: data.error?.message || "Erro no Google" });
        }

        const textoIA = data.candidates[0].content.parts[0].text;
        const jsonMatch = textoIA.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
            return res.status(200).json(JSON.parse(jsonMatch[0]));
        } else {
            throw new Error("A IA não retornou um JSON válido.");
        }

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
