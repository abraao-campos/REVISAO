// api/gerar.js
export default async function handler(req, res) {
    // Configurações de cabeçalho para permitir chamadas do seu front-end
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    // Responde a requisições de pré-verificação (CORS)
    if (req.method === 'OPTIONS') return res.status(200).end();
    
    // Aceita apenas POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido. Use POST.' });
    }

    const { nivel, assunto } = req.body;

    // Busca a chave que você configurou no painel da Vercel
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
        return res.status(500).json({ error: 'Variável GEMINI_API_KEY não encontrada na Vercel.' });
    }

    // Prompt configurado para o Gemini 3.1 Flash Lite
    const prompt = `Atue como professor especialista. Gere uma questão de múltipla escolha para o nível "${nivel}" sobre o assunto "${assunto}". 
    Responda APENAS o objeto JSON puro (sem markdown) neste formato:
    {"pergunta":"...","alternativas":["...","...","...","..."],"correta":0,"explicacao":"..."}`;

    try {
        // Chamada ao modelo 3.1 Flash Lite via rota v1beta
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${API_KEY}`, {
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

        // Extrai o texto da resposta
        const textoIA = data.candidates[0].content.parts[0].text;
        
        // Limpa possíveis marcações de markdown ```json que a IA possa enviar
        const jsonLimpo = textoIA.replace(/```json|```/g, "").trim();
        
        // Retorna o JSON processado para o seu app.js
        return res.status(200).json(JSON.parse(jsonLimpo));

    } catch (error) {
        console.error("Erro no Servidor:", error);
        return res.status(500).json({ error: "Erro ao processar questão: " + error.message });
    }
}
