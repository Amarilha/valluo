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
    // Função auxiliar para formatar valores monetários CORRIGIDA
    const formatarMoeda = (valor) => {
        if (!valor) return "0,00";
        
        // Converte para número, tratando tanto formato brasileiro quanto internacional
        const numero = typeof valor === 'string' 
            ? parseFloat(valor.replace(/\./g, '').replace(',', '.')) 
            : Number(valor);
            
        if (isNaN(numero)) return "0,00";
        
        return numero.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };
    // Função auxiliar para somar valores de um objeto
    const somarValores = (obj) => {
        if (!obj || typeof obj !== 'object') return 0;
        return Object.values(obj).reduce((total, valor) => {
            if (!valor) return total;
            // Converte string para número, tratando formato brasileiro (1.234,56)
            const num = typeof valor === 'string'
                ? parseFloat(valor.replace(/\./g, '').replace(',', '.'))
                : Number(valor);
            return total + (isNaN(num) ? 0 : num);
        }, 0);
    };

    // Função auxiliar para gerar listas HTML
    const gerarListaHTML = (obj, isPercentage = false) => {
        if (!obj || typeof obj !== 'object') return '<li>Nenhum item cadastrado</li>';
        
        return Object.entries(obj).map(([nome, valor]) => {
            if (isPercentage) {
                // Formata como porcentagem (5 → 5,0%)
                const percentValue = parseFloat(valor).toFixed(1).replace('.', ',');
                return `<li>${nome}: ${percentValue}%</li>`;
            } else {
                // Formata como moeda (padrão)
                return `<li>${nome}: R$ ${formatarMoeda(valor)}</li>`;
            }
        }).join('');
    };

    // Obter horas trabalhadas no mês (do formulário)
    const horasMes = diasUteis * horasDia || 0;

    // Calcular totais
    const totalCustosFixosMensais = somarValores(custosFixos);
    const totalCustosVariaveis = somarValores(custosVariaveis);
    const totalTaxas = totalCustosVariaveis*(somarValores(taxas) / 100);
    
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
        <div class="bg-gray-800 p-6 rounded-xl border border-gray-700 mb-6 glass-effect">
    <h3 class="font-bold text-lg text-purple-300 mb-4">RESULTADOS DO CÁLCULO</h3>
    
    <div class="mb-6">
        <h4 class="font-semibold text-purple-300">Valor do Projeto</h4>
        <p class="text-2xl font-bold text-white">R$ ${formatarMoeda(valorServico)}</p>
        <p class="text-sm text-gray-400">Para ${horasProjeto || 0} horas de projeto</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
            <h4 class="font-semibold text-purple-300">Custos Variáveis</h4>
            <p class="text-lg font-bold text-white">R$ ${formatarMoeda(totalCustosVariaveis)}</p>
            <ul class="text-sm text-gray-400 mt-2">
                ${gerarListaHTML(custosVariaveis)}
            </ul>
        </div>
        
        <div>
            <h4 class="font-semibold text-purple-300">Custos Fixos Proporcionais</h4>
            <p class="text-lg font-bold text-white">R$ ${formatarMoeda(custosFixosProporcionais)}</p>
            <p class="text-sm text-gray-400">(R$ ${formatarMoeda(totalCustosFixosMensais)} ÷ ${horasMes}h) × ${horasProjeto}h</p>
            <ul class="text-sm text-gray-400 mt-2">
                ${gerarListaHTML(custosFixos)}
            </ul>
        </div>
        
        <div>
            <h4 class="font-semibold text-purple-300">Taxas e Impostos</h4>
            <p class="text-lg font-bold text-white">R$ ${formatarMoeda(totalTaxas)}</p>
            <ul class="text-sm text-gray-400 mt-2">
                ${gerarListaHTML(taxas, true)}
            </ul>
        </div>
    </div>

    <div class="p-4 rounded-lg bg-gray-800 border border-gray-700 mb-4">
        <h4 class="font-semibold text-purple-300 mb-2">Análise de Preço</h4>
        <div class="space-y-2">
            <p class="text-gray-300">Custo Fixo por Hora: R$ ${formatarMoeda(custoFixoPorHora)}</p>
            <p class="text-gray-300">Custo Total do Projeto: R$ ${formatarMoeda(custoTotalProjeto)}</p>
            <p class="text-gray-300">Preço Mínimo (Sem Lucro): R$ ${formatarMoeda(precoMinimo)}</p>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <p class="font-semibold text-purple-300">Margem Mínima (10%)</p>
                    <p class="text-lg font-bold text-white">R$ ${formatarMoeda(precoComMargemMinima)}</p>
                </div>
                <div>
                    <p class="font-semibold text-purple-300">Margem Indicada (${margemIndicada.toFixed(1)}%)</p>
                    <p class="text-lg font-bold text-white">R$ ${formatarMoeda(precoComMargemIndicada)}</p>
                </div>
                <div>
                    <p class="font-semibold text-purple-300">Margem Máxima (${margemMaxima.toFixed(1)}%)</p>
                    <p class="text-lg font-bold text-white">R$ ${formatarMoeda(precoComMargemMaxima)}</p>
                </div>
            </div>
        </div>
    </div>

    <div class="p-4 rounded-lg bg-gray-800 border border-gray-700 mb-4">
        <h4 class="font-semibold text-purple-300 mb-2">Margens de Lucro</h4>
        <div class="space-y-2">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="p-4 rounded-lg bg-gray-900 border border-gray-700">
                    <p class="font-semibold text-purple-300 mb-1">Margem Mínima</p>
                    <p class="text-2xl font-bold text-white">${margemMinima}%</p>
                    <p class="text-sm text-gray-400">Preço: R$ ${formatarMoeda(precoComMargemMinima)}</p>
                    <p class="text-sm text-gray-400">Lucro: R$ ${formatarMoeda(precoComMargemMinima - custosTotais)}</p>
                </div>
                <div class="p-4 rounded-lg bg-gray-900 border border-gray-700">
                    <p class="font-semibold text-purple-300 mb-1">Margem Indicada</p>
                    <p class="text-2xl font-bold text-white">${margemIndicada.toFixed(1)}%</p>
                    <p class="text-sm text-gray-400">Preço: R$ ${formatarMoeda(precoComMargemIndicada)}</p>
                    <p class="text-sm text-gray-400">Lucro: R$ ${formatarMoeda(precoComMargemIndicada - custosTotais)}</p>
                </div>
                <div class="p-4 rounded-lg bg-gray-900 border border-gray-700">
                    <p class="font-semibold text-purple-300 mb-1">Margem Máxima</p>
                    <p class="text-2xl font-bold text-white">${margemMaxima.toFixed(1)}%</p>
                    <p class="text-sm text-gray-400">Preço: R$ ${formatarMoeda(precoComMargemMaxima)}</p>
                    <p class="text-sm text-gray-400">Lucro: R$ ${formatarMoeda(precoComMargemMaxima - custosTotais)}</p>
                </div>
            </div>
        </div>
    </div>
