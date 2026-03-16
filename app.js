// app.js
const state = { 
    stage: 'START', 
    nivelEnsino: '', 
    anoSelecionado: '', 
    assuntoRevisao: '', 
    currentQuestion: null,
    historicoQuestoes: [] // Guarda as perguntas já feitas nesta sessão
};

function render() {
    const app = document.getElementById('app');
    if (!app) return;

    if (state.stage === 'START') {
        app.innerHTML = `
            <div class="bg-white p-8 rounded-3xl shadow-xl border-b-8 border-indigo-500 max-w-md mx-auto">
                <h1 class="text-3xl font-black text-indigo-900 mb-8 uppercase text-center tracking-tighter">📖 CANTINHO DO ESTUDO</h1>
                
                <div class="mb-6">
                    <label class="block text-sm font-bold text-gray-600 mb-3 ml-1">🎓 Nível de Experiência</label>
                    <div class="flex gap-2">
                        <button onclick="setNivel('FUNDAMENTAL')" class="flex-1 py-3 px-2 rounded-xl border-2 font-bold transition-all ${state.nivelEnsino === 'FUNDAMENTAL' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-gray-50 border-gray-200 text-gray-500'}">FUNDAMENTAL</button>
                        <button onclick="setNivel('MEDIO')" class="flex-1 py-3 px-2 rounded-xl border-2 font-bold transition-all ${state.nivelEnsino === 'MEDIO' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-gray-50 border-gray-200 text-gray-500'}">ENSINO MÉDIO</button>
                    </div>
                </div>

                ${state.nivelEnsino ? `
                <div class="mb-6 animate-fade-in">
                    <label class="block text-sm font-bold text-gray-600 mb-3 ml-1">📅 Qual ano?</label>
                    <select id="ano" onchange="state.anoSelecionado = this.value" class="w-full p-4 bg-gray-50 border-2 border-gray-200 rounded-2xl outline-none focus:border-indigo-500 font-semibold text-gray-700">
                        <option value="">Selecione o ano...</option>
                        ${renderOpcoesAnos()}
                    </select>
                </div>
                ` : ''}

                <div class="mb-8">
                    <label class="block text-sm font-bold text-gray-600 mb-3 ml-1">📝 O que vamos estudar?</label>
                    <input type="text" id="assunto" placeholder="Ex: História nível ENEM, Canguru de Matemática..." 
                        class="w-full p-4 bg-gray-50 border-2 border-gray-200 rounded-2xl outline-none focus:border-indigo-500 font-medium">
                </div>

                <button onclick="iniciarGeracao()" class="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl shadow-lg hover:bg-indigo-700 active:scale-95 transition-all uppercase">Gerar Desafio</button>
            </div>`;
    } else if (state.stage === 'LOADING') {
        app.innerHTML = `
            <div class="p-12 text-center bg-white rounded-3xl shadow-xl max-w-md mx-auto">
                <div class="loader-circle mx-auto mb-6"></div>
                <h2 class="font-black text-indigo-900 text-xl animate-pulse">Gerando Desafios...</h2>
                <p class="text-gray-500 text-sm mt-2 italic">A IA está pesquisando o melhor conteúdo para você.</p>
            </div>`;
    } else if (state.stage === 'QUIZ') {
        const q = state.currentQuestion;
        app.innerHTML = `
            <div class="bg-white p-8 rounded-3xl shadow-xl border-b-8 border-indigo-400 max-w-2xl mx-auto">
                <span class="bg-indigo-100 text-indigo-700 text-xs font-black px-3 py-1 rounded-full uppercase">${state.anoSelecionado} - ${state.assuntoRevisao}</span>
                <h2 class="text-2xl font-bold text-gray-800 my-6">${q.pergunta}</h2>
                <div class="grid gap-4">${q.alternativas.map((alt, i) => `
                    <button onclick="selecionarResposta(${i})" class="w-full p-5 border-2 border-gray-100 rounded-2xl hover:border-indigo-500 hover:bg-indigo-50 text-left flex items-center transition-all group">
                        <span class="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 group-hover:bg-indigo-600 group-hover:text-white font-black mr-4 transition-colors">${String.fromCharCode(65 + i)}</span>
                        <span class="font-semibold text-gray-700">${alt}</span>
                    </button>`).join('')}</div>
            </div>`;
    } else if (state.stage === 'FEEDBACK') {
        const q = state.currentQuestion;
        const isCorrect = q.userAnswer === q.correta;
        app.innerHTML = `
            <div class="max-w-2xl mx-auto space-y-6 pb-12">
                <div class="bg-white p-8 rounded-3xl shadow-xl border-b-8 ${isCorrect ? 'border-green-500' : 'border-red-500'}">
                    <h2 class="text-3xl font-black ${isCorrect ? 'text-green-600' : 'text-red-600'} mb-4">
                        ${isCorrect ? '✨ ACERTOU!' : '⚡ QUASE LÁ!'}
                    </h2>
                    <p class="text-gray-700 font-bold mb-4">A alternativa correta era: ${String.fromCharCode(65 + q.correta)}</p>
                    <div class="p-4 bg-gray-50 rounded-xl border-l-4 border-gray-300 italic text-gray-600 mb-6">
                        "${q.explicacao}"
                    </div>
                    
                    <hr class="my-6 border-gray-100">
                    
                    <h3 class="text-xl font-black text-indigo-900 mb-3">📚 Aprofundamento Técnico</h3>
                    <p class="text-gray-700 leading-relaxed mb-6">${q.resumo_tecnico}</p>
                    
                    <div class="bg-indigo-50 p-6 rounded-2xl border-2 border-dashed border-indigo-200">
                        <h3 class="text-lg font-black text-indigo-700 mb-3">🧠 Esquema Mental</h3>
                        <pre class="whitespace-pre-wrap font-mono text-sm text-indigo-900 leading-tight">${q.esquema_mental}</pre>
                    </div>
                </div>

                <div class="flex gap-4">
                    <button onclick="voltarAoInicio()" class="flex-1 bg-gray-200 text-gray-700 font-black py-5 rounded-2xl shadow-md hover:bg-gray-300 transition-all">INÍCIO</button>
                    <button onclick="gerarQuestaoIA()" class="flex-[2] bg-indigo-600 text-white font-black py-5 rounded-2xl shadow-lg hover:bg-indigo-700 transition-all">PRÓXIMA QUESTÃO ➡</button>
                </div>
            </div>`;
    }
}

