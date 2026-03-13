// ===============================================
// ARQUIVO: app.js
// Projeto: CANTINHO DO ESTUDO
// Versão: 7.0 - Final de Produção (Resiliência Total)
// ===============================================

const state = {
    stage: 'START',
    nivelEstudante: '',
    assuntoRevisao: '',
    currentQuestion: null,
    // Substitua pela sua nova chave se o erro 403 persistir
    GEMINI_API_KEY: 'AIzaSyAyzWOfGynU44d8WfLnQaZXgzBK9LcMo-8' 
};

/**
 * Renderização Principal
 */
function render() {
    const app = document.getElementById('app');
    
    if (state.stage === 'START') {
        app.innerHTML = `
            <div class="fade-in bg-white p-8 rounded-3xl shadow-xl border-b-8 border-indigo-500">
                <h1 class="text-4xl font-black text-center text-indigo-900 mb-8 tracking-tight uppercase">📚 Cantinho do Estudo</h1>
                <div class="space-y-6">
                    <div>
                        <label class="block text-sm font-bold text-gray-600 mb-2 uppercase tracking-wide text-center">🎓 Nível do Estudante</label>
                        <input type="text" id="nivel" placeholder="Ex: 5º ano / Ensino Médio" class="w-full p-4 border-2 border-gray-100 bg-gray-50 rounded-2xl focus:border-indigo-500 outline-none transition" value="${state.nivelEstudante}">
                    </div>
                    <div>
                        <label class="block text-sm font-bold text-gray-600 mb-2 uppercase tracking-wide text-center">📖 O que vamos revisar?</label>
                        <input type="text" id="assunto" placeholder="Ex: Frações / História do Brasil" class="w-full p-4 border-2 border-gray-100 bg-gray-50 rounded-2xl focus:border-indigo-500 outline-none transition" value="${state.assuntoRevisao}">
                    </div>
                    <button onclick="gerarQuestaoIA()" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3 text-lg">
                        🤖 GERAR DESAFIO
                    </button>
                </div>
            </div>`;
    } 
    else if (state.stage === 'LOADING') {
        app.innerHTML = `
            <div class="fade-in flex flex-col items-center justify-center p-12 bg-white rounded-3xl shadow-xl border-b-8 border-gray-200">
                <div class="loader mb-6" style="border: 4px solid #f3f3f3; border-top: 4px solid #4f46e5; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite;"></div>
                <h2 class="text-xl font-bold text-gray-800 text-center uppercase tracking-tighter">O Robô está criando sua questão...</h2>
            </div>`;
    }
    else if (state.stage === 'QUIZ') {
        const q = state.currentQuestion;
        app.innerHTML = `
            <div class="fade-in bg-white p-8 rounded-3xl shadow-xl border-b-8 border-indigo-400">
                <div class="flex justify-between items-center mb-6"><span class="bg-indigo-100 text-indigo-700 text-xs font-black px-4 py-1.5 rounded-full uppercase">📝 ${state.assuntoRevisao}</span></div>
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
            <div class="fade-in space-y-6">
                <div class="bg-white p-8 rounded-3xl shadow-xl border-b-8 ${isCorrect ? 'border-green-500' : 'border-red-500'}">
                    <div class="flex items-center mb-6 text-3xl font-black ${isCorrect ? 'text-green-600' : 'text-red-600'}">
                        <span>${isCorrect ? '✨' : '⚡'}</span> ${isCorrect ? 'Acertou!' : 'Quase lá!'}
                    </div>
                    <div class="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <p class="text-xs font-black text-gray-400 uppercase mb-1">A resposta correta era:</p>
                        <p class="text-lg font-bold text-gray-800">${q.alternativas[q.correta]}</p>
                    </div>
                    <p class="text-gray-700"><strong>Dica:</strong> ${q.explicacao}</p>
                </div>
                <div class="bg-indigo-600 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
                    <h3 class="font-black text-indigo-200 mb-2 uppercase text-xs">📌 Resumo do Especialista</h3>
                    <p class="text-white text-lg font-medium leading-relaxed">${q.resumo}</p>
                </div>
                <div class="flex gap-4">
                    <button onclick="gerarQuestaoIA()" class="flex-1 bg-indigo-600 text-white font-black py-5 rounded-2xl hover:bg-indigo-700 transition-all">➕ NOVO DESAFIO</button>
                    <button onclick="voltarInicio()" class="flex-1 bg-white text-gray-400 font-bold py-5 rounded-2xl border-2 border-gray-100">🏠 INÍCIO</button>
                </div>
            </div>`;
    }
}

/**
 * Chamada à API com Tratamento de Erros 403/404
 */
async function gerarQuestaoIA() {
    if (state.stage === 'START') {
        state.nivelEstudante = document.getElementById('nivel').value;
        state.assuntoRevisao = document.getElementById('assunto').value;
    }
    if (!state.nivelEstudante || !state.assuntoRevisao) return alert("Preencha todos os campos! 🤖");

    state.stage = 'LOADING';
    render();

    const prompt = `Atue como um professor didático. Gere uma questão de múltipla escolha inédita para um aluno do nível "${state.nivelEstudante}" sobre o tema "${state.assuntoRevisao}". Responda APENAS com este JSON: {"pergunta":"...","alternativas":["...","...","...","..."],"correta":0,"explicacao":"...","resumo":"..."}`;

    try {
        // ID técnico "gemini-1.5-flash-latest" é o mais compatível com todas as chaves
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${state.GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { responseMimeType: "application/json" }
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || `Erro ${response.status}`);
        }

        if (data.candidates && data.candidates[0].content.parts[0].text) {
            let jsonString = data.candidates[0].content.parts[0].text;
            // Limpa possíveis marcações de Markdown que quebram o JSON
            jsonString = jsonString.replace(/```json/g, "").replace(/```/g, "").trim();
            
            state.currentQuestion = JSON.parse(jsonString);
            state.stage = 'QUIZ';
        } else {
            throw new Error("A IA não retornou conteúdo válido.");
        }
    } catch (error) {
        console.error("Erro completo da aplicação:", error);
        // Se o erro for 403, avisa especificamente sobre a chave
        const msg = error.message.includes("403") 
            ? "Acesso bloqueado (403). Você precisa gerar uma NOVA chave em um NOVO projeto no Google AI Studio."
            : `Erro: ${error.message}`;
        alert(msg);
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

// Inicia o app ao carregar a página
document.addEventListener('DOMContentLoaded', render);
