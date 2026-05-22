(() => {
  const app = (window.AudioTTo = window.AudioTTo || {});

  app.showLoginForm = function showLoginForm() {
    const { loginTab, signupTab, loginForm, signupForm } = app.dom;
    if (loginTab) loginTab.classList.add('active');
    if (signupTab) signupTab.classList.remove('active');
    if (loginForm) loginForm.classList.remove('hidden');
    if (signupForm) signupForm.classList.add('hidden');
  };

  app.showSignupForm = function showSignupForm() {
    const { loginTab, signupTab, loginForm, signupForm } = app.dom;
    if (signupTab) signupTab.classList.add('active');
    if (loginTab) loginTab.classList.remove('active');
    if (signupForm) signupForm.classList.remove('hidden');
    if (loginForm) loginForm.classList.add('hidden');
  };

  async function handleAuthSubmit(endpoint, username, password) {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || 'Authentication failed');
    }

    app.setSession(data.access_token, data.user);
    app.setAuthUI(true);
    await afterLoginInit();
  }

  async function afterLoginInit() {
    if (typeof app.initThreadsInfo === 'function') {
      await app.initThreadsInfo();
    }
    if (typeof app.loadOutputs === 'function') {
      await app.loadOutputs();
    }
    if (typeof app.loadHistory === 'function') {
      await app.loadHistory();
    }
  }

  app.validateSession = async function validateSession() {
    const token = app.getToken();
    if (!token) {
      app.setAuthUI(false);
      return;
    }

    try {
      const res = await app.authFetch('/me');
      if (!res.ok) throw new Error('Invalid token');
      const user = await res.json();
      app.setSession(token, user);
      app.setAuthUI(true);
      await afterLoginInit();
    } catch (_) {
      app.clearSession();
      app.setAuthUI(false);
    }
  };

  function bindPasswordEye(buttonEl, inputEl) {
    if (!buttonEl || !inputEl) return;
    buttonEl.addEventListener('click', () => {
      const type = inputEl.getAttribute('type') === 'password' ? 'text' : 'password';
      inputEl.setAttribute('type', type);
    });
  }

  app.bindAuth = function bindAuth() {
    const { loginTab, signupTab, loginForm, signupForm } = app.dom;

    if (loginTab) loginTab.addEventListener('click', app.showLoginForm);
    if (signupTab) signupTab.addEventListener('click', app.showSignupForm);

    bindPasswordEye(app.dom.loginEyeBtn, app.dom.loginPassword);
    bindPasswordEye(app.dom.signupEyeBtn, app.dom.signupPassword);

    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value;

        if (!username || !password) {
          app.showToast('Username and password are required.', 'error');
          return;
        }

        try {
          await handleAuthSubmit('/login', username, password);
          app.showToast('Login successful!', 'success');
          loginForm.reset();
        } catch (err) {
          app.showToast(err.message || String(err), 'error');
        }
      });
    }

    if (signupForm) {
      signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('signup-username').value.trim();
        const password = document.getElementById('signup-password').value;

        if (!username || !password) {
          app.showToast('Username and password are required.', 'error');
          return;
        }

        try {
          await handleAuthSubmit('/signup', username, password);
          app.showToast('Account created successfully!', 'success');
          signupForm.reset();
        } catch (err) {
          app.showToast(err.message || String(err), 'error');
        }
      });
    }
  };
})();
