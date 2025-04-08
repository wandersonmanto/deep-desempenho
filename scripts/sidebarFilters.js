// scripts/sidebarFilters.js

class SidebarFilters {
  /**
   * Construtor da classe SidebarFilters
   * @param {Object} data - Dados completos do dashboard
   */
  constructor(data) {
    // Armazena os dados recebidos
    this.data = data;

    // Estado atual dos filtros
    this.currentFilters = {
        filial: null,
        setor: null,
        departamento: null,
        secao: null
    };

    // Referências aos elementos DOM
    this.elements = {
        filial: document.getElementById('filial-filter'),
        setor: document.getElementById('setor-filter'),
        departamento: document.getElementById('departamento-filter'),
        secao: document.getElementById('secao-filter')
    };

    // Callback padrão vazio
    this.onFilterChange = () => {};
  }

  /**
   * Inicializa o sistema de filtros
   */
  init() {
    this.populateFilialFilter();
    this.setupEventListeners();
  }

  /**
   * Popula o dropdown de filiais
   */
  populateFilialFilter() {
    const filialSelect = this.elements.filial;
    filialSelect.innerHTML = '<option value="">Todas Filiais</option>';
    
    this.data.filiais.forEach(filial => {
      const option = document.createElement('option');
      option.value = filial.id;
      option.textContent = filial.nome;
      filialSelect.appendChild(option);
    });
  }

  /**
   * Popula o dropdown de setores baseado na filial selecionada
   * @param {string} filialId - ID da filial selecionada
   */
  populateSetorFilter(filialId) {
    const setorSelect = this.elements.setor;
    setorSelect.innerHTML = '<option value="">Todos Setores</option>';
    setorSelect.disabled = true;

    if (!filialId) return;

    const filial = Dashboard.data.filiais.find(f => f.id == filialId);
    if (!filial) return;
    
    filial.setores.forEach(setor => {
      const option = document.createElement('option');
      option.value = setor.id;
      option.textContent = setor.nome;
      setorSelect.appendChild(option);
    });

    setorSelect.disabled = false;
    this.resetDependentFilters('setor');
  }

  /**
   * Popula o dropdown de departamentos
   * @param {string} filialId - ID da filial
   * @param {string} setorId - ID do setor
   */
  populateDepartamentoFilter(filialId, setorId) {
    const deptoSelect = this.elements.departamento;
    deptoSelect.innerHTML = '<option value="">Todos Departamentos</option>';
    deptoSelect.disabled = true;

    if (!filialId || !setorId) return;

    const filial = this.data.filiais.find(f => f.id == filialId);
    if (!filial) return;

    const setor = filial.setores.find(s => s.id == setorId);
    if (!setor) return;

    setor.departamentos.forEach(depto => {
      const option = document.createElement('option');
      option.value = depto.id;
      option.textContent = depto.nome;
      deptoSelect.appendChild(option);
    });

    deptoSelect.disabled = false;
    this.resetDependentFilters('departamento');
  }

  /**
   * Popula o dropdown de seções
   * @param {string} filialId - ID da filial
   * @param {string} setorId - ID do setor
   * @param {string} deptoId - ID do departamento
   */
  populateSecaoFilter(filialId, setorId, deptoId) {
    console.log('populateSecaoFilter', {filialId, setorId, deptoId});
    const secaoSelect = this.elements.secao;
    secaoSelect.innerHTML = '<option value="">Todas Seções</option>';
    secaoSelect.disabled = true;
    
    if (!filialId || !setorId || !deptoId) return;
    
    const filial = this.data.filiais.find(f => f.id == filialId);
    if (!filial) return;
    
    const setor = filial.setores.find(s => s.id == setorId);
    if (!setor) return;
    
    const depto = setor.departamentos.find(d => d.id == deptoId);
    if (!depto) return;
    
    depto.secoes.forEach(secao => {
      const option = document.createElement('option');
      option.value = secao.id;
      option.textContent = secao.nome;
      secaoSelect.appendChild(option);
    });
    
    secaoSelect.disabled = false;
    this.resetDependentFilters('secao');
  }

  /**
   * Reseta os filtros dependentes quando um filtro pai é alterado
   * @param {string} changedFilter - Nome do filtro que foi alterado
   */
  resetDependentFilters(changedFilter) {
    const hierarchy = ['filial', 'setor', 'departamento', 'secao'];
    const startIndex = hierarchy.indexOf(changedFilter) + 1;
    
    for (let i = startIndex; i < hierarchy.length; i++) {
      const filterName = hierarchy[i];
      this.currentFilters[filterName] = null;
      this.elements[filterName].value = '';
      this.elements[filterName].disabled = true;
    }
  }

  /**
   * Configura os event listeners para os dropdowns
   */
  setupEventListeners() {
    this.elements.filial.addEventListener('change', (e) => this.handleFilialChange(e));
    this.elements.setor.addEventListener('change', (e) => this.handleSetorChange(e));
    this.elements.departamento.addEventListener('change', (e) => this.handleDepartamentoChange(e));
    this.elements.secao.addEventListener('change', (e) => this.handleSecaoChange(e));
    // ... (outros listeners)
  }

  /**
   * Handler para mudança no filtro de filial
   * @param {Event} event - Evento de change
   */
  handleFilialChange(event) {
    this.currentFilters.filial = event.target.value || null;
    this.populateSetorFilter(event.target.value);
    this.notifyFilterChange();
  }

  /**
   * Handler para mudança no filtro de setor
   * @param {Event} event - Evento de change
   */
  handleSetorChange(event) {
    this.currentFilters.setor = event.target.value || null;
    this.populateDepartamentoFilter(this.currentFilters.filial, event.target.value);
    this.notifyFilterChange();
  }

  /**
   * Handler para mudança no filtro de departamento
   * @param {Event} event - Evento de change
   */
  handleDepartamentoChange(event) {
    this.currentFilters.departamento = event.target.value || null;
    this.populateSecaoFilter(
      this.currentFilters.filial, 
      this.currentFilters.setor, 
      event.target.value
    );
    this.notifyFilterChange();
  }

  /**
   * Handler para mudança no filtro de seção
   * @param {Event} event - Evento de change
   */
  handleSecaoChange(event) {
    this.currentFilters.secao = event.target.value || null;
    this.notifyFilterChange();
  }

  /**
   * Notifica sobre mudanças nos filtros
   */
  notifyFilterChange() {
    // Chama o callback com uma cópia dos filtros atuais
    this.onFilterChange({...this.currentFilters});
  }

  /**
   * Obtém os dados filtrados com base nos filtros atuais
   * @returns {Object} Dados filtrados
   */
  getFilteredData() {
    // Implementação da lógica de filtragem mostrada anteriormente
    // (pode ser movida para esta classe)
  }
  
}