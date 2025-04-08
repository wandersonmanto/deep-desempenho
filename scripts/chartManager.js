// scripts/chartManager.js

class ChartManager {
  constructor() {
      this.charts = {
        sales: null,
        departments: null,
        weekday: null
    };
  }

  /**
   * Inicializa todos os gráficos
   * @param {Object} data - Dados iniciais
   */
  init(data) {
    this.initSalesChart(data);
    this.initDepartmentsChart(data);
    // this.initWeekdayChart(data);
  }

  /**
   * Gráfico de vendas mensais
   */
  initSalesChart(data) {
      const ctx = document.getElementById('salesChart').getContext('2d');
      this.charts.sales = new Chart(ctx, {
        type: 'line',
        data: this.prepareSalesData(data),
        options: this.getSalesChartOptions()
      });
  }

  /**
   * Gráfico de departamentos
   */
  initDepartmentsChart(data) {
      const ctx = document.getElementById('departmentsChart').getContext('2d');
      this.charts.departments = new Chart(ctx, {
        type: 'bar',
        data: this.prepareDepartmentsData(data),
        options: this.getDepartmentsChartOptions()
      });
  }

  /**
   * Atualiza todos os gráficos com novos dados
   * @param {Object} filteredData - Dados filtrados
   */
  update(filteredData) {
    this.charts.sales.data = this.prepareSalesData(filteredData);
    this.charts.sales.update();
    
    this.charts.departments.data = this.prepareDepartmentsData(filteredData);
    this.charts.departments.update();
    
  }

  // Métodos de preparação de dados...
  prepareSalesData(data) {
    // Implementação similar à anterior, mas usando os dados recebidos
    return {
      labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
      datasets: [{
        label: 'Venda Líquida',
        data: data.filiais[0].resumo['2025'].venda_mensal || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.3,
        fill: true
      }]
    };
  }

  /**
   * Opções para gráfico de vendas mensais
   */
  getSalesChartOptions() {
      return {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
              tooltip: {
                  callbacks: {
                      label: function(context) {
                          return `R$ ${context.raw.toLocaleString('pt-BR', { 
                              minimumFractionDigits: 2, 
                              maximumFractionDigits: 2 
                          })}`;
                      }
                  }
              }
          },
          scales: {
              y: {
                  beginAtZero: false,
                  ticks: {
                      callback: function(value) {
                          return `R$ ${value.toLocaleString('pt-BR')}`;
                      }
                  }
              }
          }
      };
  }

  /**
   * Prepara dados para gráfico de departamentos
   */
  prepareDepartmentsData(data) {
      // Ordena departamentos por lucro (decrescente)
      const sortedDepts = [...(data.top_departamentos || [])].sort((a, b) => b.lucro_liq - a.lucro_liq);
      
      return {
          labels: sortedDepts.map(depto => depto.nome),
          datasets: [{
              label: 'Lucro Líquido (R$)',
              data: sortedDepts.map(depto => depto.lucro_liq),
              backgroundColor: [
                  'rgba(99, 102, 241, 0.7)',
                  'rgba(59, 130, 246, 0.7)',
                  'rgba(16, 185, 129, 0.7)',
                  'rgba(245, 158, 11, 0.7)',
                  'rgba(239, 68, 68, 0.7)'
              ],
              borderColor: [
                  'rgba(99, 102, 241, 1)',
                  'rgba(59, 130, 246, 1)',
                  'rgba(16, 185, 129, 1)',
                  'rgba(245, 158, 11, 1)',
                  'rgba(239, 68, 68, 1)'
              ],
              borderWidth: 1
          }]
      };
  }

  /**
   * Opções para gráfico de departamentos
   */
  getDepartmentsChartOptions() {
      return {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
              legend: {
                  position: 'top',
              },
              tooltip: {
                  callbacks: {
                      label: function(context) {
                          return `R$ ${context.raw.toLocaleString('pt-BR', { 
                              minimumFractionDigits: 2, 
                              maximumFractionDigits: 2 
                          })}`;
                      }
                  }
              }
          },
          scales: {
              y: {
                  beginAtZero: true,
                  ticks: {
                      callback: function(value) {
                          return `R$ ${value.toLocaleString('pt-BR')}`;
                      }
                  }
              }
          }
      };
  }

  /**
   * Destrói todos os gráficos (para limpeza)
   */
  destroy() {
      Object.values(this.charts).forEach(chart => {
          if (chart) chart.destroy();
      });
      this.charts = {
          sales: null,
          departments: null,
          weekday: null
      };
  }

  
}