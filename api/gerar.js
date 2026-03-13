// api/gerar.js
export default async function handler(req, res) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    
    const API_KEY = process.env.GEMINI_API_KEY;
    const { nivel, assunto } = req.body;

    // Tentaremos o modelo "gemini-1.5-pro", que costuma ter rotas mais consistentes
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${API_KEY}`;

    const payload = {
        contents: [{
            parts: [{
                text: `Gere uma questão de múltipla escolha para ${nivel} sobre ${assunto}. 
                Responda APENAS o JSON: {"pergunta":"...","alternativas":["...","...","...","..."],"correta":0,"explicacao":"..."}`
            }]
        }]
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        // Se der erro de "not found", vamos tentar uma rota de emergência
        if (!response.ok) {
            return res.status(response.status).json({ 
                error: `Erro: ${data.error?.message || 'Falha na comunicação'}` 
            });
        }

        const texto = data.candidates[0].content.parts[0].text;
        // Limpeza agressiva para pegar o JSON mesmo se vier com texto ao redor
        const jsonMatch = texto.match(/\{[\s\S]*\}/);
        
        return res.status(200).json(JSON.parse(jsonMatch[0]));

    } catch (error) {
        return res.status(500).json({ error: "Erro no Servidor: " + error.message });
    }
}
