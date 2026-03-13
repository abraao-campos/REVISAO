// ===============================================
// ARQUIVO: app.js
// FOCO: Gemini 3.1 Flash Lite (O único que aparece com cota 15 para você)
// ===============================================

const state = {
    stage: 'START',
    nivelEstudante: '',
    assuntoRevisao: '',
    currentQuestion: null,
    GEMINI_API_KEY: 'AIzaSyBNrS-c7SHpdifjQir-qFBydNfg3q5eNuQ' 
};

function render() {
    const app = document.getElementById('app');
    if (!app) return;

    if (state.stage === 'START') {
        app.innerHTML = `
            <div class="fade-in bg-white p-8 rounded-3xl shadow-xl border-b-8 border-indigo-500">
                <h1 class="text-4xl font-black text-center text-indigo-900 mb-8 uppercase tracking-tight">📚 Revisão 3.1 Lite</h1>
                <div class="space-y-6">
                    <input type="text" id="nivel" placeholder="Nível (Ex: 9º ano)" class="w-full p-4 border-2 border-gray-100 bg-gray-50 rounded-2xl outline-none focus:border-indigo-500 transition" value="${state.nivelEstudante}">
                    <input type="text" id="assunto" placeholder="Assunto (Ex: Biologia)" class="w-full p-4 border-2 border-gray-100 bg-gray-50 rounded-2xl outline-none focus:border-indigo-500 transition" value="${state.assuntoRevisao}">
                    <button onclick="gerarQuestaoIA()" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-2xl shadow-lg transition-all active:scale-95 text-lg">
                        🚀 GERAR COM 3.1 FLASH LITE
                    </button>
                </div>
            </div>`;
    } 
    else if (state.stage === 'LOADING') {
        app.innerHTML = `
            <div class="fade-in flex flex-col items-center justify-center p-12 bg-white rounded-3xl shadow-xl">
                <div class="loader mb-6" style="border: 4px solid #f3f3f3; border-top: 4px solid #4f46e5; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite;"></div>
                <h2 class="text-xl font-bold text-gray-800 uppercase tracking-widest text-center">Acessando Modelo 3.1 Lite...</h2>
            </div>`;
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
                    <h2 class="text-3xl font-black ${isCorrect ? 'text-green-600' : 'text-red-600'}">${isCorrect ? '✨ ACERTOU!' : '⚡ ERROU!'}</h2>
                    <p class="mt-4 text-gray-700"><strong>Dica:</strong> ${q.explicacao}</p>
                </div>
                <button onclick="gerarQuestaoIA()" class="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl shadow-lg hover:bg-indigo-700 transition-all">PRÓXIMA QUESTÃO</button>
            </div>`;
    }
}

async function gerarQuestaoIA() {
    if (state.stage === 'START') {
        state.nivelEstudante = document.getElementById('nivel').value;
        state.assuntoRevisao = document.getElementById('assunto').value;
    }
    if (!state.nivelEstudante || !state.assuntoRevisao) return alert("Preencha os campos!");

    state.stage = 'LOADING';
    render();

    const promptText = `Gere uma questão de múltipla escolha para o nível ${state.nivelEstudante} sobre o assunto ${state.assuntoRevisao}. Responda apenas o JSON puro, sem markdown, com as chaves: pergunta, alternativas (array com 4), correta (índice 0-3), explicacao e resumo.`;

    try {
        // ID EXATO: gemini-3.1-flash-lite
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${state.GEMINI_API_KEY}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    role: "user", // O modelo 3.1 EXIGE a definição do role
                    parts: [{ text: promptText }]
                }]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || "Erro desconhecido no modelo 3.1");
        }

        let texto = data.candidates[0].content.parts[0].text;
        // Limpeza agressiva de markdown
        texto = texto.replace(/```json|```/g, "").trim();
        
        state.currentQuestion = JSON.parse(texto);
        state.stage = 'QUIZ';
        
    } catch (error) {
        console.error("Erro no Gemini 3.1:", error);
        alert(`Erro no Modelo 3.1: ${error.message}`);
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
