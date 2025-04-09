// scripts/comparisonManager.js

export class ComparisonManager {
  constructor() {
      this.currentFilters = {
          level: 'loja',
          item: 'all',
          metric: 'venda_liq',
          period: 'annual'
      };
      this.charts = {
          annual: null,
          growth: null,
          monthly: null
      };
      this.init();
  }

  async init() {
      this.data = await this.loadData();
      this.setupEventListeners();
      this.initCharts();
      this.updateTable();
  }

  async loadData() {
      const response = await fetch('data.json');
      return await response.json();
  }

  setupEventListeners() {
      // Nível de agregação
      document.getElementById('comparison-level').addEventListener('change', (e) => {
          this.currentFilters.level = e.target.value;
          this.updateItemDropdown();
          this.updateCharts();
      });

      // Item específico
      document.getElementById('comparison-item').addEventListener('change', (e) => {
          this.currentFilters.item = e.target.value;
          this.updateCharts();
      });

      // Métrica
      document.getElementById('comparison-metric').addEventListener('change', (e) => {
          this.currentFilters.metric = e.target.value;
          this.updateCharts();
      });

      // Período
      document.getElementById('comparison-period').addEventListener('change', (e) => {
          this.currentFilters.period = e.target.value;
          this.updateCharts();
      });
  }

  updateItemDropdown() {
      const itemSelect = document.getElementById('comparison-item');
      itemSelect.innerHTML = '<option value="all">Todos</option>';

      if (this.currentFilters.level === 'loja') {
          this.data.filiais.forEach(filial => {
              const option = document.createElement('option');
              option.value = filial.id;
              option.textContent = filial.nome;
              itemSelect.appendChild(option);
          });
      }
      // Adicionar lógica para outros níveis (setor, departamento, seção)
  }

  initCharts() {
      this.charts.annual = this.createAnnualChart();
      this.charts.growth = this.createGrowthChart();
      this.charts.monthly = this.createMonthlyChart();
  }

  createAnnualChart() {
      const ctx = document.getElementById('annualComparisonChart').getContext('2d');
      return new Chart(ctx, {
          type: 'bar',
          data: this.prepareAnnualData(),
          options: this.getAnnualChartOptions()
      });
  }

  prepareAnnualData() {
      const years = ['2023', '2024', '2025'];
      const metricMap = {
          'venda_liq': 'Venda Líquida',
          'lucro_liq': 'Lucro Líquido',
          'margem': 'Margem de Lucro',
          'quantidade': 'Quantidade Vendida'
      };

      return {
          labels: years,
          datasets: [{
              label: metricMap[this.currentFilters.metric],
              data: years.map(year => {
                  return this.getAggregatedData(year, this.currentFilters.metric);
              }),
              backgroundColor: [
                  'rgba(239, 68, 68, 0.7)',
                  'rgba(59, 130, 246, 0.7)',
                  'rgba(16, 185, 129, 0.7)'
              ],
              borderColor: [
                  'rgba(239, 68, 68, 1)',
                  'rgba(59, 130, 246, 1)',
                  'rgba(16, 185, 129, 1)'
              ],
              borderWidth: 1
          }]
      };
  }

  getAggregatedData(year, metric) {
      // Lógica para agregar dados conforme filtros
      if (this.currentFilters.item === 'all') {
          return this.data.filiais.reduce((total, filial) => {
              return total + (filial.resumo[year]?.[metric] || 0);
          }, 0);
      } else {
          const filial = this.data.filiais.find(f => f.id == this.currentFilters.item);
          return filial?.resumo[year]?.[metric] || 0;
      }
  }

