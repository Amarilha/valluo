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