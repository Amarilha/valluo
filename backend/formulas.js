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
    const valorProjeto = getDados().valorProjeto;
    const ph =  getDados().precoHora;
    const cv = calcularCV();
    const cf = calcularCF();

    let valorfinal = (valorProjeto * ph) + cv.somaCV;
    // Calcular lucro inicial
    let lucro = valorfinal - (cf.somaCF + cv.somaCV);
    
    // Se o lucro for negativo, ajustar para 10% do valor do projeto
    if (lucro < 0) {
        const minLucro = valorProjeto * 0.1; // 10% do valor do projeto
        const ajuste = minLucro - lucro;
        valorfinal += ajuste; // Aumentar o valor final para garantir o lucro mínimo
        lucro = minLucro; // Garantir que o lucro seja pelo menos 10% do valor do projeto
    }

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
    
    // Cálculo do custo fixo por hora
    const custoFixoPorHora = totalCustosFixosMensais / horasMes;
    
    // Cálculo do custo total do projeto
    const custoTotalProjeto = totalCustosVariaveis + (horasProjeto * custoFixoPorHora);
    
    // Cálculo do preço mínimo para não ter prejuízo
    const precoMinimo = custoTotalProjeto;
    
    // Definição das margens de lucro
    const margemMinima = 10; // 10% mínimo
    
    // Cálculo da margem indicada (equilibrada)
    const margemIndicada = Math.min(
        // Margem baseada nos custos fixos mensais
        ((precoMinimo * 1.2 * horasMes) - totalCustosFixosMensais) / (precoMinimo * 1.2) * 100, // 20% acima do mínimo
        // Margem baseada nos custos variáveis
        ((precoMinimo * 1.2) - totalCustosVariaveis) / (precoMinimo * 1.2) * 100, // 20% acima do mínimo
        // Margem máxima de 25% para evitar preços muito altos
        25
    );
    
    // Cálculo da margem máxima de lucro
    const margemMaxima = Math.min(
        // Margem máxima baseada nos custos fixos mensais
        ((valorServico * horasMes) - totalCustosFixosMensais) / valorServico * 100,
        // Margem máxima baseada nos custos variáveis
        (valorServico - totalCustosVariaveis) / valorServico * 100
    );
    
    // Cálculo dos preços com diferentes margens
    const precoComMargemMinima = precoMinimo * (1 + margemMinima/100);
    const precoComMargemMaxima = precoMinimo * (1 + margemMaxima/100);
    const precoComMargemIndicada = precoMinimo * (1 + margemIndicada/100);
    
    // Atualizar o valor do projeto para usar a margem indicada
    valorServico = precoComMargemIndicada;
    
    // Calcular custos fixos proporcionais ao projeto
    const custosFixosProporcionais = (totalCustosFixosMensais / horasMes) * horasProjeto;
    
    // Calcular o lucro considerando todos os custos e taxas
    const custosTotais = totalCustosVariaveis + custosFixosProporcionais + totalTaxas;
    
    // Calcular margem de lucro inicial
    let margemLucro = valorServico > 0 ? (valorServico - custosTotais) / valorServico * 100 : 0;
    
    // Se a margem de lucro for maior que a margem máxima, ajustar o valor do serviço
    if (margemLucro > margemMaxima) {
        valorServico = custosTotais / (1 - margemMaxima/100);
        margemLucro = margemMaxima;
    }
    
    const lucro = valorServico - custosTotais;
    
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

            <div class="bg-white p-4 rounded-lg shadow mb-4">
                <h4 class="font-semibold text-purple-600 mb-2">Análise de Preço</h4>
                <div class="space-y-2">
                    <p>Custo Fixo por Hora: R$ ${formatarMoeda(custoFixoPorHora)}</p>
                    <p>Custo Total do Projeto: R$ ${formatarMoeda(custoTotalProjeto)}</p>
                    <p>Preço Mínimo (Sem Lucro): R$ ${formatarMoeda(precoMinimo)}</p>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <p class="font-semibold text-purple-600">Margem Mínima (10%)</p>
                            <p class="text-lg font-bold">R$ ${formatarMoeda(precoComMargemMinima)}</p>
                        </div>
                        <div>
                            <p class="font-semibold text-purple-600">Margem Indicada (${margemIndicada.toFixed(1)}%)</p>
                            <p class="text-lg font-bold">R$ ${formatarMoeda(precoComMargemIndicada)}</p>
                        </div>
                        <div>
                            <p class="font-semibold text-purple-600">Margem Máxima (${margemMaxima.toFixed(1)}%)</p>
                            <p class="text-lg font-bold">R$ ${formatarMoeda(precoComMargemMaxima)}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="bg-white p-4 rounded-lg shadow mb-4">
                <h4 class="font-semibold text-purple-600 mb-2">Margens de Lucro</h4>
                <div class="space-y-2">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div class="bg-purple-50 p-4 rounded-lg">
                            <p class="font-semibold text-purple-700 mb-1">Margem Mínima</p>
                            <p class="text-2xl font-bold">${margemMinima}%</p>
                            <p class="text-sm text-gray-600">Preço: R$ ${formatarMoeda(precoComMargemMinima)}</p>
                            <p class="text-sm text-gray-600">Lucro: R$ ${formatarMoeda(precoComMargemMinima - custosTotais)}</p>
                        </div>
                        <div class="bg-purple-50 p-4 rounded-lg">
                            <p class="font-semibold text-purple-700 mb-1">Margem Indicada</p>
                            <p class="text-2xl font-bold">${margemIndicada.toFixed(1)}%</p>
                            <p class="text-sm text-gray-600">Preço: R$ ${formatarMoeda(precoComMargemIndicada)}</p>
                            <p class="text-sm text-gray-600">Lucro: R$ ${formatarMoeda(precoComMargemIndicada - custosTotais)}</p>
                        </div>
                        <div class="bg-purple-50 p-4 rounded-lg">
                            <p class="font-semibold text-purple-700 mb-1">Margem Máxima</p>
                            <p class="text-2xl font-bold">${margemMaxima.toFixed(1)}%</p>
                            <p class="text-sm text-gray-600">Preço: R$ ${formatarMoeda(precoComMargemMaxima)}</p>
                            <p class="text-sm text-gray-600">Lucro: R$ ${formatarMoeda(precoComMargemMaxima - custosTotais)}</p>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    `;
}