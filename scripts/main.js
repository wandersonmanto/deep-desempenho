// scripts/main.js

// Objeto global para armazenar os dados e estado do dashboard
const Dashboard = {
  data: null,
  currentFilters: {
      filial: null,
      setor: null,
      departamento: null,
      secao: null
  },
  charts: {
      sales: null,
      departments: null,
      weekday: null
  }
};

// Função principal que será executada quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', async function() {
  try {
      // Mostrar estado de carregamento
      showLoadingState();
      
      // Carregar os dados
      Dashboard.data = await loadData();
      
      // Inicializar os filtros
      initializeFilters();
      
      // Atualizar a data de atualização
      updateDate();
      
      // Carregar os dados iniciais
      loadInitialData();
      
      // Inicializar os gráficos
      initializeCharts();
      
  } catch (error) {
      console.error('Erro ao carregar o dashboard:', error);
      showErrorState();
  }
});

// Função para carregar os dados do JSON
async function loadData() {
  try {
      const response = await fetch('/data.json');
      if (!response.ok) {
          throw new Error('Falha ao carregar dados');
      }
      return await response.json();
  } catch (error) {
      console.error('Erro ao carregar dados:', error);
      throw error;
  }
}

// Função para mostrar estado de carregamento
function showLoadingState() {
  document.getElementById('update-date').textContent = 'Carregando dados...';
  // Você pode adicionar um spinner ou skeleton screen aqui
}

// Função para mostrar estado de erro
function showErrorState() {
  document.getElementById('update-date').textContent = 'Erro ao carregar dados';
  // Você pode adicionar uma mensagem de erro mais elaborada aqui
}

// Função para atualizar a data de atualização
function updateDate() {
  const now = new Date();
  const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
  const formattedDate = now.toLocaleDateString('pt-BR', options);
  document.getElementById('update-date').textContent = `Atualizado em: ${formattedDate}`;
}

// Função para inicializar os filtros (será implementada no próximo passo)
function initializeFilters() {
  console.log('Inicializando filtros...');
  // Implementação virá aqui
}

// Função para carregar dados iniciais
function loadInitialData() {
  // Atualizar cards de resumo
  updateSummaryCards();
  
  // Atualizar tabela de produtos
  updateProductsTable();
}

// Função para atualizar os cards de resumo
function updateSummaryCards() {
  const resumo = Dashboard.data.filiais[0].resumo['2025'];
  
  const cardsData = [
      {
          title: 'Venda Líquida',
          value: resumo.venda_liq,
          variation: resumo.variacao.venda_liq,
          icon: 'trending-up',
          color: 'green'
      },
      {
          title: 'Lucro Líquido',
          value: resumo.lucro_liq,
          variation: resumo.variacao.lucro_liq,
          icon: 'currency',
          color: 'blue'
      },
      {
          title: 'Margem de Lucro',
          value: resumo.margem,
          variation: resumo.variacao.margem,
          icon: 'chart-bar',
          color: 'purple',
          isPercentage: true
      },
      {
          title: 'Itens Vendidos',
          value: resumo.quantidade,
          variation: resumo.variacao.quantidade,
          icon: 'shopping-cart',
          color: 'orange'
      }
  ];
  
  const cardsContainer = document.getElementById('summary-cards');
  cardsContainer.innerHTML = '';
  
  cardsData.forEach(card => {
      const variationClass = card.variation >= 0 ? 'text-green-600' : 'text-red-600';
      const variationSymbol = card.variation >= 0 ? '↑' : '↓';
      
      const cardElement = document.createElement('div');
      cardElement.className = 'bg-white rounded-lg shadow p-6';
      cardElement.innerHTML = `
          <div class="flex items-center justify-between">
              <div>
                  <p class="text-gray-500">${card.title}</p>
                  <h3 class="text-2xl font-bold">${formatValue(card.value, card.isPercentage)}</h3>
              </div>
              <div class="bg-${card.color}-100 p-3 rounded-full">
                  ${getIconSVG(card.icon, card.color)}
              </div>
          </div>
          <p class="text-sm text-gray-500 mt-2">
              <span class="${variationClass}">${variationSymbol} ${Math.abs(card.variation)}%</span> vs mês anterior
          </p>
      `;
      
      cardsContainer.appendChild(cardElement);
  });
}

// Função auxiliar para formatar valores
function formatValue(value, isPercentage = false) {
  if (isPercentage) {
      return `${value.toLocaleString('pt-BR')}%`;
  }
  
  if (typeof value === 'number') {
      return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  
  return value.toLocaleString('pt-BR');
}

// Função auxiliar para obter ícones SVG
function getIconSVG(icon, color) {
  const icons = {
      'trending-up': `<svg class="w-6 h-6 text-${color}-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
      </svg>`,
      'currency': `<svg class="w-6 h-6 text-${color}-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>`,
      'chart-bar': `<svg class="w-6 h-6 text-${color}-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
      </svg>`,
      'shopping-cart': `<svg class="w-6 h-6 text-${color}-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
      </svg>`
  };
  
  return icons[icon] || '';
}

// Função para atualizar a tabela de produtos
function updateProductsTable() {
  const tableBody = document.getElementById('products-table-body');
  tableBody.innerHTML = '';
  
  Dashboard.data.top_produtos.forEach(product => {
      const row = document.createElement('tr');
      row.innerHTML = `
          <td class="px-6 py-4 whitespace-nowrap">${product.nome}</td>
          <td class="px-6 py-4 whitespace-nowrap">${product.departamento}</td>
          <td class="px-6 py-4 whitespace-nowrap">${product.quantidade.toLocaleString('pt-BR')}</td>
          <td class="px-6 py-4 whitespace-nowrap">${formatValue(product.venda_liq)}</td>
          <td class="px-6 py-4 whitespace-nowrap text-green-600">${formatValue(product.lucro)}</td>
      `;
      tableBody.appendChild(row);
  });
}

// Função para inicializar os gráficos (será implementada mais tarde)
function initializeCharts() {
  console.log('Inicializando gráficos...');
  // Implementação virá aqui
}