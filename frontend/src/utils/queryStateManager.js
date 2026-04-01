// Query State Manager - Centralized state for smart data explorer
// Manages filters, includes, sorts, pagination, and view modes

export class QueryStateManager {
  constructor(initialState = {}) {
    this.state = {
      entity: initialState.entity || 'projects',
      filters: initialState.filters || {},
      include: initialState.include || [],
      sort: initialState.sort || { field: 'createdAt', order: 'desc' },
      groupBy: initialState.groupBy || null,
      search: initialState.search || '',
      pagination: initialState.pagination || { page: 1, limit: 10 },
      viewMode: initialState.viewMode || 'detailed',
      showTechDetails: false, // Dev mode
    };

    this.listeners = [];
  }

  // Subscribe to state changes
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  // Notify all listeners
  notify() {
    this.listeners.forEach((listener) => listener(this.getState()));
  }

  // Get current state
  getState() {
    return JSON.parse(JSON.stringify(this.state));
  }

  // Update filters
  setFilters(filters) {
    this.state.filters = { ...this.state.filters, ...filters };
    this.state.pagination.page = 1; // Reset to first page
    this.notify();
  }

  // Clear specific filter
  clearFilter(key) {
    delete this.state.filters[key];
    this.state.pagination.page = 1;
    this.notify();
  }

  // Clear all filters
  clearAllFilters() {
    this.state.filters = {};
    this.state.pagination.page = 1;
    this.notify();
  }

  // Update includes (relations)
  setInclude(includes) {
    this.state.include = includes;
    this.notify();
  }

  // Toggle include
  toggleInclude(relation) {
    if (this.state.include.includes(relation)) {
      this.state.include = this.state.include.filter((i) => i !== relation);
    } else {
      this.state.include.push(relation);
    }
    this.notify();
  }

  // Set sorting
  setSort(field, order = 'asc') {
    this.state.sort = { field, order };
    this.notify();
  }

  // Set group by
  setGroupBy(field) {
    this.state.groupBy = field;
    this.notify();
  }

  // Set search term
  setSearch(search) {
    this.state.search = search;
    this.state.pagination.page = 1; // Reset to first page
    this.notify();
  }

  // Set pagination
  setPage(page) {
    this.state.pagination.page = page;
    this.notify();
  }

  // Set limit per page
  setLimit(limit) {
    this.state.pagination.limit = limit;
    this.state.pagination.page = 1;
    this.notify();
  }

  // Set view mode
  setViewMode(mode) {
    this.state.viewMode = mode;
    this.notify();
  }

  // Toggle technical details (dev mode)
  toggleTechDetails() {
    this.state.showTechDetails = !this.state.showTechDetails;
    this.notify();
  }

  // Reset to entity defaults
  resetToDefaults(entity) {
    this.state = {
      entity,
      filters: {},
      include: [],
      sort: { field: 'createdAt', order: 'desc' },
      groupBy: null,
      search: '',
      pagination: { page: 1, limit: 10 },
      viewMode: 'detailed',
      showTechDetails: false,
    };
    this.notify();
  }

  // Get query parameters for API
  getQueryParams() {
    return {
      entity: this.state.entity,
      filters: this.state.filters,
      include: this.state.include,
      sort: this.state.sort,
      groupBy: this.state.groupBy,
      search: this.state.search,
      pagination: this.state.pagination,
      viewMode: this.state.viewMode,
    };
  }
}

export default QueryStateManager;
