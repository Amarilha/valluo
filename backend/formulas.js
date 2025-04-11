export function getDados() {
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
    document.querySelectorAll('#taxas input[type="text"]').forEach(input => {
        const valorInput = input.nextElementSibling?.querySelector('input');
        if (valorInput && input.value && valorInput.value) {
            taxas[input.value] = valorInput.value;
        }
    });

    // Captura PH (Preço por Hora)
    let precoHora = null;
    let diasUteis = null;
    let horasDia = null;
    
    if (document.querySelector('input[name="remunerationType"]:checked').value === 'direct') {
        precoHora = document.querySelector('#directInput input[type="number"]')?.value;
    } else {
        // Captura valores do calculateSection
        const remuneracaoMes = document.querySelector('#calculateSection input[placeholder="0,00"]')?.value;
        diasUteis = document.querySelector('#calculateSection input[placeholder="0"][max="31"]')?.value;
        horasDia = document.querySelector('#calculateSection input[placeholder="0"][max="24"]')?.value;
        
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
        valorProjeto,
        diasUteis: diasUteis , // Valor padrão 22 dias
        horasDia: horasDia       // Valor padrão 8 horas
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

export function calcularEExibirResultados() {
    // Obter todos os dados necessários
    const dados = getDados();
    
    // Calcular valores totais
    const cf = calcularCF();
    const cv = calcularCV();
    const vs = valorSevico();
    
    // Obter horas do projeto (você precisará adicionar isso ao seu formulário)
    const horasProjeto = getDados().valorProjeto || 0;
    
    // Chamar a função de exibição com todos os parâmetros necessários
    exibirResultados(
        dados.precoHora,
        vs.valorfinal,
        dados.custosFixos,
        dados.custosVariaveis,
        dados.taxas,
        horasProjeto,
        dados.diasUteis,
        dados.horasDia
    );
}

export function exibirResultados(ph, valorServico, custosFixos, custosVariaveis, taxas, horasProjeto, diasUteis, horasDia) {
    // Função auxiliar para formatar valores monetários
    const formatarMoeda = (valor) => {
        if (!valor) return "0,00";
        return parseFloat(valor).toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    // Função auxiliar para somar valores de um objeto
    const somarValores = (obj) => {
        if (!obj || typeof obj !== 'object') return 0;
        return Object.values(obj).reduce((total, valor) => {
            if (!valor) return total;
            const num = parseFloat(valor.toString().replace('.', '').replace(',', '.')) || 0;
            return total + num;
        }, 0);
    };

    // Função auxiliar para gerar listas HTML
    const gerarListaHTML = (obj) => {
        if (!obj || typeof obj !== 'object') return '<li>Nenhum item cadastrado</li>';
        return Object.entries(obj).map(([nome, valor]) => 
            `<li>${nome}: R$ ${formatarMoeda(valor)}</li>`
        ).join('');
    };

    // Obter horas trabalhadas no mês (do formulário)
    const horasMes = diasUteis * horasDia || 0;

    // Calcular totais
    const totalCustosFixosMensais = somarValores(custosFixos);
    const totalCustosVariaveis = somarValores(custosVariaveis);
    const totalTaxas = somarValores(taxas);
    
    // Calcular custos fixos proporcionais ao projeto
    const custosFixosProporcionais = (totalCustosFixosMensais / horasMes) * horasProjeto;
    
    // Calcular o lucro considerando todos os custos e taxas
    const custosTotais = totalCustosVariaveis + custosFixosProporcionais + totalTaxas;
    const lucro = valorServico - custosTotais;
    const margemLucro = valorServico > 0 ? (lucro / valorServico) * 100 : 0;
    
    const resultDiv = document.getElementById('result');
    if (!resultDiv) {
        console.error('Elemento com ID "result" não encontrado');
        return;
    }

    resultDiv.innerHTML = `
        <div class="bg-purple-50 p-4 rounded-lg mb-4">
            <h3 class="font-bold text-lg text-purple-700 mb-2">RESULTADOS DO CÁLCULO</h3>
            
            <div class="mb-4">
                <h4 class="font-semibold text-purple-600">Valor do Projeto</h4>
                <p class="text-2xl font-bold text-gray-800">R$ ${formatarMoeda(valorServico)}</p>
                <p class="text-sm text-gray-600">*Para ${horasProjeto || 0} horas de projeto</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                    <h4 class="font-semibold text-purple-600">Custos Variáveis</h4>
                    <p class="text-lg font-bold">R$ ${formatarMoeda(totalCustosVariaveis)}</p>
                    <ul class="text-sm text-gray-600 mt-2">
                        ${gerarListaHTML(custosVariaveis)}
                    </ul>
                </div>
                
                <div>
                    <h4 class="font-semibold text-purple-600">Custos Fixos Proporcionais</h4>
                    <p class="text-lg font-bold">R$ ${formatarMoeda(custosFixosProporcionais)}</p>
                    <p class="text-sm text-gray-600">(R$ ${formatarMoeda(totalCustosFixosMensais)} ÷ ${horasMes}h) × ${horasProjeto}h</p>
                    <ul class="text-sm text-gray-600 mt-2">
                        ${gerarListaHTML(custosFixos)}
                    </ul>
                </div>
                
                <div>
                    <h4 class="font-semibold text-purple-600">Taxas e Impostos</h4>
                    <p class="text-lg font-bold">R$ ${formatarMoeda(totalTaxas)}</p>
                    <ul class="text-sm text-gray-600 mt-2">
                        ${gerarListaHTML(taxas)}
                    </ul>
                </div>
            </div>

            <div class="mb-4 bg-green-50 p-3 rounded-lg">
                <h4 class="font-semibold text-green-600">Lucro do Serviço</h4>
                <p class="text-2xl font-bold text-green-800">R$ ${formatarMoeda(lucro)}</p>
                <p class="text-sm text-green-600">Margem de lucro: ${margemLucro.toFixed(2)}%</p>
            </div>

            <div class="mt-4 p-3 bg-blue-50 rounded-lg">
                <h4 class="font-semibold text-blue-600">Detalhamento do Cálculo</h4>
                <div class="grid grid-cols-2 gap-2 mt-2">
                    <span>Valor do Projeto:</span>
                    <span class="font-bold text-right">R$ ${formatarMoeda(valorServico)}</span>
                    
                    <span>Custos Variáveis:</span>
                    <span class="font-bold text-right">R$ ${formatarMoeda(totalCustosVariaveis)}</span>
                    
                    <span>Custos Fixos Proporcionais:</span>
                    <span class="font-bold text-right">R$ ${formatarMoeda(custosFixosProporcionais)}</span>
                    <span class="text-xs text-gray-500 col-span-2">(R$ ${formatarMoeda(totalCustosFixosMensais)} ÷ ${horasMes}h) × ${horasProjeto}h</span>
                    
                    <span>Taxas/Impostos:</span>
                    <span class="font-bold text-right">R$ ${formatarMoeda(totalTaxas)}</span>
                    
                    <span class="text-green-600 font-semibold">Total de Custos:</span>
                    <span class="font-bold text-green-600 text-right">R$ ${formatarMoeda(custosTotais)}</span>
                    
                    <span class="text-green-600 font-semibold">Lucro Líquido:</span>
                    <span class="font-bold text-green-600 text-right">R$ ${formatarMoeda(lucro)}</span>
                    
                    <span class="text-green-600 font-semibold">Margem de Lucro:</span>
                    <span class="font-bold text-green-600 text-right">${margemLucro.toFixed(2)}%</span>
                </div>
            </div>
        </div>
    `;
}