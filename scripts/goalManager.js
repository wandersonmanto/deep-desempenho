// scripts/goalManager.js

export class GoalManager {
  constructor() {
      this.currentFilters = {
          level: 'loja',
          item: 'all',
          month: new Date().getMonth(),
          adjustment: 10
      };
      this.chart = null;
      this.init();
  }

  async init() {
      this.data = await this.loadData();
      this.setupEventListeners();
      this.initChart();
      this.calculateGoals();
  }

  async loadData() {
      const response = await fetch('data.json');
      return await response.json();
  }

  setupEventListeners() {
      // Nível de agregação
      document.getElementById('goal-level').addEventListener('change', (e) => {
          this.currentFilters.level = e.target.value;
          this.updateItemDropdown();
          this.calculateGoals();
      });

      // Item específico
      document.getElementById('goal-item').addEventListener('change', (e) => {
          this.currentFilters.item = e.target.value;
          this.calculateGoals();
      });

      // Mês
      document.getElementById('goal-month').addEventListener('change', (e) => {
          this.currentFilters.month = parseInt(e.target.value);
          this.calculateGoals();
      });

      // Ajuste percentual
      document.getElementById('goal-adjustment').addEventListener('input', (e) => {
          this.currentFilters.adjustment = parseInt(e.target.value);
          document.getElementById('adjustment-value').textContent = `${e.target.value}%`;
          this.calculateGoals();
      });

      // Botão calcular
      document.getElementById('calculate-goal').addEventListener('click', () => {
          this.calculateGoals();
      });
  }

  updateItemDropdown() {
      const itemSelect = document.getElementById('goal-item');
      itemSelect.innerHTML = '<option value="all">Todos</option>';

      if (this.currentFilters.level === 'loja') {
          this.data.filiais.forEach(filial => {
              const option = document.createElement('option');
              option.value = filial.id;
              option.textContent = filial.nome;
              itemSelect.appendChild(option);
          });
      }
      // Implementar lógica para outros níveis (setor, departamento, seção)
  }

  initChart() {
      const ctx = document.getElementById('historicalBasisChart').getContext('2d');
      this.chart = new Chart(ctx, {
          type: 'bar',
          data: this.prepareChartData(),
          options: this.getChartOptions()
      });
  }

  prepareChartData() {
      const years = ['2023', '2024', '2025'];
      const monthIndex = this.currentFilters.month;
      
      return {
          labels: years,
          datasets: [{
              label: this.getMonthName(this.currentFilters.month),
              data: years.map(year => {
                  if (year === '2025' && monthIndex > new Date().getMonth()) {
                      return null; // Não mostrar dados futuros
                  }
                  return this.getMonthlyData(year, monthIndex);
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

  getMonthlyData(year, monthIndex) {
      // Lógica para obter dados mensais conforme filtros
      if (this.currentFilters.item === 'all') {
          return this.data.filiais.reduce((total, filial) => {
              return total + (filial.resumo[year]?.venda_mensal?.[monthIndex] || 0);
          }, 0);
      } else {
          const filial = this.data.filiais.find(f => f.id == this.currentFilters.item);
          return filial?.resumo[year]?.venda_mensal?.[monthIndex] || 0;
      }
  }

  getChartOptions() {
      return {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
              y: {
                  beginAtZero: false,
                  ticks: {
                      callback: (value) => 'R$ ' + value.toLocaleString('pt-BR')
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
                          if (context.raw === null) {
                              label += 'Projeção';
                          } else {
                              label += 'R$ ' + context.raw.toLocaleString('pt-BR');
                          }
                          return label;
                      }
                  }
              }
          }
      };
  }

  calculateGoals() {
      const monthIndex = this.currentFilters.month;
      const monthName = this.getMonthName(monthIndex);
      
      // Obter dados históricos
      const lastYearData = this.getMonthlyData('2024', monthIndex);
      const twoYearsAgoData = this.getMonthlyData('2023', monthIndex);
      
      // Calcular crescimento histórico
      const historicalGrowth = lastYearData && twoYearsAgoData ? 
          (lastYearData - twoYearsAgoData) / twoYearsAgoData : 0.1; // Default 10%
      
      // Calcular meta base
      const baseGoal = lastYearData * (1 + historicalGrowth);
      
      // Aplicar ajuste do usuário
      const adjustedGoal = baseGoal * (1 + this.currentFilters.adjustment / 100);
      
      // Calcular metas conservadora e ambiciosa
      const conservativeGoal = adjustedGoal * 0.95;
      const ambitiousGoal = adjustedGoal * 1.05;
      
      // Atualizar UI
      this.updateGoalUI({
          month: monthName,
          conservative: conservativeGoal,
          moderate: adjustedGoal,
          ambitious: ambitiousGoal,
          historicalGrowth: (historicalGrowth * 100).toFixed(1),
          currentYearGrowth: this.calculateCurrentYearGrowth()
      });
      
      // Atualizar gráfico
      this.chart.data = this.prepareChartData();
      this.chart.update();
  }

  updateGoalUI(data) {
      // Atualizar valores principais
      document.getElementById('goal-month-display').textContent = data.month;
      document.getElementById('moderate-goal-value').textContent = this.formatCurrency(data.moderate);
      
      // Atualizar barras de progresso
      this.updateProgressBar('conservative', data.conservative, 80);
      this.updateProgressBar('moderate', data.moderate, 90);
      this.updateProgressBar('ambitious', data.ambitious, 100);
      
      // Atualizar fatores considerados
      document.getElementById('historical-growth').textContent = `${data.historicalGrowth}%`;
      document.getElementById('current-growth').textContent = `${data.currentYearGrowth}%`;
      
      // Atualizar recomendação
      const recommendation = document.getElementById('recommendation-text');
      recommendation.innerHTML = `Recomendamos a meta <strong>${this.formatCurrency(data.moderate)}</strong> para ${data.month}, 
          representando um crescimento de <strong>${this.currentFilters.adjustment}%</strong> sobre o ano anterior 
          e alinhado com o crescimento histórico.`;
  }

  updateProgressBar(type, value, percentage) {
      const container = document.getElementById(`${type}-goal-container`);
      container.querySelector('.goal-value').textContent = this.formatCurrency(value);
      
      const bar = container.querySelector('.progress-bar');
      bar.style.width = `${percentage}%`;
      bar.className = `progress-bar h-2.5 rounded-full ${this.getProgressBarColor(type)}`;
  }

  getProgressBarColor(type) {
      return {
          conservative: 'bg-yellow-500',
          moderate: 'bg-blue-500',
          ambitious: 'bg-green-500'
      }[type];
  }

  formatCurrency(value) {
      return 'R$ ' + value.toLocaleString('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
      });
  }

  getMonthName(index) {
      const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                     'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
      return months[index];
  }

  calculateCurrentYearGrowth() {
      // Lógica para calcular crescimento no ano atual
      return 12.0; // Exemplo simplificado
  }
}