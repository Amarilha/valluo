// 1. Pegar o botão e o elemento de saída
const calcular = document.getElementById("calcular");
const output = document.getElementById("outputText");

// 2. Ouvir o evento personalizado "calcular"
calcular.addEventListener("calcular", function() {
    output.textContent = "Evento 'calcular' foi acionado!";
    console.log("Evento 'calcular' disparado!");
});

// 3. Disparar o evento "calcular" quando o botão for clicado
calcular.addEventListener("click", function() {
    calcular.dispatchEvent(new Event("calcular"));
});