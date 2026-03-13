// api/gerar.js
export default async function handler(req, res) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

    const API_KEY = process.env.GEMINI_API_KEY;
    const { nivel, assunto } = req.body;

    try {
        // MUDANÇA VITAL: Trocamos 'v1beta' por 'v1' para garantir compatibilidade
        const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `Atue como professor. Gere uma questão JSON para o nível ${nivel} sobre o assunto ${assunto}. Formato: {"pergunta":"...","alternativas":["...","...","...","..."],"correta":0,"explicacao":"..."}` }] }]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            // Se ainda der erro, o 'data' nos dirá exatamente por que o Google recusou
            return res.status(response.status).json({ error: data.error?.message || "Erro na comunicação com Google" });
        }

        const textoIA = data.candidates[0].content.parts[0].text;
        
        // Remove crases de markdown se a IA as incluir
        const jsonMatch = textoIA.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
            return res.status(200).json(JSON.parse(jsonMatch[0]));
        } else {
            throw new Error("A IA não retornou um formato JSON válido.");
        }

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
