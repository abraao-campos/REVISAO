// ===============================================
// ARQUIVO: app.js
// Projeto: CANTINHO DO ESTUDO
// Lógica de Integração com Gemini API
// ===============================================

const state = {
    stage: 'START', // START, LOADING, QUIZ, FEEDBACK
    nivelEstudante: '',
    assuntoRevisao: '',
    currentQuestion: null,
    // Sua chave de API configurada
    GEMINI_API_KEY: 'AIzaSyAyzWOfGynU44d8WfLnQaZXgzBK9LcMo-8' 
};

/**
 * Função de renderização: Constrói a interface dinamicamente
 */
function render() {
    const app = document.getElementById('app');
    
    // TELA INICIAL: Menu de Entrada
    if (state.stage === 'START') {
        app.innerHTML = `
            <div class="fade-in bg-white p-8 rounded-3xl shadow-xl border-b-8 border-indigo-500">
                <h1 class="text-4xl font-black text-center text-indigo-900 mb-8 tracking-tight">
                    📚 CANTINHO DO ESTUDO
                </h1>
                
                <div class="space-y-6">
                    <div>
                        <label class="block text-sm font-bold text-gray-600 mb-2 uppercase tracking-wide">
                            🎓 Nível do Estudante
                        </label>
                        <input type="text" id="nivel" placeholder="Ex: 3º ano do ensino fundamental" 
                            class="w-full p-4 border-2 border-gray-100 bg-gray-50 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition"
                            value="${state.nivelEstudante}">
                    </div>

                    <div>
                        <label class="block text-sm font-bold text-gray-600 mb-2 uppercase tracking-wide">
                            📖 O que vamos revisar?
                        </label>
                        <input type="text" id="assunto" placeholder="Ex: História do Brasil ou Frações" 
                            class="w-full p-4 border-2 border-gray-100 bg-gray-50 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition"
                            value="${state.assuntoRevisao}">
                    </div>

                    <button onclick="gerarQuestaoIA()" 
                        class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-2xl shadow-lg shadow-indigo-100 transition-all active:scale-95 flex items-center justify-center gap-3 text-lg">
                        🤖 LANÇAR DESAFIO
                    </button>
                </div>
            </div>
        `;
    } 

    // TELA DE CARREGAMENTO
    else if (state.stage === 'LOADING') {
        app.innerHTML = `
            <div class="fade-in flex flex-col items-center justify-center p-12 bg-white rounded-3xl shadow-xl border-b-8 border-gray-200">
                <div class="loader mb-6"></div>
                <h2 class="text-xl font-bold text-gray-800">Preparando o desafio...</h2>
                <p class="text-gray-500 mt-2 text-center font-medium">O professor robô está pensando na questão! 🤖</p>
            </div>
        `;
    }

    // TELA DA QUESTÃO (QUIZ)
    else if (state.stage === 'QUIZ') {
        const q = state.currentQuestion;
        app.innerHTML = `
            <div class="fade-in bg-white p-8 rounded-3xl shadow-xl border-b-8 border-indigo-400">
                <div class="flex justify-between items-center mb-6">
                    <span class="bg-indigo-100 text-indigo-700 text-xs font-black px-4 py-1.5 rounded-full uppercase">
                        📝 ${state.assuntoRevisao}
                    </span>
                    <span class="text-gray-400 text-xs font-bold uppercase">${state.nivelEstudante}</span>
                </div>
                
                <h2 class="text-2xl font-bold text-gray-800 mb-8 leading-snug">${q.pergunta}</h2>

                <div class="grid gap-4">
                    ${q.alternativas.map((alt, i) => `
                        <button onclick="selecionarResposta(${i})" 
                            class="group flex items-center w-full p-5 border-2 border-gray-100 rounded-2xl hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left">
                            <span class="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 group-hover:bg-indigo-600 group-hover:text-white font-black mr-4 transition-colors">
                                ${String.fromCharCode(65 + i)}
                            </span>
                            <span class="text-gray-700 font-semibold flex-1">${alt}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // TELA DE FEEDBACK E RESUMO
    else if (state.stage === 'FEEDBACK') {
        const q = state.currentQuestion;
        const isCorrect = q.userAnswer === q.correta;

        app.innerHTML = `
            <div class="fade-in space-y-6">
                <div class="bg-white p-8 rounded-3xl shadow-xl border-b-8 ${isCorrect ? 'border-green-500' : 'border-red-500'}">
                    <div class="flex items-center mb-6">
                        <div class="w-14 h-14 flex items-center justify-center rounded-2xl ${isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'} mr-4 font-bold text-2xl">
                            ${isCorrect ? '✨' : '⚡'}
                        </div>
                        <h2 class="text-3xl font-black ${isCorrect ? 'text-green-600' : 'text-red-600'}">
                            ${isCorrect ? 'Acertou!' : 'Quase lá!'}
                        </h2>
                    </div>
                    
                    <div class="mb-6">
                        <p class="text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">✅ Resposta correta:</p>
                        <p class="text-lg font-bold text-gray-800 bg-gray-50 p-4 rounded-xl border border-gray-100">
                            ${q.alternativas[q.correta]}
                        </p>
                    </div>

                    <div class="space-y-4">
                        <h3 class="font-black text-gray-800 flex items-center uppercase text-xs tracking-widest">
                            💡 Por que é essa?
                        </h3>
                        <p class="text-gray-600 leading-relaxed font-medium">${q.explicacao}</p>
                    </div>
                </div>

                <div class="bg-indigo-600 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
                    <div class="relative z-10">
                        <h3 class="font-black text-indigo-200 mb-3 flex items-center uppercase text-xs tracking-widest">
                            📌 Resumo para aprender
                        </h3>
                        <p class="text-white leading-relaxed text-lg font-medium">${q.resumo}</p>
                    </div>
                    <div class="absolute -right-5 -bottom-5 w-32 h-32 bg-indigo-500 rounded-full opacity-30"></div>
                </div>

                <div class="flex flex-col sm:flex-row gap-4">
                    <button onclick="gerarQuestaoIA()" class="flex-1 bg-indigo-600 text-white font-black py-5 rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95 flex items-center justify-center gap-2">
                        ➕ FAZER MAIS UMA
                    </button>
                    <button onclick="voltarInicio()" class="flex-1 bg-white text-gray-400 font-bold py-5 rounded-2xl border-2 border-gray-100 hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
                        🏠 VOLTAR
                    </button>
                </div>
            </div>
        `;
    }
}

// --- LÓGICA DE CHAMADA À API ---

async function gerarQuestaoIA() {
    if (state.stage === 'START') {
        state.nivelEstudante = document.getElementById('nivel').value;
        state.assuntoRevisao = document.getElementById('assunto').value;
    }

    if (!state.nivelEstudante || !state.assuntoRevisao) {
        alert("Ops! Preencha os campos para o robô lançar o desafio! 🤖");
        return;
    }

    state.stage = 'LOADING';
    render();

    const prompt = `Atue como um professor experiente e didático. Gere uma questão de múltipla escolha inédita para um aluno do nível "${state.nivelEstudante}" sobre o tema "${state.assuntoRevisao}".
    A resposta DEVE ser um objeto JSON puro com esta estrutura exata:
    {
      "pergunta": "texto da pergunta",
      "alternativas": ["opção 0", "opção 1", "opção 2", "opção 3"],
      "correta": 0,
      "explicacao": "explicação pedagógica clara",
      "resumo": "resumo breve ou quadro mental do conteúdo abordado"
    }`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${state.GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { responseMimeType: "application/json" }
            })
        });

        const data = await response.json();
        if (data.candidates && data.candidates[0].content.parts[0].text) {
            state.currentQuestion = JSON.parse(data.candidates[0].content.parts[0].text);
            state.stage = 'QUIZ';
        } else {
            throw new Error("Erro na resposta");
        }
    } catch (error) {
        console.error("Erro:", error);
        alert("O professor robô teve um curto-circuito! Verifique sua conexão ou chave API. ⚡");
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