function setNivel(nivel) {
    state.nivelEnsino = nivel;
    state.anoSelecionado = '';
    render();
}

function renderOpcoesAnos() {
    const anos = state.nivelEnsino === 'FUNDAMENTAL' 
        ? ['1º ano', '2º ano', '3º ano', '4º ano', '5º ano', '6º ano', '7º ano', '8º ano', '9º ano']
        : ['1º ano EM', '2º ano EM', '3º ano EM'];
    return anos.map(ano => `<option value="${ano}" ${state.anoSelecionado === ano ? 'selected' : ''}>${ano}</option>`).join('');
}

function voltarAoInicio() {
    state.stage = 'START';
    state.historicoQuestoes = []; // Reseta o histórico ao voltar pro início
    render();
}

function iniciarGeracao() {
    state.assuntoRevisao = document.getElementById('assunto').value;
    if (!state.anoSelecionado || !state.assuntoRevisao) {
        return alert("Por favor, selecione o ano e digite o assunto!");
    }
    gerarQuestaoIA();
}

async function gerarQuestaoIA() {
    state.stage = 'LOADING';
    render();

    try {
        const response = await fetch('/api/gerar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                nivel: `${state.nivelEnsino} - ${state.anoSelecionado}`, 
                assunto: state.assuntoRevisao,
                historico: state.historicoQuestoes // Envia o histórico para evitar repetição
            })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Erro no servidor");

        state.currentQuestion = data;
        state.historicoQuestoes.push(data.pergunta); // Salva a pergunta atual no histórico
        state.stage = 'QUIZ';
    } catch (error) {
        alert("Erro: " + error.message);
        state.stage = 'START';
    }
    render();
}

function selecionarResposta(i) { 
    state.currentQuestion.userAnswer = i; 
    state.stage = 'FEEDBACK'; 
    render(); 
}

document.addEventListener('DOMContentLoaded', render);
