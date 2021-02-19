import { html } from 'https://unpkg.com/lit-html?module';
import { repeat } from 'https://unpkg.com/lit-html/directives/repeat.js?module';

export const Todos = (logOut, data, repo) => {
  const text = repo.get('text').trim();
  return html`
    <div class="container">
      <div class="row toolbar">
        <button class="button-primary" @click=${logOut}>Log out</button>
      </div>
      <div class="row">
        <div class="nine columns">
          <form id="todo-form" @submit=${repo.createItem}>
            <label for="text">Your to-do item</label>
            <input @keyup=${repo.setText} .value=${text} class="u-full-width" id="text" type="text">
          </form>
        </div>
        <div class="three columns">
          <label>&nbsp;</label>
          <button form="todo-form" ?disabled=${!text}>Create</button>
        </div>
      </div>
      ${data.error ?
        html`<p class="error">${data.error}</p>` :
        data.items.length > 0 ? '' :
          html`<h3>You have no items. Create one. :-)</h3>` }
      ${repeat(data.items, item => item.id, item => html`
        <div class="row">
          <div @click=${repo.remove(item.id)} class="one column right-align">✖</div>
          <div class="eleven columns">${item.text}</div>
        </div>
      `)}
    </div>
  `;
};
