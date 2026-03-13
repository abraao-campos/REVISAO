// api/gerar.js
export default async function handler(req, res) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

    // Puxa exatamente a chave da imagem (AIzaSyC9GrgalsYeBMy3HoSF55PlmrNVFiaPpw8)
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) return res.status(500).json({ error: 'Erro: Variável GEMINI_API_KEY não encontrada.' });

    const { nivel, assunto } = req.body;

    try {
        // Chamada explícita ao modelo 3.1 Flash Lite
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${API_KEY}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `Gere uma questão JSON para ${nivel} sobre ${assunto}. Responda apenas: {"pergunta":"...","alternativas":["...","...","...","..."],"correta":0,"explicacao":"..."}` }] }]
            })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || "Erro Google");

        const textoIA = data.candidates[0].content.parts[0].text;
        const jsonMatch = textoIA.match(/\{[\s\S]*\}/);
        
        return res.status(200).json(JSON.parse(jsonMatch[0]));
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
