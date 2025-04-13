import { getDados } from "../formulas.js";
import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";

const GEMINI_API_KEY = "AIzaSyB6BT3IMAA7m0mz_i7dWDX-ns88u83hbBY";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Variável para manter o histórico da conversa
let chatHistory = [];

async function sendToGemini(message, systemPrompt = "", isInitialAnalysis = false) {
    try {
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            generationConfig: {
                temperature: 0.7,
            }
        });

        if (isInitialAnalysis) {
            chatHistory = [
                {
                    role: "user",
                    parts: [{ text: systemPrompt }]
                },
                {
                    role: "model",
                    parts: [{ text: "Entendido, estou pronto para ajudar com a análise de precificação." }]
                }
            ];
        } else {
            chatHistory.push({
                role: "user",
                parts: [{ text: message }]
            });
        }

        const chat = model.startChat({
            history: chatHistory
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        let responseText = response.text() || "Desculpe, não consegui processar sua solicitação.";
        
        // Remove asteriscos e sanitiza a resposta
        responseText = responseText.replace(/\*/g, '').replace(/```html/g, '').replace(/```/g, '').trim();

        if (!isInitialAnalysis) {
            chatHistory.push({
                role: "model",
                parts: [{ text: responseText }]
            });
        }

        return responseText;
    } catch (error) {
        console.error("Erro ao chamar a API do Gemini:", error);
        return "Desculpe, houve um erro ao processar sua solicitação. Tente novamente mais tarde.";
    }
}

async function analisarEGerarDicas() {
    const dados = getDados();
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
    Regras estritas:
    1. Formate SEMPRE em HTML com classes Tailwind CSS
    2. Nunca use asteriscos (*), traços (-) ou marcadores não HTML
    3. Use apenas <ol> ou <ul> para listas
    4. Estruture assim:
    <div class="grid grid-cols-1 gap-4">
      <div class="bg-white p-4 rounded-lg shadow">
        <p class="font-bold text-purple-700">1. Título da Dica</p>
        <p>Explicação detalhada...</p>
        <ol class="list-decimal pl-5 mt-2">
          <li>Item específico</li>
        </ol>
      </div>
    </div>
    5. Seja conciso (máximo 150 palavras no total)
    6. Nunca inclua a palavra "HTML" na resposta
    `;

    return await sendToGemini(mensagem, systemPrompt, true);
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

async function initIAChat() {
    const resultDiv = document.getElementById('result');
    if (!resultDiv) return;

    const dicasIniciais = await analisarEGerarDicas();

    if (!document.getElementById('ia-chat')) {
        resultDiv.insertAdjacentHTML('beforeend', createChatUI(dicasIniciais));

        document.getElementById('ia-send').addEventListener('click', async (e) => {
            e.preventDefault();
            const input = document.getElementById('ia-input');
            const message = input.value.trim();
            if (!message) return;

            const messagesDiv = document.getElementById('ia-messages');
            messagesDiv.innerHTML += `<div class="text-right"><p class="inline-block bg-purple-100 rounded-lg px-3 py-1">${message}</p></div>`;

            input.value = '';
            messagesDiv.innerHTML += `<div class="text-left"><p class="inline-block bg-gray-100 rounded-lg px-3 py-1">Analisando sua dúvida...</p></div>`;
            messagesDiv.scrollTop = messagesDiv.scrollHeight;

            const dados = getDados();
            const response = await sendToGemini(
                `Contexto dos dados do usuário: ${JSON.stringify(dados)}\n\nPergunta do usuário: ${message}`,
                `Você é um consultor financeiro da Valluo. Regras estritas:
                1. Formate SEMPRE em HTML com classes Tailwind
                2. Proibido usar *, -, → ou qualquer marcador não HTML
                3. Use esta estrutura:
                <div class="bg-white p-4 rounded-lg shadow">
                  <p class="font-bold text-purple-700 mb-2">Resposta</p>
                  <div class="space-y-2">
                    <p>Texto principal...</p>
                    <ul class="list-disc pl-5">
                      <li>Item de lista</li>
                    </ul>
                  </div>
                </div>
                4. Seja específico com os dados do usuário:
                   - Preço atual: R$ ${dados.precoHora}/hora
                   - Custos: R$ ${dados.custosFixos} fixos
                5. Máximo 100 palavras
                6. Nunca mostre códigos ou a palavra "HTML"`
            );

            messagesDiv.lastElementChild.innerHTML = response;
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        });
    }
}

export { initIAChat };