// ===============================================
// ARQUIVO: app.js
// Projeto: CANTINHO DO ESTUDO
// Versão: 6.0 - Edição Gemini 2.5 Flash Lite
// ===============================================

const state = {
    stage: 'START',
    nivelEstudante: '',
    assuntoRevisao: '',
    currentQuestion: null,
    GEMINI_API_KEY: 'AIzaSyAyzWOfGynU44d8WfLnQaZXgzBK9LcMo-8' 
};

function render() {
    const app = document.getElementById('app');
    
    if (state.stage === 'START') {
        app.innerHTML = `
            <div class="fade-in bg-white p-8 rounded-3xl shadow-xl border-b-8 border-indigo-500">
                <h1 class="text-4xl font-black text-center text-indigo-900 mb-8 tracking-tight uppercase">📚 Cantinho do Estudo</h1>
                <div class="space-y-6">
                    <div>
                        <label class="block text-sm font-bold text-gray-600 mb-2 uppercase tracking-wide text-center">🎓 Nível do Estudante</label>
                        <input type="text" id="nivel" placeholder="Ex: Ensino Médio" class="w-full p-4 border-2 border-gray-100 bg-gray-50 rounded-2xl focus:border-indigo-500 outline-none transition" value="${state.nivelEstudante}">
                    </div>
                    <div>
                        <label class="block text-sm font-bold text-gray-600 mb-2 uppercase tracking-wide text-center">📖 O que vamos revisar?</label>
                        <input type="text" id="assunto" placeholder="Ex: Genética" class="w-full p-4 border-2 border-gray-100 bg-gray-50 rounded-2xl focus:border-indigo-500 outline-none transition" value="${state.assuntoRevisao}">
                    </div>
                    <button onclick="gerarQuestaoIA()" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3 text-lg">
                        🤖 DESAFIO 2.5 LITE
                    </button>
                </div>
            </div>`;
    } 
    else if (state.stage === 'LOADING') {
        app.innerHTML = `<div class="fade-in flex flex-col items-center justify-center p-12 bg-white rounded-3xl shadow-xl border-b-8 border-gray-200"><div class="loader mb-6"></div><h2 class="text-xl font-bold text-gray-800 text-center uppercase">Acessando Gemini 2.5...</h2></div>`;
    }
    else if (state.stage === 'QUIZ') {
        const q = state.currentQuestion;
        app.innerHTML = `
            <div class="fade-in bg-white p-8 rounded-3xl shadow-xl border-b-8 border-indigo-400">
                <div class="flex justify-between items-center mb-6"><span class="bg-indigo-100 text-indigo-700 text-xs font-black px-4 py-1.5 rounded-full uppercase">📝 ${state.assuntoRevisao}</span></div>
                <h2 class="text-2xl font-bold text-gray-800 mb-8 leading-snug">${q.pergunta}</h2>
                <div class="grid gap-4">
                    ${q.alternativas.map((alt, i) => `<button onclick="selecionarResposta(${i})" class="group flex items-center w-full p-5 border-2 border-gray-100 rounded-2xl hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left"><span class="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 group-hover:bg-indigo-600 group-hover:text-white font-black mr-4">${String.fromCharCode(65 + i)}</span><span class="text-gray-700 font-semibold flex-1">${alt}</span></button>`).join('')}
                </div>
            </div>`;
    }
    else if (state.stage === 'FEEDBACK') {
        const q = state.currentQuestion;
        const isCorrect = q.userAnswer === q.correta;
        app.innerHTML = `
            <div class="fade-in space-y-6">
                <div class="bg-white p-8 rounded-3xl shadow-xl border-b-8 ${isCorrect ? 'border-green-500' : 'border-red-500'}">
                    <div class="flex items-center mb-6 text-3xl font-black ${isCorrect ? 'text-green-600' : 'text-red-600'}"><span>${isCorrect ? '✨' : '⚡'}</span> ${isCorrect ? 'Acertou!' : 'Quase lá!'}</div>
                    <p class="text-gray-700"><strong>Dica:</strong> ${q.explicacao}</p>
                </div>
                <div class="bg-indigo-600 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
                    <h3 class="font-black text-indigo-200 mb-2 uppercase text-xs">📌 Resumo Pedagógico</h3>
                    <p class="text-white text-lg font-medium">${q.resumo}</p>
                </div>
                <div class="flex gap-4">
                    <button onclick="gerarQuestaoIA()" class="flex-1 bg-indigo-600 text-white font-black py-5 rounded-2xl hover:bg-indigo-700 transition-all">➕ NOVO</button>
                    <button onclick="voltarInicio()" class="flex-1 bg-white text-gray-400 font-bold py-5 rounded-2xl border-2 border-gray-100">🏠 INÍCIO</button>
                </div>
            </div>`;
    }
}

async function gerarQuestaoIA() {
    if (state.stage === 'START') {
        state.nivelEstudante = document.getElementById('nivel').value;
        state.assuntoRevisao = document.getElementById('assunto').value;
    }
    if (!state.nivelEstudante || !state.assuntoRevisao) return alert("Preencha tudo! 🤖");

    state.stage = 'LOADING';
    render();

    const prompt = `Atue como professor. Gere uma questão de múltipla escolha sobre "${state.assuntoRevisao}" para nível "${state.nivelEstudante}". Responda APENAS um JSON: {"pergunta":"...","alternativas":["...","...","...","..."],"correta":0,"explicacao":"...","resumo":"..."}`;

    try {
        // ENDPOINT CONFIGURADO PARA O ID TÉCNICO DO GEMINI 2.5 FLASH LITE
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${state.GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { responseMimeType: "application/json" }
            })
        });

        if (!response.ok) {
            throw new Error(`Erro na API: ${response.status}`);
        }

        const data = await response.json();
        const texto = data.candidates[0].content.parts[0].text;
        state.currentQuestion = JSON.parse(texto);
        state.stage = 'QUIZ';
        
    } catch (error) {
        console.error("Erro:", error);
        alert("O modelo 2.5 Flash Lite retornou erro. Isso pode ser uma instabilidade na versão experimental ou erro de ID.");
        state.stage = 'START';
    }
    render();
}

function selecionarResposta(index) {
    state.currentQuestion.userAnswer = index;
    state.stage = 'FEEDBACK';
    render();
}

function voltarInicio() {
    state.stage = 'START';
    render();
}

document.addEventListener('DOMContentLoaded', render);