</div>
    `;
}

export function exibirGraficos(ph, valorServico, custosFixos, custosVariaveis, taxas, horasProjeto, diasUteis, horasDia) {
    // Funções auxiliares (mantidas do código original)
    const formatarMoeda = (valor) => {
        if (!valor) return "0,00";
        const numero = typeof valor === 'string' 
            ? parseFloat(valor.replace(/\./g, '').replace(',', '.')) 
            : Number(valor);
        if (isNaN(numero)) return "0,00";
        return numero.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    const somarValores = (obj) => {
        if (!obj || typeof obj !== 'object') return 0;
        return Object.values(obj).reduce((total, valor) => {
            if (!valor) return total;
            const num = typeof valor === 'string'
                ? parseFloat(valor.replace(/\./g, '').replace(',', '.'))
                : Number(valor);
            return total + (isNaN(num) ? 0 : num);
        }, 0);
    };

    // Cálculos (mantidos do código original)
    const horasMes = diasUteis * horasDia || 0;
    const totalCustosFixosMensais = somarValores(custosFixos);
    const totalCustosVariaveis = somarValores(custosVariaveis);
    const totalTaxas = totalCustosVariaveis*(somarValores(taxas) / 100);
    const custoFixoPorHora = totalCustosFixosMensais / horasMes;
    const custoTotalProjeto = totalCustosVariaveis + (horasProjeto * custoFixoPorHora);
    const precoMinimo = custoTotalProjeto;
    const margemMinima = 10;
    const margemIndicada = Math.min(
        ((precoMinimo * 1.2 * horasMes) - totalCustosFixosMensais) / (precoMinimo * 1.2) * 100,
        ((precoMinimo * 1.2) - totalCustosVariaveis) / (precoMinimo * 1.2) * 100,
        25
    );
    const margemMaxima = Math.min(
        ((valorServico * horasMes) - totalCustosFixosMensais) / valorServico * 100,
        (valorServico - totalCustosVariaveis) / valorServico * 100
    );
    const precoComMargemMinima = precoMinimo * (1 + margemMinima/100);
    const precoComMargemMaxima = precoMinimo * (1 + margemMaxima/100);
    const precoComMargemIndicada = precoMinimo * (1 + margemIndicada/100);
    const custosFixosProporcionais = (totalCustosFixosMensais / horasMes) * horasProjeto;
    const custosTotais = totalCustosVariaveis + custosFixosProporcionais + totalTaxas;
    let margemLucro = valorServico > 0 ? (valorServico - custosTotais) / valorServico * 100 : 0;
    
    if (margemLucro > margemMaxima) {
        valorServico = custosTotais / (1 - margemMaxima/100);
        margemLucro = margemMaxima;
    }
    
    const lucro = valorServico - custosTotais;

    // Criar container para os gráficos
    const graphDiv = document.createElement('div');
    graphDiv.id = 'graph-results';
    graphDiv.className = 'bg-gray-800 p-6 rounded-xl border border-gray-700 glass-effect';
    graphDiv.innerHTML = `
        <h3 class="font-bold text-lg text-purple-300 mb-6">VISUALIZAÇÃO GRÁFICA DOS RESULTADOS</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div class="bg-gray-900 p-4 rounded-lg border border-gray-700">
                <h4 class="font-semibold text-purple-300 mb-4">Distribuição de Custos</h4>
                <canvas id="costDistributionChart"></canvas>
            </div>
            
            <div class="bg-gray-900 p-4 rounded-lg border border-gray-700">
                <h4 class="font-semibold text-purple-300 mb-4">Comparação de Margens</h4>
                <canvas id="marginComparisonChart"></canvas>
            </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-gray-900 p-4 rounded-lg border border-gray-700">
                <h4 class="font-semibold text-purple-300 mb-4">Composição do Preço</h4>
                <canvas id="priceCompositionChart"></canvas>
            </div>
            
            <div class="bg-gray-900 p-4 rounded-lg border border-gray-700">
                <h4 class="font-semibold text-purple-300 mb-4">Análise de Lucratividade</h4>
                <canvas id="profitabilityChart"></canvas>
            </div>
        </div>
    `;

    // Adicionar ao DOM (substituir ou adicionar ao resultado existente)
    const existingResult = document.getElementById('result');
    if (existingResult) {
        existingResult.appendChild(graphDiv);
    } else {
        document.body.appendChild(graphDiv);
    }

    // Inicializar gráficos após o DOM estar pronto
    setTimeout(() => {
        // 1. Gráfico de Distribuição de Custos
        const costCtx = document.getElementById('costDistributionChart').getContext('2d');
        new Chart(costCtx, {
            type: 'doughnut',
            data: {
                labels: ['Custos Variáveis', 'Custos Fixos Proporcionais', 'Taxas e Impostos'],
                datasets: [{
                    data: [totalCustosVariaveis, custosFixosProporcionais, totalTaxas],
                    backgroundColor: [
                        'rgba(192, 132, 252, 0.7)',
                        'rgba(167, 139, 250, 0.7)',
                        'rgba(139, 92, 246, 0.7)'
                    ],
                    borderColor: [
                        'rgba(192, 132, 252, 1)',
                        'rgba(167, 139, 250, 1)',
                        'rgba(139, 92, 246, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.label}: R$ ${formatarMoeda(context.raw)}`;
                            }
                        }
                    },
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#E5E7EB'
                        }
                    }
                }
            }
        });

        // 2. Gráfico de Comparação de Margens
        const marginCtx = document.getElementById('marginComparisonChart').getContext('2d');
        new Chart(marginCtx, {
            type: 'bar',
            data: {
                labels: ['Mínima (10%)', `Indicada (${margemIndicada.toFixed(1)}%)`, `Máxima (${margemMaxima.toFixed(1)}%)`],
                datasets: [{
                    label: 'Valor do Projeto (R$)',
                    data: [precoComMargemMinima, precoComMargemIndicada, precoComMargemMaxima],
                    backgroundColor: 'rgba(167, 139, 250, 0.7)',
                    borderColor: 'rgba(139, 92, 246, 1)',
                    borderWidth: 1
                }, {
                    label: 'Lucro (R$)',
                    data: [
                        precoComMargemMinima - custosTotais,
                        precoComMargemIndicada - custosTotais,
                        precoComMargemMaxima - custosTotais
                    ],
                    backgroundColor: 'rgba(74, 222, 128, 0.7)',
                    borderColor: 'rgba(22, 163, 74, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: '#E5E7EB',
                            callback: function(value) {
                                return 'R$ ' + formatarMoeda(value);
                            }
                        },
                        grid: {
                            color: 'rgba(55, 65, 81, 0.5)'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#E5E7EB'
                        },
                        grid: {
                            display: false
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: R$ ${formatarMoeda(context.raw)}`;
                            }
                        }
                    },
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#E5E7EB'
                        }
                    }
                }
            }
        });

        // 3. Gráfico de Composição do Preço
        const priceCtx = document.getElementById('priceCompositionChart').getContext('2d');
        new Chart(priceCtx, {
            type: 'pie',
            data: {
                labels: ['Custos', 'Lucro'],
                datasets: [{
                    data: [custosTotais, lucro],
                    backgroundColor: [
                        'rgba(139, 92, 246, 0.7)',
                        'rgba(74, 222, 128, 0.7)'
                    ],
                    borderColor: [
                        'rgba(139, 92, 246, 1)',
                        'rgba(22, 163, 74, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label;
                                const value = context.raw;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: R$ ${formatarMoeda(value)} (${percentage}%)`;
                            }
                        }
                    },
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#E5E7EB'
                        }
                    }
                }
            }
        });

        // 4. Gráfico de Análise de Lucratividade
        const profitCtx = document.getElementById('profitabilityChart').getContext('2d');
        new Chart(profitCtx, {
            type: 'radar',
            data: {
                labels: ['Margem Mínima', 'Margem Indicada', 'Margem Máxima', 'Custo por Hora', 'Valor por Hora'],
                datasets: [{
                    label: 'Análise de Lucratividade',
                    data: [
                        margemMinima,
                        margemIndicada,
                        margemMaxima,
                        custoFixoPorHora,
                        valorServico / horasProjeto
                    ],
                    backgroundColor: 'rgba(167, 139, 250, 0.2)',
                    borderColor: 'rgba(167, 139, 250, 1)',
                    pointBackgroundColor: 'rgba(167, 139, 250, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(167, 139, 250, 1)'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    r: {
                        angleLines: {
                            color: 'rgba(55, 65, 81, 0.5)'
                        },
                        grid: {
                            color: 'rgba(55, 65, 81, 0.5)'
                        },
                        pointLabels: {
                            color: '#E5E7EB'
                        },
                        ticks: {
                            color: '#E5E7EB',
                            backdropColor: 'rgba(31, 41, 55, 0.8)',
                            callback: function(value) {
                                if (value < 10) return value + '%';
                                if (value < 100) return 'R$ ' + formatarMoeda(value);
                                return value;
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.dataset.label || '';
                                const value = context.raw;
                                if (context.dataIndex < 3) {
                                    return `${label}: ${value.toFixed(1)}%`;
                                } else {
                                    return `${label}: R$ ${formatarMoeda(value)}`;
                                }
                            }
                        }
                    }
                }
            }
        });
    }, 100);
}