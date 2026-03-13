// api/gerar.js
export default async function handler(req, res) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    if (req.method !== 'POST') return res.status(405).json({ error: 'Apenas POST' });

    const API_KEY = process.env.GEMINI_API_KEY;
    const { nivel, assunto } = req.body;

    try {
        // Rota estável V1 com o modelo Flash mais robusto
        const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `Gere uma questão JSON de múltipla escolha para o nível ${nivel} sobre o assunto ${assunto}. Responda APENAS o JSON puro: {"pergunta":"...","alternativas":["...","...","...","..."],"correta":0,"explicacao":"..."}` }] }],
                generationConfig: { responseMimeType: "application/json" }
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({ error: data.error?.message || "Erro Google" });
        }

        const textoIA = data.candidates[0].content.parts[0].text;
        return res.status(200).json(JSON.parse(textoIA));

    } catch (e) {
        return res.status(500).json({ error: "ERRO NO SERVIDOR: " + e.message });
    }
}
