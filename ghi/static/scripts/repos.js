export class ItemsRepository {
  constructor(url, token, data, renderApp, logout) {
    this._token = token;
    this._url = url;
    this._localData = {};
    this._data = data;
    this._renderApp = renderApp;
    this._logout = logout;
    this.getAll();
    this.createItem = this.create.bind(this);
    this.setText = this.set.bind(this, 'text');
    this.remove = id => this.delete.bind(this, id);
  }

  set token(value) { this._token = value; }

  async delete(id) {
    try {
      const response = await fetch(`${this._url}todos/items/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this._token}`,
          'X-Service-Version': '1.0',
        },
      });
      if (response.ok) {
        const stuff = await response.json();
        this._data.items = stuff.items;
        this._data.error = '';
      } else if (response.status == 401) {
        this._logout();
      } else {
        this._data.error = 'Could not get your items. Please try again, later.';
      }
    } catch (e) {
      this._data.error = 'The application is currently down. Please try again, later.';
    }
    this._renderApp();
  }

  async create(event) {
    event.preventDefault();
    try {
      const response = await fetch(`${this._url}todos/items`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this._token}`,
          'Content-Type': 'application/json',
          'X-Service-Version': '1.0',
        },
        body: JSON.stringify({ text: this._localData.text }),
      });
      if (response.ok) {
        const stuff = await response.json();
        this._data.items = stuff.items;
        this._data.error = '';
      } else if (response.status == 401) {
        this._logout();
      } else {
        this._data.error = 'Could not get your items. Please try again, later.';
      }
    } catch (e) {
      this._data.error = 'The application is currently down. Please try again, later.';
    }
    if (!this._data.error) {
      this._localData.text = '';
    }
    this._renderApp();
  }

  async getAll() {
    try {
      const response = await fetch(`${this._url}todos/items`, {
        headers: {
          'Authorization': `Bearer ${this._token}`,
          'X-Service-Version': '1.0'
        }
      });
      if (response.ok) {
        const stuff = await response.json();
        this._data.items = stuff.items;
        this._data.error = '';
      } else if (response.status == 401) {
        this._logout();
      } else {
        this._data.error = 'Could not get your items. Please try again, later.';
      }
    } catch (e) {
      this._data.error = 'The application is currently down. Please try again, later.';
    }
    this._renderApp();
  }

  set(field, event) {
    this._localData[field] = event.srcElement.value;
    this._renderApp();
  }

  get(field) {
    return this._localData[field] || '';
  }
}
