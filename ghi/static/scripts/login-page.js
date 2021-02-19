import { html } from 'https://unpkg.com/lit-html?module';

export const LoginPage = (logIn, register, update, { appUrl, appUrlGood, authUrl, authUrlGood, loginError, registerError }) => {
  return html`
    <div class="container">
      <div class="row">
        <div class="one-half column" style="margin-top: 5rem">
        <h1>
            Login
          </h1>
          <form @submit=${logIn}>
            ${ loginError ? html`<p class="error">${loginError}</p>` : '' }
            <label for="email">Your email</label>
            <input @change=${update('email')} class="u-full-width" type="email" placeholder="test@example.com" id="email">
            <label for="password">Password</label>
            <input @change=${update('password')} class="u-full-width" type="password" id="password">
            <button class="button-primary" ?disabled=${!authUrlGood}>Send credentials</button>
          </form>
          <h1>
            Register
          </h1>
          <form @submit=${register}>
            ${ registerError ? html`<p class="error">${registerError}</p>` : '' }
            <label for="reg-email">Your email</label>
            <input @change=${update('regEmail')} class="u-full-width" type="email" placeholder="test@example.com" id="reg-email">
            <label for="reg-password">Password</label>
            <input @change=${update('regPassword')} class="u-full-width" type="password" id="reg-password">
            <button class="button-primary" ?disabled=${!authUrlGood}>Sign up</button>
          </form>
        </div>
        <div class="one-half column" style="margin-top: 5rem">
          <h2>Status</h2>
          <p>
            This is the graphical human interface for an example application.
            You will use Docker to run it from a container.
          </p>
          <h3>Configuration</h3>
          <p>For this application to work, the following environment variables must be set.</p>
          <h4>APP_URL</h4>
          <div class="status-report">
            ${ appUrl === 'error://not_found' ?
              html`<div class="error">✖ No APP_URL found in the environment</div>` :
              html`<div class="success">✓ APP_URL = ${appUrl}</div>`}
            ${ appUrl === 'error://not_found' ? '' :
              appUrlGood === undefined ? html`<div>resolving APP_URL...</div>` : 
              appUrlGood ?
                html`<div class="success">✓ APP_URL is reachable</div>` :
                html`<div class="error">✖ ${appUrl} cannot be reached</div>`}
          </div>
          <h4>AUTH_URL</h4>
          <div class="status-report">
            ${ authUrl === 'error://not_found' ?
              html`<div class="error">✖ No AUTH_URL found in the environment</div>` :
              html`<div class="success">✓ AUTH_URL = ${authUrl}</div>`}
            ${ authUrl === 'error://not_found' ? '' :
              authUrlGood === undefined ? html`<div>resolving AUTH_URL</div>` : 
              authUrlGood ?
                html`<div class="success">✓ AUTH_URL is reachable</div>` :
                html`<div class="error">✖ ${authUrl} cannot be reached</div>`}
          </div>
        </div>
      </div>
    </div>
  `;
};
