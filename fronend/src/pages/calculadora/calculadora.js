import { calcularEExibirResultados, exibirGraficos} from "../../services/formulas.js";
import { initIAChat } from "../../services/valluoIA.js";
import {stateAuth,getUser,stateSignOut,perfil} from "../../services/estadoAuth.js";
let rowCounter = 0; 


// Verifica se o usuário já usou a calculadora
async function checkUsage() {
    const used = localStorage.getItem('calculatorUsed');
    const uid = await stateAuth();
    
    console.log('Calculator used:', used);
    console.log('User ID:', uid);

    if (used && !uid) {
        // User has used calculator but isn't logged in - show modal
        const modalHTML = `
            <div id="calculator-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-gray-800 rounded-xl p-6 max-w-md w-full glass-effect">
                    <h3 class="text-xl font-bold text-white mb-4">Acesso Restrito</h3>
                    <p class="text-gray-300 mb-6">Você já usou a calculadora. Faça login para continuar usando todos os recursos.</p>
                    <div class="flex justify-end gap-4">
                        <button onclick="document.getElementById('calculator-modal').remove()" class="px-4 py-2 text-purple-400 rounded-lg hover:text-purple-300">
                            Fechar
                        </button>
                        <a href="../Auth" class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                            Ir para Login
                        </a>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        return false;
    }

    perfil(uid);
    // Return true if user is authenticated or hasn't used calculator yet
    return true;
}

checkUsage();

function markAsUsed() {
    localStorage.setItem('calculatorUsed', 'true');
    console.log('Calculadora usada');
}

	document.addEventListener("DOMContentLoaded", function () {
    // Função para alternar a visibilidade das informações de imposto (MEI vs ME)
    function toggleImposto() {
        const meiInfo = document.getElementById('meiInfo');
        const meInfo = document.getElementById('meInfo');
        const meiRadio = document.querySelector('input[name="impostoType"]:checked');

        if (meiRadio) {
            meiInfo.style.display = meiRadio.value === 'mei' ? 'block' : 'none';
            meInfo.style.display = meiRadio.value === 'mei' ? 'none' : 'block';
        }
    }

    // Chama a função inicialmente
    toggleImposto();

    // Adiciona evento para quando o usuário mudar a seleção
    document.querySelectorAll('input[name="impostoType"]').forEach(radio => {
        radio.addEventListener('change', toggleImposto);
    });

    // Função para alternar os campos de tipo de serviço (Geral vs Desenvolvedor)
    function toggleServiceType() {
        const serviceType = document.querySelector('select[name="serviceType"]')?.value; // Use optional chaining
        const geralFields = document.getElementById('geral-fields');
        const devFields = document.getElementById('dev-fields');

        if (serviceType === 'geral') {
            geralFields?.classList.remove('hidden'); // Use optional chaining
            devFields?.classList.add('hidden'); // Use optional chaining
        } else if (serviceType) { // Add a check to ensure serviceType has a value
            geralFields?.classList.add('hidden'); // Use optional chaining
            devFields?.classList.remove('hidden'); // Use optional chaining
        }
    }

    // Função para alternar entre entrada direta e cálculo de remuneração
    function toggleRemunerationInput() {
        const directInput = document.getElementById('directInput');
        const calculateSection = document.getElementById('calculateSection');
        
        // Verifica qual radio está selecionado e exibe o campo correspondente
        if (document.querySelector('input[name="remunerationType"]:checked').value === 'direct') {
            directInput.style.display = 'flex';
            calculateSection.style.display = 'none';
        } else {
            directInput.style.display = 'none';
            calculateSection.style.display = 'block';
        }
    }

    // Função para formatar a entrada de moeda (ex: 1.234,56)
    function formatarMoeda(input) {
        let valor = input.value.replace(/\D/g, "");
        valor = (parseFloat(valor) / 100).toFixed(2);
        valor = valor.replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        input.value = valor;
    }

    // Função para remover uma linha do formulário
    function removerLinha(botao) {
        const linha = botao?.closest('.flex'); // Use optional chaining
        if (linha) {
            linha.remove();
        }
    }

    // Função para adicionar uma nova linha com ID único
    function adicionarLinha(containerId, placeholderText, isPercentage = false) {
        console.log('Executando adicionarLinha para:', containerId);
        const container = document.getElementById(containerId);
        if (container) {
            const newRow = document.createElement('div');
            newRow.className = 'flex space-x-2 mb-2';
            const uniqueId = `row-${rowCounter++}`; // Gera um ID único

            newRow.innerHTML = `
                <input type="text" class="w-1/2 p-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-300 transition" placeholder="${placeholderText}" id="nome-${uniqueId}">
                <div class="relative w-1/2">
                    ${isPercentage ? '' : '<span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">R$</span>'}
                    <input type="text" oninput="formatarMoeda(this)" placeholder="0,00" class="w-full ${isPercentage ? 'pr-10' : 'pl-10'} p-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-300 transition" id="valor-${uniqueId}">
                    ${isPercentage ? '<span class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400">%</span>' : ''}
                </div>
                <button type="button" onclick="removerLinha(this)" class="text-red-400 hover:text-red-300"><i class="fas fa-times"></i></button>
            `;

            container.parentNode.insertBefore(newRow, container.nextSibling);
            console.log('Linha adicionada com ID:', uniqueId);
        }
    }

    // Adicionar event listeners aos botões de adicionar linha
    document.querySelectorAll('.add-custo-btn').forEach(button => {
        button.addEventListener('click', function() {
            console.log('Botão de adicionar clicado:', this);
            const containerId = this.getAttribute('data-container');
            const placeholder = this.getAttribute('data-placeholder');
            const isPercentage = this.getAttribute('data-ispercentage') === 'true';
            console.log('Chamando adicionarLinha com:', containerId, placeholder, isPercentage);
            adicionarLinha(containerId, placeholder, isPercentage);
        });
    });
   

    // Inicializar event listeners para os toggles
    document.querySelectorAll('input[name="impostoType"]').forEach(input => {
        input.addEventListener('change', toggleImposto);
    });

    const serviceTypeSelect = document.querySelector('select[name="serviceType"]');
    if (serviceTypeSelect) {
        serviceTypeSelect.addEventListener('change', toggleServiceType);
    }

    document.querySelectorAll('input[name="remunerationType"]').forEach(input => {
        input.addEventListener('change', toggleRemunerationInput);
    });

    // Inicializar o estado do formulário
    toggleImposto();
    toggleServiceType();
    toggleRemunerationInput();

});

document.getElementById('calculateBtn').addEventListener('click', async function() {

    if (!await checkUsage()) {
        return; // Sai da função sem executar nada mais
    }
    
    // Se chegou aqui, checkUsage() retornou true
    calcularEExibirResultados();
    //exibirGraficos();
    initIAChat();
    markAsUsed();
});


// Tornar as funções formatarMoeda e removerLinha acessíveis globalmente para manipuladores de eventos inline
window.formatarMoeda = function(input) {
    let valor = input.value.replace(/\D/g, "");
    valor = (parseFloat(valor) / 100).toFixed(2);
    valor = valor.replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    input.value = valor;
};

window.removerLinha = function(botao) {
    const linha = botao?.closest('.flex'); // Use optional chaining
    if (linha) {
        linha.remove();
    }
};
