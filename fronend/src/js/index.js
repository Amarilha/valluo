document.querySelectorAll('input[name="investmentType"]').forEach((elem) => {
    elem.addEventListener("change", function(event) {
        var item = event.target.value;
        if (item === "MEI") {
            document.getElementById("mei-info").classList.remove("hidden");
            document.getElementById("eme-info").classList.add("hidden");
        } else if (item === "EME") {
            document.getElementById("mei-info").classList.add("hidden");
            document.getElementById("eme-info").classList.remove("hidden");
        }
    });
});

document.getElementById('calculateBtn').addEventListener('click', function() {
    // Obter os valores dos campos
    const fixedCost = parseFloat(document.getElementById('fixedCost').value.replace(',', '.')) || 0;
    const variableCost = parseFloat(document.getElementById('variableCost').value.replace(',', '.')) || 0;
    
    // Calcular o total
    const total = fixedCost + variableCost;
    
    // Formatando para exibir com 2 casas decimais e vírgula como separador decimal
    const formattedTotal = total.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
    
    // Exibir o resultado em um alerta
    alert(`O valor total é: ${formattedTotal}`);
    
    // Também pode manter a exibição na div de resultados se desejar
    document.getElementById('result').innerHTML = `Total: ${formattedTotal}`;
});

// Limpar o resultado quando o formulário for resetado
document.querySelector('form').addEventListener('reset', function() {
    document.getElementById('result').innerText = '';
});
