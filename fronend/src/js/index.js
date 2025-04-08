document.addEventListener("DOMContentLoaded", function () {
    // Função para formatar valor em moeda (ex: 1.234,56)
    function formatarMoeda(input) {
        let valor = input.value.replace(/\D/g, "");
        valor = (parseFloat(valor) / 100).toFixed(2);
        valor = valor.replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        input.value = valor;
    }

    // Função para remover uma linha de um formulário
    function removerLinha(botao) {
        const linha = botao.closest('.flex');
        if (linha) {
            linha.remove();
        }
    }

    // Exemplo: aplicar a formatação de moeda nos inputs com classe "moeda"
    document.querySelectorAll('.moeda').forEach(input => {
        input.addEventListener('input', function () {
            formatarMoeda(input);
        });
    });

    // Exemplo: aplicar função de remover em botões com classe "remover-linha"
    document.querySelectorAll('.remover-linha').forEach(botao => {
        botao.addEventListener('click', function () {
            removerLinha(botao);
        });
    });
});
