const state = { stage: 'START', nivelEstudante: '', assuntoRevisao: '', currentQuestion: null };

function render() {
    const app = document.getElementById('app');
    if (!app) return;
    if (state.stage === 'START') {
        app.innerHTML = `<div class="bg-white p-8 rounded-3xl shadow-xl border-b-8 border-indigo-500 text-center">
            <h1 class="text-4xl font-black text-indigo-900 mb-8 uppercase">📚 Revisão 3.1</h1>
            <input type="text" id="nivel" placeholder="Nível" class="w-full p-4 mb-4 border-2 rounded-2xl outline-none focus:border-indigo-500">
            <input type="text" id="assunto" placeholder="Assunto" class="w-full p-4 mb-6 border-2 rounded-2xl outline-none focus:border-indigo-500">
            <button onclick="gerarQuestaoIA()" class="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl shadow-lg">🚀 GERAR DESAFIO</button>
        </div>`;
    } else if (state.stage === 'LOADING') {
        app.innerHTML = `<div class="p-12 text-center bg-white rounded-3xl shadow-xl"><div class="loader mb-6"></div><h2 class="font-bold">CONECTANDO AO SERVIDOR...</h2></div>`;
    } else if (state.stage === 'QUIZ') {
        const q = state.currentQuestion;
        app.innerHTML = `<div class="bg-white p-8 rounded-3xl shadow-xl border-b-8 border-indigo-400">
            <h2 class="text-2xl font-bold mb-8">${q.pergunta}</h2>
            <div class="grid gap-4">${q.alternativas.map((alt, i) => `
                <button onclick="selecionarResposta(${i})" class="w-full p-5 border-2 rounded-2xl hover:bg-indigo-50 text-left flex items-center">
                    <span class="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 font-black mr-4">${String.fromCharCode(65 + i)}</span>
                    <span>${alt}</span>
                </button>`).join('')}</div>
        </div>`;
    } else if (state.stage === 'FEEDBACK') {
        const q = state.currentQuestion;
        const isCorrect = q.userAnswer === q.correta;
        app.innerHTML = `<div class="text-center space-y-6">
            <div class="bg-white p-8 rounded-3xl shadow-xl border-b-8 ${isCorrect ? 'border-green-500' : 'border-red-500'}">
                <h2 class="text-3xl font-black ${isCorrect ? 'text-green-600' : 'text-red-600'}">${isCorrect ? '✨ ACERTOU!' : '⚡ QUASE LÁ!'}</h2>
                <p class="mt-4">${q.explicacao}</p>
            </div>
            <button onclick="gerarQuestaoIA()" class="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl">PRÓXIMA QUESTÃO</button>
        </div>`;
    }
}

async function gerarQuestaoIA() {
    if (state.stage === 'START') {
        state.nivelEstudante = document.getElementById('nivel').value;
        state.assuntoRevisao = document.getElementById('assunto').value;
    }
    if (!state.nivelEstudante || !state.assuntoRevisao) return alert("Preencha tudo!");
    state.stage = 'LOADING';
    render();

    try {
        // AQUI ESTÁ A MUDANÇA: Chamamos sua API interna, não o Google diretamente
        const response = await fetch('/api/gerar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nivel: state.nivelEstudante, assunto: state.assuntoRevisao })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Erro no servidor");
        state.currentQuestion = data;
        state.stage = 'QUIZ';
    } catch (error) {
        alert("Erro: " + error.message);
        state.stage = 'START';
    }
    render();
}
function selecionarResposta(i) { state.currentQuestion.userAnswer = i; state.stage = 'FEEDBACK'; render(); }
document.addEventListener('DOMContentLoaded', render);
