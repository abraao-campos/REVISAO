// api/gerar.js
export default async function handler(req, res) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido.' });

    const API_KEY = process.env.GEMINI_API_KEY;
    const { nivel, assunto } = req.body;

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${API_KEY}`;
        
        const prompt = `Atue como professor especialista. Gere uma questão de múltipla escolha para o nível "${nivel}" sobre o assunto "${assunto}". 
        Responda APENAS um objeto JSON puro com as chaves:
        - "pergunta": o enunciado.
        - "alternativas": array com 4 strings.
        - "correta": índice 0 a 3.
        - "explicacao": justificativa curta do gabarito.
        - "resumo_tecnico": um texto de aprofundamento sobre o conceito abordado.
        - "esquema_mental": um pequeno esquema em texto (estilo bullet points ou fluxograma simples) para memorização.`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.8 }
            })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || "Erro Google");

        const textoIA = data.candidates[0].content.parts[0].text;
        const jsonMatch = textoIA.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
            return res.status(200).json(JSON.parse(jsonMatch[0]));
        } else {
            throw new Error("Formato de resposta inválido.");
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
