const DEEPSEEK_API_KEY = "sk-e1741a83372748cca3e0b04f737d2dca";
const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

// Função para enviar mensagens à API do DeepSeek
async function sendToDeepSeek(message, systemPrompt = "") {
    try {
        const response = await fetch(DEEPSEEK_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: [
                    {
                        role: "system",
                        content: systemPrompt || "Você é um especialista em precificação para MEI e ME da Valluo. Responda de forma prática e acolhedora."
                    },
                    {
                        role: "user",
                        content: message
                    }
                ],
                temperature: 0.7
            })
        });

        if (!response.ok) throw new Error('Erro na API');
        const data = await response.json();
        return data.choices?.[0]?.message?.content || "Desculpe, não consegui processar sua solicitação.";
    } catch (error) {
        console.error("Erro ao chamar a API:", error);
        return "Desculpe, houve um erro ao processar sua solicitação. Tente novamente mais tarde.";
    }
}

// Função para analisar os dados e gerar dicas
async function analisarEGerarDicas(dados) {
    const mensagem = `
    Analise os seguintes dados de precificação e forneça 3 dicas práticas para melhorar o faturamento:
    
    Custos Fixos: ${JSON.stringify(dados.custosFixos)}
    Custos Variáveis: ${JSON.stringify(dados.custosVariaveis)}
    Taxas: ${JSON.stringify(dados.taxas)}
    Preço por Hora: R$ ${dados.precoHora}
    Valor do Serviço: R$ ${dados.valorServico}
    Horas do Projeto: ${dados.horasProjeto}
    `;

    const systemPrompt = `
    Você é um consultor especializado em precificação da Valluo.
    Analise os dados fornecidos e dê 3 dicas práticas e objetivas para melhorar o faturamento.
    Foque em:
    1. Otimização de custos
    2. Estratégias de precificação
    3. Eficiência operacional
    
    Formate a resposta em HTML com classes do Tailwind CSS.
    `;

    return await sendToDeepSeek(mensagem, systemPrompt);
}

function createChatUI(dicasIniciais = "") {
    return `
        <div id="ia-chat" class="mt-6 bg-white p-4 rounded-lg shadow-md border border-purple-100">
            <div class="flex items-center gap-2 mb-4">
                <img src="https://amarilha.github.io/valluo/fronend/public/sharedIA.png" alt="Valluo IA" class="w-8 h-8">
                <h3 class="font-bold text-purple-700">Consultoria Valluo IA</h3>
            </div>
            
            ${dicasIniciais ? `
                <div class="mb-6 p-4 bg-purple-50 rounded-lg">
                    <h4 class="font-semibold text-purple-700 mb-2">Análise e Recomendações:</h4>
                    ${dicasIniciais}
                </div>
            ` : ''}
            
            <div id="ia-messages" class="mb-4 max-h-60 overflow-y-auto space-y-2"></div>
            <div class="flex gap-2">
                <input id="ia-input" type="text" 
                    placeholder="Tire suas dúvidas sobre as recomendações..." 
                    class="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500">
                <button id="ia-send" class="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition">
                    Enviar
                </button>
            </div>
        </div>
    `;
}

async function initIAChat(dados) {
    const resultDiv = document.getElementById('result');
    if (!resultDiv) return;

    // Primeiro, gera as dicas iniciais
    const dicasIniciais = await analisarEGerarDicas(dados);
    
    if (!document.getElementById('ia-chat')) {
        resultDiv.insertAdjacentHTML('beforeend', createChatUI(dicasIniciais));
        
        document.getElementById('ia-send').addEventListener('click', async () => {
            const input = document.getElementById('ia-input');
            const message = input.value.trim();
            if (!message) return;

            const messagesDiv = document.getElementById('ia-messages');
            messagesDiv.innerHTML += `<div class="text-right"><p class="inline-block bg-purple-100 rounded-lg px-3 py-1">${message}</p></div>`;
            
            input.value = '';
            messagesDiv.innerHTML += `<div class="text-left"><p class="inline-block bg-gray-100 rounded-lg px-3 py-1">Analisando sua dúvida...</p></div>`;
            messagesDiv.scrollTop = messagesDiv.scrollHeight;

            const response = await sendToDeepSeek(
                `Contexto dos dados do usuário: ${JSON.stringify(dados)}\n\nPergunta do usuário: ${message}`,
                "Você é um consultor da Valluo. Use os dados do contexto para responder a pergunta do usuário de forma específica e personalizada."
            );
            
            messagesDiv.lastElementChild.innerHTML = `<p class="inline-block bg-gray-100 rounded-lg px-3 py-1">${response}</p>`;
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        });
    }
}

export { initIAChat };
