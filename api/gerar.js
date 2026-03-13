// api/gerar.js
export default async function handler(req, res) {
    // Garante que o navegador entenda a resposta como JSON em UTF-8
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    // Só aceita requisições do tipo POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido. Use POST.' });
    }

    // Puxa a chave da variável de ambiente da Vercel
    const API_KEY = process.env.GEMINI_API_KEY;
    const { nivel, assunto } = req.body;

    if (!API_KEY) {
        return res.status(500).json({ error: 'ERRO: Chave GEMINI_API_KEY não configurada na Vercel.' });
    }

    try {
        // MODELO DEFINITIVO: gemini-flash-latest (ID estável com cota garantida)
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${API_KEY}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ 
                    parts: [{ 
                        text: `Atue como professor especialista. Gere uma questão de múltipla escolha para o nível "${nivel}" sobre o assunto "${assunto}". 
                        Responda APENAS o objeto JSON puro, sem marcações markdown, neste formato:
                        {"pergunta":"...","alternativas":["...","...","...","..."],"correta":0,"explicacao":"..."}` 
                    }] 
                }],
                generationConfig: {
                    temperature: 0.7,
                    topP: 0.95,
                    topK: 40
                }
            })
        });

        const data = await response.json();

        // Se o Google barrar por cota (Erro 429), enviamos uma mensagem clara
        if (!response.ok) {
            if (response.status === 429) {
                return res.status(429).json({ error: "Limite de cota atingido. Aguarde 60 segundos e tente novamente." });
            }
            return res.status(response.status).json({ 
                error: `Erro Google: ${data.error?.message || 'Falha na API'}` 
            });
        }

        const textoIA = data.candidates[0].content.parts[0].text;
        
        // Limpeza de segurança para extrair apenas o conteúdo entre as chaves { }
        const jsonMatch = textoIA.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
            const questao = JSON.parse(jsonMatch[0]);
            return res.status(200).json(questao);
        } else {
            throw new Error("A IA não retornou um formato JSON válido.");
        }

    } catch (error) {
        return res.status(500).json({ error: "Erro no Servidor: " + error.message });
    }
}
