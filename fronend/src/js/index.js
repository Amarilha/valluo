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
    // Captura os valores dos campos
    const custosFixos = [];
    const custosVariaveis = [];
    const impostos = [];
    
    // Custo Fixo Mensal
    const custoFixoInputs = document.querySelectorAll('#geral-fields input[type="text"]');
    custoFixoInputs.forEach(input => {
        const valorInput = input.nextElementSibling; // Captura o próximo elemento (o campo de valor)
        console.log('Custo Fixo Input:', input.value); // Log do nome do custo fixo
        console.log('Valor Input:', valorInput); // Log do elemento de valor
        if (valorInput) {
            const valor = valorInput.value; // Captura o valor do campo de custo
            console.log('Valor:', valor); // Log do valor
            if (valor) {
                custosFixos.push({ nome: input.value, valor: valor });
            }
        }
    });

    // Custo Variável por Serviço
    const custoVariavelInputs = document.querySelectorAll('#custos-variaveis-container input[type="text"]');
    custoVariavelInputs.forEach(input => {
        const valorInput = input.nextElementSibling; // Captura o próximo elemento (o campo de valor)
        console.log('Custo Variável Input:', input.value); // Log do nome do custo variável
        console.log('Valor Input:', valorInput); // Log do elemento de valor
        if (valorInput) {
            const valor = valorInput.value; // Captura o valor do campo de custo
            console.log('Valor:', valor); // Log do valor
            if (valor) {
                custosVariaveis.push({ nome: input.value, valor: valor });
            }
        }
    });

    // Impostos e Taxas
    const impostoInputs = document.querySelectorAll('#impostos-container input[type="text"]');
    impostoInputs.forEach(input => {
        const valorInput = input.nextElementSibling; // Captura o próximo elemento (o campo de valor)
        console.log('Imposto Input:', input.value); // Log do nome do imposto
        console.log('Valor Input:', valorInput); // Log do elemento de valor
        if (valorInput) {
            const valor = valorInput.value; // Captura o valor do campo de imposto
            console.log('Valor:', valor); // Log do valor
            if (valor) {
                impostos.push({ nome: input.value, valor: valor });
            }
        }
    });

    // Remuneração por Hora
    const remuneracaoPorHora = document.querySelector('input[name="remunerationType"]:checked').value === 'direct'
        ? document.querySelector('#directInput input[type="number"]').value
        : null; // Aqui você pode adicionar lógica para calcular a remuneração se o usuário não souber

    // Valor do Serviço/Projeto
    const valorServico = document.querySelector('#geral-fields input[type="number"]').value; // Captura o valor do serviço

    // Exibe os dados capturados
    console.log('Custos Fixos:', custosFixos);
    console.log('Custos Variáveis:', custosVariaveis);
    console.log('Impostos e Taxas:', impostos);
    console.log('Remuneração por Hora:', remuneracaoPorHora);
    console.log('Valor do Serviço/Projeto:', valorServico);
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