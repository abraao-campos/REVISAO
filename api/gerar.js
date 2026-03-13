// api/gerar.js
export default async function handler(req, res) {
    // Configurações de resposta para a Vercel
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Use o método POST' });

    const { nivel, assunto } = req.body;
    
    // IMPORTANTE: Use a chave nova gerada no "NEW PROJECT" do AI Studio
    const API_KEY = "AIzaSyBNrS-c7SHpdifjQir-qFBydNfg3q5eNuQ"; 

    const prompt = `Atue como professor especialista. Gere uma questão de múltipla escolha para o nível "${nivel}" sobre o assunto "${assunto}". 
    Você deve responder APENAS um objeto JSON no seguinte formato exato:
    {"pergunta":"...","alternativas":["...","...","...","..."],"correta":0,"explicacao":"..."}`;

    try {
        // Chamada direta para o Gemini 3.1 Flash Lite via servidor
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({ error: data.error?.message || "Erro no Google AI" });
        }

        let textoIA = data.candidates[0].content.parts[0].text;
        
        // Limpeza de blocos de código markdown que a IA possa enviar
        const jsonMatch = textoIA.match(/(\{[\s\S]*?\})/);
        if (jsonMatch) {
            return res.status(200).json(JSON.parse(jsonMatch[0]));
        } else {
            throw new Error("A IA não retornou um JSON válido.");
        }

    } catch (error) {
        console.error("Erro interno:", error);
        return res.status(500).json({ error: error.message });
    }
}