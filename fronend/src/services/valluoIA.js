import { getDados } from "../services/formulas.js";
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
      <div class="p-4 rounded-lg bg-gray-800 border border-gray-700 text-white">
        <p class="font-bold text-purple-300">1. Título da Dica</p>
        <p class="text-gray-300">Explicação detalhada...</p>
        <ol class="list-decimal pl-5 mt-2 text-gray-300">
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
        <div id="ia-chat" class="mt-6 p-6 rounded-xl glass-effect shadow-lg">
            <div class="flex items-center gap-3 mb-4">
                <img src="../assets/images/sharedIA.png" alt="Valluo IA" class="w-8 h-8">
                <h3 class="font-bold text-purple-300">Consultoria Valluo IA</h3>
            </div>

            ${dicasIniciais ? `
                <div class="mb-6 p-4 rounded-lg bg-gray-800 border border-gray-700">
                    <h4 class="font-semibold text-purple-300 mb-2">Análise e Recomendações:</h4>
                    ${dicasIniciais}
                </div>
            ` : ''}

            <div id="ia-messages"  class="mb-4 max-h-60 overflow-y-auto space-y-3 pr-2" style="scrollbar-width: none; -ms-overflow-style: none;"></div>
            <div class="flex gap-3">
                <input id="ia-input" type="text"
                    placeholder="Tire suas dúvidas sobre as recomendações..."
                    class="flex-1 p-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-300 transition">
                <button id="ia-send" class="gradient-btn text-white px-4 py-2 rounded-lg hover-scale">
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
            messagesDiv.innerHTML += `<div class="text-right"><p class="inline-block bg-purple-900 rounded-lg px-3 py-2 text-white">${message}</p></div>`;

            input.value = '';
            const iaPlaceholderId = `ia-response-${Date.now()}`;
            messagesDiv.innerHTML += `
              <div class="text-left" id="${iaPlaceholderId}">
                <p class="inline-block bg-gray-800 rounded-lg px-3 py-2 text-gray-300">Analisando sua dúvida...</p>
              </div>`;
            messagesDiv.scrollTop = messagesDiv.scrollHeight;

            const dados = getDados();
            const response = await sendToGemini(
                `Contexto dos dados do usuário: ${JSON.stringify(dados)}\n\nPergunta do usuário: ${message}`,
                `Você é um consultor financeiro da Valluo. Regras estritas:
                1. Formate SEMPRE em HTML com classes Tailwind
                2. Proibido usar *, -, → ou qualquer marcador não HTML
                3. Use esta estrutura:
                <div class="p-4 rounded-lg bg-gray-800 border border-gray-700 text-white">
                  <p class="font-bold text-purple-300 mb-2">Resposta</p>
                  <div class="space-y-2">
                    <p class="text-gray-300">Texto principal...</p>
                    <ul class="list-disc pl-5 text-gray-300">
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

            // Se a resposta já está formatada corretamente em <div>, mantenha
            const isHTML = /<[^>]+>/.test(response.trim());

            if (isHTML) {
                messagesDiv.lastElementChild.innerHTML = response;
            } else {
                messagesDiv.lastElementChild.innerHTML = `
                    <div class="text-left">
                        <p class="inline-block bg-gray-800 rounded-lg px-3 py-2 text-gray-300">${response}</p>
                    </div>
                `;
            }
            

            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        });
    }
}

export { initIAChat };
