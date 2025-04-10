export function getDados(){

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
   
       return {
        custosFixos,
        custosVariaveis,
        taxas,
        precoHora,
        valorProjeto
    };
}

export function calcularCF() {
    // Primeiro chamamos getDados() para obter os dados
    const dados = getDados();
    
    // Verificamos se temos custosFixos e se é um objeto
    if (!dados.custosFixos || typeof dados.custosFixos !== 'object') {
        console.error('Dados de custos fixos inválidos');
        return 0;
    }

    // Convertemos os valores do objeto para um array de números
    const valoresCF = Object.values(dados.custosFixos).map(valor => {
        // Converte string para número, tratando vírgula como decimal
        return parseFloat(valor.replace('.', '').replace(',', '.')) || 0;
    });

    // Agora podemos usar reduce no array de números
    const somaCF = valoresCF.reduce((acumulador, valorAtual) => {
        return acumulador + valorAtual;
    }, 0);

    console.log('Soma dos Custos Fixos:', somaCF);
    return {somaCF};
}

export function calcularCV() {
    // Primeiro chamamos getDados() para obter os dados
    const dados = getDados();
    
    // Verificamos se temos custosFixos e se é um objeto
    if (!dados.custosVariaveis || typeof dados.custosVariaveis !== 'object') {
        console.error('Dados de custos fixos inválidos');
        return 0;
    }

    // Convertemos os valores do objeto para um array de números
    const valoresCV = Object.values(dados.custosVariaveis).map(valor => {
        // Converte string para número, tratando vírgula como decimal
        return parseFloat(valor.replace('.', '').replace(',', '.')) || 0;
    });

    // Agora podemos usar reduce no array de números
    const somaCV = valoresCV.reduce((acumulador, valorAtual) => {
        return acumulador + valorAtual;
    }, 0);

    console.log('Soma dos Custos variavel:', somaCV);
    return {somaCV};
}

export function valorSevico(){
    const valorProjeto = getDados().valorProjeto;// ok
    const ph =  getDados().precoHora; // ok
    const cv = calcularCV()
    const cf = calcularCF();

    const valorfinal = (valorProjeto * ph) + cv.somaCV;
    const lucro = valorfinal - (cf.somaCF + cv.somaCV);

    console.log('valor final: ' , valorfinal );
    console.log('lucro final: ' , lucro );

    return {valorfinal, lucro};

}