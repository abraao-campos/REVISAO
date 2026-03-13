// api/gerar.js
export default async function handler(req, res) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    if (req.method !== 'POST') return res.status(405).json({ error: 'Apenas POST' });

    const API_KEY = process.env.GEMINI_API_KEY;
    const { nivel, assunto } = req.body;

    try {
        // Modelo exato da sua lista de cotas: gemini-3.1-flash-lite
        // Usamos v1beta pois modelos 'lite' costumam rodar melhor neste endpoint
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${API_KEY}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `Atue como professor. Gere uma questão JSON para o nível ${nivel} sobre o assunto ${assunto}. Responda APENAS o JSON puro: {"pergunta":"...","alternativas":["...","...","...","..."],"correta":0,"explicacao":"..."}` }] }]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            // Se der 429 aqui, é porque você atingiu o limite de 15 por minuto
            return res.status(response.status).json({ error: data.error?.message || "Erro Google" });
        }

        const textoIA = data.candidates[0].content.parts[0].text;
        const jsonMatch = textoIA.match(/\{[\s\S]*\}/);
        
        return res.status(200).json(JSON.parse(jsonMatch[0]));
    } catch (e) {
        return res.status(500).json({ error: "ERRO INTERNO: " + e.message });
    }
}
