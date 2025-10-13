document.addEventListener('DOMContentLoaded', function () {
    const ctx = document.getElementById('currencyChart');
    if (!ctx) return; // Só executa se o canvas do gráfico existir

    const currencySelect = document.getElementById('currency-select');
    const periodSelect = document.getElementById('period-select');

    // =================================================================
    // CACHE SYSTEM - Evita requisições desnecessárias
    // =================================================================
    const CACHE_TIME = 5 * 60 * 1000; // 5 minutos em milissegundos
    const cache = {};

    // =================================================================
    // CONFIGURAÇÃO DO GRÁFICO
    // =================================================================
    const currencyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Valor de Venda (R$)',
                data: [],
                borderColor: getComputedStyle(document.documentElement).getPropertyValue('--primary').trim(),
                backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--primary-transparent').trim() || 'rgba(0, 106, 238, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: {
                        borderColor: getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim() || '#e0e0e0',
                        borderDash: [3, 3],
                        drawBorder: false
                    },
                    ticks: {
                        callback: function(value) {
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
                            return firstPoint ? `Data: ${firstPoint.label}` : '';
                        },
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += 'R$ ' + context.parsed.y.toFixed(2);
                            }
                            return label;
                        }
                    }
                },
                legend: {
                    display: true,
                    position: 'top'
                }
            }
        }
    });

    // =================================================================
    // FUNÇÃO PARA ATUALIZAR O GRÁFICO
    // =================================================================
    function updateChart(data, currency) {
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
        currencyChart.update('none'); // 'none' desabilita animação para melhor performance
    }

    // =================================================================
    // FUNÇÃO PARA BUSCAR E ATUALIZAR O GRÁFICO (COM CACHE)
    // =================================================================
    async function fetchAndUpdateChart() {
        const currency = currencySelect.value;
        const days = periodSelect.value;
        const cacheKey = `${currency}-${days}`;
        const now = Date.now();

        // Mostra loading (opcional)
        const chartContainer = document.querySelector('.chart-container');
        if (chartContainer) {
            chartContainer.style.opacity = '0.6';
        }

        // Verifica se existe cache válido
        if (cache[cacheKey] && (now - cache[cacheKey].timestamp) < CACHE_TIME) {
            console.log('Usando dados do cache para:', cacheKey);
            updateChart(cache[cacheKey].data, currency);
            
            if (chartContainer) {
                chartContainer.style.opacity = '1';
            }
            return;
        }

        // Se não tem cache ou expirou, busca na API
        const url = `https://economia.awesomeapi.com.br/json/daily/${currency}/${days}`;

        try {
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }
            
            const data = await response.json();

            // Valida se recebeu dados
            if (!data || data.length === 0) {
                throw new Error('Nenhum dado retornado pela API');
            }

            // Salva no cache
            cache[cacheKey] = {
                data: data,
                timestamp: now
            };

            console.log('Dados atualizados da API para:', cacheKey);
            updateChart(data, currency);

        } catch (error) {
            console.error("Erro ao buscar dados da API:", error);
            
            // Mensagem de erro mais amigável
            let errorMessage = "Não foi possível carregar os dados da cotação.";
            
            if (!navigator.onLine) {
                errorMessage += " Verifique sua conexão com a internet.";
            } else {
                errorMessage += " Tente novamente mais tarde.";
            }
            
            alert(errorMessage);
            
            // Tenta usar cache antigo se houver
            if (cache[cacheKey]) {
                console.log('Usando cache antigo devido ao erro');
                updateChart(cache[cacheKey].data, currency);
            }
        } finally {
            // Remove loading
            if (chartContainer) {
                chartContainer.style.opacity = '1';
            }
        }
    }

    let debounceTimer;
    const debounceDelay = 300; // 300ms de delay

    function debouncedFetch() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            fetchAndUpdateChart();
        }, debounceDelay);
    }

    // Adiciona "ouvintes" para atualizar o gráfico
    currencySelect.addEventListener('change', debouncedFetch);
    periodSelect.addEventListener('change', debouncedFetch);

    // Atualiza automaticamente a cada 5 minutos
    setInterval(() => {
        console.log('Atualização automática de cotações...');
        fetchAndUpdateChart();
    }, CACHE_TIME);

    window.addEventListener('beforeunload', () => {
        // Mantém apenas o cache da seleção atual
        const currentKey = `${currencySelect.value}-${periodSelect.value}`;
        Object.keys(cache).forEach(key => {
            if (key !== currentKey) {
                delete cache[key];
            }
        });
    });

    fetchAndUpdateChart();

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            currencyChart.resize();
        }, 250);
    });

    window.addEventListener('online', () => {
        console.log('Conexão restaurada. Atualizando dados...');
        fetchAndUpdateChart();
    });

    window.addEventListener('offline', () => {
        console.log('Sem conexão. Usando dados em cache.');
    });
});