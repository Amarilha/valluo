document.addEventListener("DOMContentLoaded", function () {
    // Toggle between MEI and ME options
    function toggleImposto() {
        const meiInfo = document.getElementById('meiInfo');
        const meInfo = document.getElementById('meInfo');
        const selectedType = document.querySelector('input[name="impostoType"]:checked').value;
        
        if (selectedType === 'MEI') {
            meiInfo.classList.remove('hidden');
            meInfo.classList.add('hidden');
        } else {
            meiInfo.classList.add('hidden');
            meInfo.classList.remove('hidden');
        }
    }

    // Toggle between service types
    function toggleServiceType() {
        const serviceType = document.querySelector('select[name="serviceType"]').value;
        const geralFields = document.getElementById('geral-fields');
        const devFields = document.getElementById('dev-fields');
        
        if (serviceType === 'geral') {
            geralFields.classList.remove('hidden');
            devFields.classList.add('hidden');
        } else {
            geralFields.classList.add('hidden');
            devFields.classList.remove('hidden');
        }
    }

    // Toggle remuneration input
    function toggleRemunerationInput() {
        const remunerationType = document.querySelector('input[name="remunerationType"]:checked').value;
        const directInput = document.getElementById('directInput');
        const calculateSection = document.getElementById('calculateSection');
        
        directInput.style.display = remunerationType === 'direct' ? 'flex' : 'none';
        calculateSection.style.display = remunerationType === 'direct' ? 'none' : 'block';
    }

    // Format currency input
    function formatarMoeda(input) {
        let valor = input.value.replace(/\D/g, "");
        valor = (parseFloat(valor) / 100).toFixed(2);
        valor = valor.replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        input.value = valor;
    }

    // Remove row
    function removerLinha(botao) {
        const linha = botao.closest('.flex');
        if (linha) linha.remove();
    }

    // Add new row
    function adicionarLinha(containerId, placeholderText, isPercentage = false) {
        const container = document.getElementById(containerId);
        const newRow = document.createElement('div');
        newRow.className = 'flex space-x-2 mb-2';
        
        newRow.innerHTML = `
            <input type="text" class="form-input block w-1/3 sm:text-sm sm:leading-5 rounded-md border-gray-300 focus:border-purple-500 focus:ring focus:ring-purple-500 focus:ring-opacity-50" placeholder="${placeholderText}"> 
            <div class="relative rounded-md shadow-sm w-1/3">
                ${isPercentage ? '' : '<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><span class="text-gray-500 sm:text-sm">R$</span></div>'}
                <input type="text" oninput="formatarMoeda(this)"
                       placeholder="0,00"
                       class="form-input block w-full ${isPercentage ? '' : 'pl-10'} sm:text-sm sm:leading-5 rounded-md border-gray-300 focus:border-purple-500 focus:ring focus:ring-purple-500 focus:ring-opacity-50">
                ${isPercentage ? '<div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><span class="text-gray-500 sm:text-sm">%</span></div>' : ''}
            </div>
            <button type="button" onclick="removerLinha(this)" class="text-red-600 font-bold hover:text-red-700 transition duration-150 ease-in-out">X</button>
        `;
        
        container.parentNode.insertBefore(newRow, container.nextSibling);
    }

    // Initialize event listeners
    document.querySelectorAll('input[name="impostoType"]').forEach(input => {
        input.addEventListener('change', toggleImposto);
    });

    document.querySelector('select[name="serviceType"]').addEventListener('change', toggleServiceType);

    document.querySelectorAll('input[name="remunerationType"]').forEach(input => {
        input.addEventListener('change', toggleRemunerationInput);
    });

    // Add row buttons
    document.querySelectorAll('.add-custo-btn').forEach(button => {
        button.addEventListener('click', function() {
            const containerId = this.getAttribute('data-container');
            const placeholder = this.getAttribute('data-placeholder');
            const isPercentage = this.getAttribute('data-ispercentage') === 'true';
            adicionarLinha(containerId, placeholder, isPercentage);
        });
    });

    // Calculate button
    document.getElementById('calculateBtn').addEventListener('click', function() {
        alert('Cálculo realizado! Implemente a lógica de cálculo aqui.');

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

    // Initialize form state
    toggleImposto();
    toggleServiceType();
    toggleRemunerationInput();
});


// Make functions available globally
window.formatarMoeda = function(input) {
    let valor = input.value.replace(/\D/g, "");
    valor = (parseFloat(valor) / 100).toFixed(2);
    valor = valor.replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    input.value = valor;
};

window.removerLinha = function(botao) {
    const linha = botao.closest('.flex');
    if (linha) linha.remove();
};

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

