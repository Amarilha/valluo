let rowCounter = 0; // Contador para gerar IDs únicos
document.addEventListener("DOMContentLoaded", function () {
    console.log('DOMContentLoaded executado!');
    // Mova a função toggleImposto para fora do event listener
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

    // Toggle between service types (Geral vs Desenvolvedor)
    function toggleServiceType() {
        const serviceType = document.querySelector('select[name="serviceType"]').value;
        const geralFields = document.getElementById('geral-fields');
        const devFields = document.getElementById('dev-fields');
        
        if (serviceType === 'geral') {
            geralFields.classList.remove('hidden');
            devFields.classList.add('hidden');
        } 
    }

    // Toggle between direct input and calculated remuneration
    function toggleRemunerationInput() {
        const remunerationType = document.querySelector('input[name="remunerationType"]:checked').value;
        const directInput = document.getElementById('directInput');
        const calculateSection = document.getElementById('calculateSection');
        
        if (remunerationType === 'direct') {
            directInput.style.display = 'flex';
            calculateSection.style.display = 'none';
        } else {
            directInput.style.display = 'none';
            calculateSection.style.display = 'block';
        }
    }

    // Function to format currency input (ex: 1.234,56)
    function formatarMoeda(input) {
        let valor = input.value.replace(/\D/g, "");
        valor = (parseFloat(valor) / 100).toFixed(2);
        valor = valor.replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        input.value = valor;
    }

    // Function to remove a form row
    function removerLinha(botao) {
        const linha = botao.closest('.flex');
        if (linha) {
            linha.remove();
        }
    }
    // Adicionar event listeners aos botões
    document.querySelectorAll('.add-custo-btn').forEach(button => {
        button.addEventListener('click', function() {
            console.log('Botão de adicionar clicado:', this);
            const containerId = this.getAttribute('data-container');
            const placeholder = this.getAttribute('data-placeholder');
            const isPercentage = this.getAttribute('data-ispercentage') === 'true';
            console.log('Chamando adicionarLinha com:', containerId, placeholder, isPercentage);
            adicionarLinha(containerId, placeholder, isPercentage);
        }); // Removi o { once: true }
    });
    console.log('Listeners anexados (tentativa).');
     // Função para adicionar uma nova linha com ID único
     function adicionarLinha(containerId, placeholderText, isPercentage = false) {
        console.log('Executando adicionarLinha para:', containerId);
        const container = document.getElementById(containerId);
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

    // Initialize event listeners
    document.querySelectorAll('input[name="impostoType"]').forEach(input => {
        input.addEventListener('change', toggleImposto);
    });

    document.querySelector('select[name="serviceType"]').addEventListener('change', toggleServiceType);

    document.querySelectorAll('input[name="remunerationType"]').forEach(input => {
        input.addEventListener('change', toggleRemunerationInput);
    });

    // Calculate button functionality
    document.getElementById('calculateBtn').addEventListener('click', function() {
        // Here you would add your calculation logic
        alert('Cálculo realizado! Implemente a lógica de cálculo aqui.');
    });

    // Initialize the form state
    toggleImposto();
    toggleServiceType();
    toggleRemunerationInput();
});

// Make functions available globally for inline event handlers
window.formatarMoeda = function(input) {
    let valor = input.value.replace(/\D/g, "");
    valor = (parseFloat(valor) / 100).toFixed(2);
    valor = valor.replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    input.value = valor;
};

window.removerLinha = function(botao) {
    const linha = botao.closest('.flex');
    if (linha) {
        linha.remove();
    }
};