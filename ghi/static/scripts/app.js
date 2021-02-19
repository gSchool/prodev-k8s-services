import { html, render } from 'https://unpkg.com/lit-html?module';
import { LoginPage } from './login-page.js';
import { Todos } from './todos-page.js';
import { ItemsRepository } from './repos.js';

const TOKEN_KEY = 'hrprodev:composed-ghi-service';

const appUrl = '/api/app/';
const authUrl = '/api/auth/';
const status = {
  appUrl,
  authUrl,
  show: 'login',
};
const auth = {
  email: '',
  password: '',
  regEmail: '',
  regPassword: '',
};
const data = {
  items: [],
};

let token = JSON.parse(window.localStorage.getItem(TOKEN_KEY));

const renderApp = () => {
  render(App({ token, data, status }), document.querySelector('main'));
}

const update = field => event => {
  auth[field] = event.srcElement.value;
};

const checkUrl = async (url, field) => {
  let good = true;
  try {
    const response = await fetch(url);
    good = response.ok || response.status === 401;
  } catch {
    good = false;
  }
  status[field] = good;
  renderApp();
}

const logIn = async (event) => {
  status.loginError = '';
  renderApp();
  event.preventDefault();
  const response = await fetch(`${authUrl}login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Service-Version': '1.0' },
    body: JSON.stringify({ ...auth }),
  });
  if (!response.ok) {
    status.loginError = 'Could not log in with those credentials.';
    renderApp();
  } else {
    const data = await response.json();
    token = data.token;
    window.localStorage.setItem(TOKEN_KEY, JSON.stringify(token));
    repo.token = token;
    await repo.getAll();
  }
};

const register = async (event) => {
  status.loginError = '';
  renderApp();
  event.preventDefault();
  const credentials = { email: auth.regEmail, password: auth.regPassword };
  const response = await fetch(`${authUrl}register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Service-Version': '1.0' },
    body: JSON.stringify({ ...credentials }),
  });
  if (!response.ok) {
    status.registerError = 'Could not sign up with those credentials.';
  } else {
    const data = await response.json();
    token = data.token;
    window.localStorage.setItem(TOKEN_KEY, JSON.stringify(token));
  }
  renderApp();
};

const logOut = () => {
  token = null;
  window.localStorage.removeItem(TOKEN_KEY);
  data.items = [];
  checkUrl(appUrl, 'appUrlGood');
  checkUrl(authUrl, 'authUrlGood');
};

const repo = new ItemsRepository(appUrl, token, data, renderApp, logOut);

const App = ({ token, data, status }) => {
  if (!token) {
    return LoginPage(logIn, register, update, status);
  } else {
    return Todos(logOut, data, repo);
  }
};

if (!token) {
  checkUrl(appUrl, 'appUrlGood');
  checkUrl(authUrl, 'authUrlGood');
}
