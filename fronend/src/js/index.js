document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const investmentTypeRadios = document.querySelectorAll('input[name="investmentType"]');
    const meiInfo = document.getElementById('mei-info');
    const emeInfo = document.getElementById('eme-info');
    const grossIncomeInput = document.getElementById('grossIncome');
    const fixedCostInput = document.getElementById('fixedCost');
    const variableCostInput = document.getElementById('variableCost');
    const calculateBtn = document.getElementById('calculateBtn');
    const resultDiv = document.getElementById('result');

    // Prevenir comportamento padrão do formulário
    document.querySelector('form').addEventListener('submit', function(e) {
        e.preventDefault();
    });

    // Mostrar campos MEI ou ME
    investmentTypeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            meiInfo.classList.toggle('hidden', this.value !== 'MEI');
            emeInfo.classList.toggle('hidden', this.value === 'MEI');
        });
    });

    // Calcular impostos do ME (Simples Nacional - tabela simplificada)
    function calculateMETax(grossIncome) {
        if (grossIncome <= 180000) return grossIncome * 0.06;
        if (grossIncome <= 360000) return grossIncome * 0.112;
        return grossIncome * 0.16;
    }

    // Função para exibir resultados
    function showResults(investmentType, fixedCost, variableCost, taxCost, minimumPrice) {
        const resultContent = `
            <div class="bg-purple-50 p-4 rounded-lg mb-4">
                <h3 class="font-bold text-lg text-purple-700 mb-2">PREÇO MÍNIMO RECOMENDADO</h3>
                <p class="text-2xl font-bold text-gray-800">R$ ${minimumPrice.toFixed(2).replace('.', ',')}</p>
                <p class="text-sm text-gray-600 mt-2">*Inclui custos, taxas (${investmentType}) e 20% de margem.</p>
                <hr class="my-2 border-gray-200">
                <ul class="text-sm text-gray-600 list-disc pl-5">
                    <li>Custo Fixo: R$ ${fixedCost.toFixed(2).replace('.', ',')}</li>
                    <li>Custo Variável: R$ ${variableCost.toFixed(2).replace('.', ',')}</li>
                    <li>Taxas: R$ ${taxCost.toFixed(2).replace('.', ',')}</li>
                </ul>
            </div>
        `;

        const existingChat = document.getElementById('ia-chat');
        if (existingChat) {
            existingChat.insertAdjacentHTML('beforebegin', resultContent);
        } else {
            resultDiv.innerHTML = resultContent;
            openIAChat();
        }
    }

    // Calcular preço mínimo
    calculateBtn.addEventListener('click', function() {
        const investmentType = document.querySelector('input[name="investmentType"]:checked').value;
        const fixedCost = parseFloat(fixedCostInput.value.replace(',', '.')) || 0;
        const variableCost = parseFloat(variableCostInput.value.replace(',', '.')) || 0;
        
        let taxCost = 0;
        
        if (investmentType === 'MEI') {
            taxCost = 80.90;
        } else {
            const grossIncome = parseFloat(grossIncomeInput.value.replace(',', '.')) || 0;
            taxCost = calculateMETax(grossIncome);
        }

        const totalCost = fixedCost + variableCost + taxCost;
        const minimumPrice = totalCost * 1.2;

        showResults(investmentType, fixedCost, variableCost, taxCost, minimumPrice);
    });

    // Formatar inputs monetários
    [fixedCostInput, variableCostInput, grossIncomeInput].forEach(input => {
        input.addEventListener('blur', function() {
            const value = parseFloat(this.value.replace(',', '.')) || 0;
            this.value = value.toFixed(2).replace('.', ',');
        });
    });
});

// Configurações da API (para frontend, considere usar um backend proxy)

const DEEPSEEK_API_KEY = "sk-e1741a83372748cca3e0b04f737d2dca"; // Substitua pela sua chave
const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

// Função para enviar mensagens à API do DeepSeek
async function sendToDeepSeek(message) {
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
                        content: "Você é um especialista em precificação para MEI e ME. Responda como a equipe da Valluo, de forma prática e acolhedora."
                    },
                    {
                        role: "user",
                        content: message
                    }
                ],
                temperature: 0.7
            })
        });

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error("Erro ao chamar a API:", error);
        return "Desculpe, houve um erro ao processar sua pergunta. Tente novamente.";
    }
}

// Abre o chat com a IA
function openIAChat() {
    const resultDiv = document.getElementById('result');
    
    // Verifica se o chat já existe
    if (!document.getElementById('ia-chat')) {
        resultDiv.innerHTML += `
            <div id="ia-chat" class="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div class="flex items-center gap-2 mb-2">
                    <img src="https://amarilha.github.io/valluo/fronend/public/sharedIA.png" alt="Valluo" class="w-6 h-6 rounded-full">
                    <p class="font-semibold text-gray-700">Valluo:</p>
                </div>
                <div id="chat-messages">
                    <p class="text-gray-600">Olá! Sou o assistente de precificação da Valluo. Pergunte-me como melhorar seus cálculos ou reduzir custos!</p>
                </div>
                <div class="mt-4 flex gap-2">
                    <input type="text" id="user-question" placeholder="Digite sua dúvida..." class="flex-1 p-2 border rounded">
                    <button type="button" id="send-question-btn" class="bg-purple-600 text-white px-4 py-2 rounded">Enviar</button>
                </div>
            </div>
        `;

        // Adiciona o event listener ao novo botão
        document.getElementById('send-question-btn').addEventListener('click', sendQuestion);
    }
}

// Envia a pergunta para a API e exibe a resposta
async function sendQuestion() {
    const questionInput = document.getElementById('user-question');
    const question = questionInput.value.trim();
    if (!question) return;

    const chatMessages = document.getElementById('chat-messages');
    
    // Exibe a pergunta do usuário
    chatMessages.innerHTML += `
        <div class="mt-4 text-right">
            <p class="inline-block bg-purple-100 text-purple-800 rounded-lg px-4 py-2">${question}</p>
        </div>
    `;

    // Exibe "Digitando..."
    chatMessages.innerHTML += `
        <div class="mt-2 flex items-start gap-2">
            <img src="https://amarilha.github.io/valluo/fronend/public/sharedIA.png" alt="Valluo" class="w-6 h-6 rounded-full mt-1">
            <p class="text-gray-600 italic">Digitando...</p>
        </div>
    `;

    // Chama a API do DeepSeek
    const iaResponse = await sendToDeepSeek(question);

    // Remove "Digitando..." e exibe a resposta
    chatMessages.lastChild.remove();
    chatMessages.innerHTML += `
        <div class="mt-2 flex items-start gap-2">
            <img src="https://amarilha.github.io/valluo/fronend/public/sharedIA.png" alt="Valluo" class="w-6 h-6 rounded-full mt-1">
            <p class="text-gray-600">${iaResponse}</p>
        </div>
    `;

    questionInput.value = "";
    questionInput.focus();
}

// Remove a declaração global do sendQuestion
// window.sendQuestion = sendQuestion; // Não é mais necessário
