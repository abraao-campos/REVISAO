// api/gerar.js
export default async function handler(req, res) {
    // Configurações de resposta para evitar erros de leitura
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    const { nivel, assunto } = req.body;
    
    // Puxa a chave da variável de ambiente que você configurou na Vercel
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
        return res.status(500).json({ error: 'Variável GEMINI_API_KEY não configurada na Vercel' });
    }

    const prompt = `Atue como professor especialista. Gere uma questão de múltipla escolha para o nível "${nivel}" sobre o assunto "${assunto}". 
    Responda APENAS um objeto JSON puro neste formato:
    {"pergunta":"...","alternativas":["...","...","...","..."],"correta":0,"explicacao":"..."}`;

    try {
        // Chamada oficial ao Gemini 3.1 Flash Lite
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${API_KEY}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({ error: data.error?.message || "Erro na API do Google" });
        }

        const textoIA = data.candidates[0].content.parts[0].text;
        
        // Limpa o texto caso a IA mande blocos de código markdown
        const jsonMatch = textoIA.match(/(\{[\s\S]*?\})/);
        if (jsonMatch) {
            return res.status(200).json(JSON.parse(jsonMatch[0]));
        } else {
            throw new Error("Resposta da IA não contém um JSON válido.");
        }

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
