// ===============================================
// ARQUIVO: app.js
// Versão: 13.0 - Sincronizada com Cotas Reais
// ===============================================

const state = {
    stage: 'START',
    nivelEstudante: '',
    assuntoRevisao: '',
    currentQuestion: null,
    // Sua chave ativa do projeto REVISAO
    GEMINI_API_KEY: 'AIzaSyBNrS-c7SHpdifjQir-qFBydNfg3q5eNuQ' 
};

function render() {
    const app = document.getElementById('app');
    if (!app) return;

    if (state.stage === 'START') {
        app.innerHTML = `
            <div class="fade-in bg-white p-8 rounded-3xl shadow-xl border-b-8 border-indigo-500 text-center">
                <h1 class="text-4xl font-black text-indigo-900 mb-8 uppercase tracking-tight">📚 Cantinho do Estudo</h1>
                <div class="space-y-6">
                    <input type="text" id="nivel" placeholder="Nível (Ex: 9º ano)" class="w-full p-4 border-2 border-gray-100 bg-gray-50 rounded-2xl outline-none focus:border-indigo-500 transition" value="${state.nivelEstudante}">
                    <input type="text" id="assunto" placeholder="Assunto (Ex: Revolução Francesa)" class="w-full p-4 border-2 border-gray-100 bg-gray-50 rounded-2xl outline-none focus:border-indigo-500 transition" value="${state.assuntoRevisao}">
                    <button onclick="gerarQuestaoIA()" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-2xl shadow-lg transition-all active:scale-95 text-lg">
                        🚀 GERAR DESAFIO
                    </button>
                </div>
            </div>`;
    } 
    else if (state.stage === 'LOADING') {
        app.innerHTML = `<div class="p-12 text-center bg-white rounded-3xl shadow-xl border-b-8 border-gray-200"><div class="loader mb-6" style="border: 4px solid #f3f3f3; border-top: 4px solid #4f46e5; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite;"></div><h2 class="text-xl font-bold text-gray-800 uppercase">Consultando Gemini ${state.modelVersion || ''}...</h2></div>`;
    }
    else if (state.stage === 'QUIZ') {
        const q = state.currentQuestion;
        app.innerHTML = `
            <div class="fade-in bg-white p-8 rounded-3xl shadow-xl border-b-8 border-indigo-400">
                <h2 class="text-2xl font-bold text-gray-800 mb-8 leading-snug">${q.pergunta}</h2>
                <div class="grid gap-4">
                    ${q.alternativas.map((alt, i) => `
                        <button onclick="selecionarResposta(${i})" class="group flex items-center w-full p-5 border-2 border-gray-100 rounded-2xl hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left">
                            <span class="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 group-hover:bg-indigo-600 group-hover:text-white font-black mr-4">${String.fromCharCode(65 + i)}</span>
                            <span class="text-gray-700 font-semibold flex-1">${alt}</span>
                        </button>
                    `).join('')}
                </div>
            </div>`;
    }
    else if (state.stage === 'FEEDBACK') {
        const q = state.currentQuestion;
        const isCorrect = q.userAnswer === q.correta;
        app.innerHTML = `
            <div class="fade-in space-y-6 text-center">
                <div class="bg-white p-8 rounded-3xl shadow-xl border-b-8 ${isCorrect ? 'border-green-500' : 'border-red-500'}">
                    <h2 class="text-3xl font-black ${isCorrect ? 'text-green-600' : 'text-red-600'}">${isCorrect ? '✨ ACERTOU!' : '⚡ QUASE LÁ!'}</h2>
                    <p class="mt-4 text-gray-700"><strong>Dica:</strong> ${q.explicacao}</p>
                </div>
                <button onclick="gerarQuestaoIA()" class="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl shadow-lg">PRÓXIMA QUESTÃO</button>
            </div>`;
    }
}

async function fetchFromGemini(modelId, prompt) {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${state.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
        })
    });
    return response;
}

async function gerarQuestaoIA() {
    if (state.stage === 'START') {
        state.nivelEstudante = document.getElementById('nivel').value;
        state.assuntoRevisao = document.getElementById('assunto').value;
    }
    if (!state.nivelEstudante || !state.assuntoRevisao) return alert("Preencha tudo! 🤖");

    state.stage = 'LOADING';
    render();

    const prompt = `Atue como professor. Gere uma questão de múltipla escolha sobre "${state.assuntoRevisao}" para o nível "${state.nivelEstudante}". Responda APENAS um JSON: {"pergunta":"...","alternativas":["...","...","...","..."],"correta":0,"explicacao":"...","resumo":"..."}`;

    // Lista de modelos que aparecem com cota na sua imagem
    const modelosDisponiveis = ['gemini-3.1-flash-lite', 'gemini-2.5-flash-lite', 'gemini-3-flash'];

    try {
        let success = false;
        for (const modelId of modelosDisponiveis) {
            state.modelVersion = modelId;
            const response = await fetchFromGemini(modelId, prompt);
            
            if (response.ok) {
                const data = await response.json();
                const textoRaw = data.candidates[0].content.parts[0].text;
                state.currentQuestion = JSON.parse(textoRaw);
                state.stage = 'QUIZ';
                success = true;
                break; 
            }
        }

        if (!success) {
            throw new Error("Nenhum dos modelos da sua cota respondeu. Verifique se a chave está ativa no Google Cloud.");
        }
        
    } catch (error) {
        console.error("Erro Final:", error);
        alert(`Erro: ${error.message}`);
        state.stage = 'START';
    }
    render();
}

function selecionarResposta(index) {
    state.currentQuestion.userAnswer = index;
    state.stage = 'FEEDBACK';
    render();
}

document.addEventListener('DOMContentLoaded', render);
