// scripts/chartManager.js

export class ChartManager {
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
      this.initWeekdayChart(data);
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
   * Gráfico de dias da semana
   */
  initWeekdayChart(data) {
      const ctx = document.getElementById('weekdayChart').getContext('2d');
      this.charts.weekday = new Chart(ctx, {
          type: 'doughnut',
          data: this.prepareWeekdayData(data),
          options: this.getWeekdayChartOptions()
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
      
      this.charts.weekday.data = this.prepareWeekdayData(filteredData);
      this.charts.weekday.update();
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

  prepareDepartmentsData(data) {
      return {
          labels: data.top_departamentos.map(depto => depto.nome),
          datasets: [{
              label: 'Lucro Líquido',
              data: data.top_departamentos.map(depto => depto.lucro_liq),
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

  // ... (outros métodos de preparação de dados e opções)
}