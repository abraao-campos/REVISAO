// api/gerar.js
export default async function handler(req, res) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido.' });

    const API_KEY = process.env.GEMINI_API_KEY;
    const { nivel, assunto, historico } = req.body;

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${API_KEY}`;
        
        const prompt = `Atue como professor especialista e simulador de exames.
        OBJETIVO: Gerar uma questão de múltipla escolha para o aluno.
        NÍVEL DO ALUNO: ${nivel}.
        ASSUNTO/CONTEXTO: ${assunto}.

        INSTRUÇÕES ESPECÍFICAS:
        1. Se o assunto mencionar "ENEM", "Canguru", "OBMEP", "ONHB", "Vestibular" ou concursos específicos, você deve simular fielmente o estilo de cobrança, a linguagem técnica e o nível de dificuldade dessas provas. Pode usar questões reais de anos anteriores se julgar pertinente.
        2. NÃO REPETIR: Não gere nenhuma dessas perguntas que já foram feitas: ${JSON.stringify(historico)}.
        3. APROFUNDAMENTO: Além da resposta, forneça um resumo técnico denso e um esquema mental (estilo texto/mapa) para fixação.

        FORMATO DE RESPOSTA (JSON PURO):
        {
          "pergunta": "...",
          "alternativas": ["...", "...", "...", "..."],
          "correta": 0,
          "explicacao": "Justificativa direta do gabarito.",
          "resumo_tecnico": "Texto explicando a teoria por trás do assunto.",
          "esquema_mental": "Esquema de tópicos para memorização."
        }`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.85 }
            })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || "Erro Google");

        const textoIA = data.candidates[0].content.parts[0].text;
        const jsonMatch = textoIA.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
            return res.status(200).json(JSON.parse(jsonMatch[0]));
        } else {
            throw new Error("Erro ao processar resposta da IA.");
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
