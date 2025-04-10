let rowCounter = 0; 


document.addEventListener("DOMContentLoaded", function () {
    console.log('DOMContentLoaded executado!');

    // Função para alternar a visibilidade das informações de imposto (MEI vs ME)
    function toggleImposto() {
        const meiInfo = document.getElementById('meiInfo');
        const meInfo = document.getElementById('meInfo');
        const selectedType = document.querySelector('input[name="impostoType"]:checked')?.value; // Use optional chaining

        if (selectedType === 'MEI') {
            meiInfo?.classList.remove('hidden'); // Use optional chaining
            meInfo?.classList.add('hidden'); // Use optional chaining
        } else {
            meiInfo?.classList.add('hidden'); // Use optional chaining
            meInfo?.classList.remove('hidden'); // Use optional chaining
        }
    }

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
                <input type="text" class="form-input block w-1/3 sm:text-sm sm:leading-5 rounded-md border-gray-300 focus:border-purple-500 focus:ring focus:ring-purple-500 focus:ring-opacity-50" placeholder="${placeholderText}" id="nome-${uniqueId}">
                <div class="relative rounded-md shadow-sm w-1/3">
                    ${isPercentage ? '' : '<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><span class="text-gray-500 sm:text-sm">R$</span></div>'}
                    <input type="text" oninput="formatarMoeda(this)"
                           placeholder="0,00"
                           class="form-input block w-full ${isPercentage ? '' : 'pl-10'} sm:text-sm sm:leading-5 rounded-md border-gray-300 focus:border-purple-500 focus:ring focus:ring-purple-500 focus:ring-opacity-50"
                           id="valor-${uniqueId}">
                    ${isPercentage ? '<div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><span class="text-gray-500 sm:text-sm">%</span></div>' : ''}
                </div>
                <button type="button" onclick="removerLinha(this)" class="text-red-600 font-bold hover:text-red-700 transition duration-150 ease-in-out">X</button>
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
    console.log('Listeners anexados para adicionar linha.');

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

document.getElementById('calculateBtn').addEventListener('click', function() {
    // Captura os valores dos campos separadamente
    const custosFixos = {};
    const custosVariaveis = {};
    const taxas = {};
    
    // Captura Custos Fixos (CF)
    document.querySelectorAll('#CF input[type="text"]').forEach(input => {
        const valorInput = input.nextElementSibling?.querySelector('input');
        if (valorInput && input.value && valorInput.value) {
            custosFixos[input.value] = valorInput.value;
        }
    });

    // Captura Custos Variáveis (CV)
    document.querySelectorAll('#CV input[type="text"]').forEach(input => {
        const valorInput = input.nextElementSibling?.querySelector('input');
        if (valorInput && input.value && valorInput.value) {
            custosVariaveis[input.value] = valorInput.value;
        }
    });

    // Captura Taxas
    document.querySelectorAll('#taxa input[type="text"]').forEach(input => {
        const valorInput = input.nextElementSibling?.querySelector('input');
        if (valorInput && input.value && valorInput.value) {
            taxas[input.value] = valorInput.value;
        }
    });

    // Captura PH (Preço por Hora)
    let precoHora = null;
    if (document.querySelector('input[name="remunerationType"]:checked').value === 'direct') {
        precoHora = document.querySelector('#directInput input[type="number"]')?.value;
    } else {
        // Captura valores do calculateSection
        const remuneracaoMes = document.querySelector('#calculateSection input[placeholder="0,00"]')?.value;
        const diasUteis = document.querySelector('#calculateSection input[placeholder="0"][max="31"]')?.value;
        const horasDia = document.querySelector('#calculateSection input[placeholder="0"][max="24"]')?.value;
        
        if (remuneracaoMes && diasUteis && horasDia) {
            // Converte remuneracaoMes de string "1.234,56" para número
            const remuneracaoNumero = parseFloat(remuneracaoMes.replace(/\./g, '').replace(',', '.'));
            // Calcula o preço por hora
            precoHora = (remuneracaoNumero / (diasUteis * horasDia)).toFixed(2);
        }
    }

    // Captura Valor do Projeto
    const valorProjeto = document.querySelector('#valor-projeto input[type="number"]')?.value;

    // Mostra cada valor separadamente no console
    console.log('=== Valores Separados ===');
    console.log('Custos Fixos (CF):', custosFixos);
    console.log('Custos Variáveis (CV):', custosVariaveis);
    console.log('Taxas:', taxas);
    console.log('Preço por Hora (PH):', precoHora);
    console.log('Valor do Projeto:', valorProjeto);
    
    if (document.querySelector('input[name="remunerationType"]:checked').value !== 'direct') {
        console.log('=== Dados do Cálculo de PH ===');
        console.log('Remuneração Mensal:', document.querySelector('#calculateSection input[placeholder="0,00"]')?.value);
        console.log('Dias Úteis:', document.querySelector('#calculateSection input[placeholder="0"][max="31"]')?.value);
        console.log('Horas por Dia:', document.querySelector('#calculateSection input[placeholder="0"][max="24"]')?.value);
    }
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