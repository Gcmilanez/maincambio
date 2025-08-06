document.addEventListener('DOMContentLoaded', function () {
    const ctx = document.getElementById('currencyChart');
    if (!ctx) return; // Só executa se o canvas do gráfico existir

    const currencySelect = document.getElementById('currency-select');
    const periodSelect = document.getElementById('period-select');

    // Configuração inicial do gráfico (vazio)
    const currencyChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Valor de Venda (R$)',
            data: [],
            borderColor: getComputedStyle(document.documentElement).getPropertyValue('--primary').trim(), /* Usa a cor primária do site */
            backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--primary-transparent').trim() || 'rgba(0, 106, 238, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.3 /* Deixa a linha mais suave */
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false, /* Permite ajustar a altura */
        scales: {
            y: {
                beginAtZero: false,
                grid: {
                    borderColor: getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim() || '#e0e0e0',
                    borderDash: [3, 3],
                    drawBorder: false
                },
                ticks: {
                    callback: function(value, index, values) {
                        return 'R$ ' + value.toFixed(2);
                    }
                }
            },
            x: {
                grid: {
                    display: false
                }
            }
        },
        elements: {
            point: {
                radius: 3,
                hoverRadius: 5
            }
        },
        plugins: {
            tooltip: {
            callbacks: {
                title: function(context) {
                const firstPoint = context[0];
                if (firstPoint) {
                    return `Data: ${firstPoint.label}`;
                }
                return '';
                },
                label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                    label += ': ';
                }
                if (context.parsed.y !== null) {
                    label += context.parsed.y;
                }
                return label;
                }
            }
            }
        }
    }
});

    // Função assíncrona para buscar os dados na API e atualizar o gráfico
    async function fetchAndUpdateChart() {
        const currency = currencySelect.value;
        const days = periodSelect.value;
        const url = `https://economia.awesomeapi.com.br/json/daily/${currency}/${days}`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Falha ao buscar dados da API');
            }
            const data = await response.json();

            // Formata os dados para o formato que a Chart.js entende
            const labels = data.map(item => {
                const date = new Date(item.timestamp * 1000);
                return date.toLocaleDateString('pt-BR');
            }).reverse();

            const values = data.map(item => parseFloat(item.bid)).reverse();

            // Atualiza os dados do gráfico
            currencyChart.data.labels = labels;
            currencyChart.data.datasets[0].data = values;
            currencyChart.data.datasets[0].label = `Valor de Venda de ${currency.split('-')[0]} (R$)`;
            currencyChart.update();

        } catch (error) {
            console.error("Erro ao buscar dados da API:", error);
            alert("Não foi possível carregar os dados da cotação. Tente novamente mais tarde.");
        }
    }

    // Adiciona "ouvintes" para atualizar o gráfico quando o usuário mudar as opções
    currencySelect.addEventListener('change', fetchAndUpdateChart);
    periodSelect.addEventListener('change', fetchAndUpdateChart);

    // Carrega o gráfico com os dados iniciais (Dólar, 7 dias)
    fetchAndUpdateChart();
});