  getAnnualChartOptions() {
      return {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
              y: {
                  beginAtZero: true,
                  ticks: {
                      callback: (value) => {
                          if (this.currentFilters.metric === 'margem') {
                              return value + '%';
                          }
                          return this.formatValue(value, this.currentFilters.metric);
                      }
                  }
              }
          },
          plugins: {
              tooltip: {
                  callbacks: {
                      label: (context) => {
                          let label = context.dataset.label || '';
                          if (label) {
                              label += ': ';
                          }
                          label += this.formatValue(context.raw, this.currentFilters.metric);
                          return label;
                      }
                  }
              }
          }
      };
  }

  formatValue(value, metric) {
      if (metric === 'margem') {
          return value.toFixed(1) + '%';
      }
      if (metric === 'quantidade') {
          return value.toLocaleString('pt-BR');
      }
      return 'R$ ' + value.toLocaleString('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
      });
  }

  createGrowthChart() {
    const ctx = document.getElementById('growthChart').getContext('2d');
    return new Chart(ctx, {
        type: 'line',
        data: this.prepareGrowthData(),
        options: this.getGrowthChartOptions()
    });
  }

  prepareGrowthData() {
    const years = ['2023', '2024', '2025'];
    const baseYear = this.getAggregatedData('2023', this.currentFilters.metric);
    
    return {
        labels: years,
        datasets: [{
            label: 'Crescimento Anual',
            data: years.map(year => {
                const value = this.getAggregatedData(year, this.currentFilters.metric);
                return ((value - baseYear) / baseYear * 100).toFixed(1);
            }),
            borderColor: 'rgb(16, 185, 129)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.3,
            fill: true
        }]
    };
  }

  getGrowthChartOptions() {
    return {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: false,
                ticks: {
                    callback: (value) => value + '%'
                }
            }
        },
        plugins: {
            tooltip: {
                callbacks: {
                    label: (context) => {
                        return 'Crescimento: ' + context.raw + '%';
                    }
                }
            }
        }
    };
  }

  updateTable() {
    const tbody = document.querySelector('#comparison-table tbody');
    tbody.innerHTML = '';
    
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    months.forEach((month, index) => {
        const row = document.createElement('tr');
        
        const year2023 = this.getMonthlyData('2023', index);
        const year2024 = this.getMonthlyData('2024', index);
        const year2025 = this.getMonthlyData('2025', index);
        
        const growth23to24 = year2023 ? ((year2024 - year2023) / year2023 * 100).toFixed(1) : 'N/A';
        const growth24to25 = year2024 ? ((year2025 - year2024) / year2024 * 100).toFixed(1) : 'N/A';
        
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">${month}</td>
            <td class="px-6 py-4 whitespace-nowrap">${this.formatValue(year2023, this.currentFilters.metric)}</td>
            <td class="px-6 py-4 whitespace-nowrap">${this.formatValue(year2024, this.currentFilters.metric)}</td>
            <td class="px-6 py-4 whitespace-nowrap">${this.formatValue(year2025, this.currentFilters.metric)}</td>
            <td class="px-6 py-4 whitespace-nowrap ${growth23to24 >= 0 ? 'text-green-600' : 'text-red-600'}">
                ${growth23to24}%
            </td>
            <td class="px-6 py-4 whitespace-nowrap ${growth24to25 >= 0 ? 'text-green-600' : 'text-red-600'}">
                ${growth24to25}%
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

getMonthlyData(year, monthIndex) {
    // Lógica para obter dados mensais conforme filtros atuais
    if (this.currentFilters.item === 'all') {
        return this.data.filiais.reduce((total, filial) => {
            return total + (filial.resumo[year]?.venda_mensal?.[monthIndex] || 0);
        }, 0);
    } else {
        const filial = this.data.filiais.find(f => f.id == this.currentFilters.item);
        return filial?.resumo[year]?.venda_mensal?.[monthIndex] || 0;
    }
}

  // ... (implementações similares para createGrowthChart, createMonthlyChart, updateTable)

  updateCharts() {
      this.charts.annual.data = this.prepareAnnualData();
      this.charts.annual.options = this.getAnnualChartOptions();
      this.charts.annual.update();

      // Atualizar outros gráficos de forma similar
      this.updateTable();
  }

  
}