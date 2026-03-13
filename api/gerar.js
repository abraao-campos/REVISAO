export default async function handler(req, res) {
    const API_KEY = process.env.GEMINI_API_KEY;

    try {
        // Vamos pedir a lista oficial de modelos para a SUA chave
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({ error: "Erro ao listar: " + data.error?.message });
        }

        // Retorna a lista de nomes para você ver no navegador
        const nomesDisponiveis = data.models.map(m => m.name);
        return res.status(200).json({ 
            msg: "Achei os modelos!", 
            modelos: nomesDisponiveis 
        });

    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
}
