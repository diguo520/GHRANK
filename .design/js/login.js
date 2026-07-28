/**
 * login.js — React 19 组件：LoginPage
 * ────────────────────────────────────────────────────────────────────────
 * 职责：Tab 切换、表单验证、提交处理、社交按钮、toast 提示、loading 状态
 * 架构：通过 GHRANK.mountChrome('login', LoginPage) 挂载，portal 到 #chrome-body
 * 依赖：React 19 (UMD)、ReactDOM 19 (UMD)、Babel Standalone、core.js (GHRANK)
 *
 * 设计说明：
 * - 所有表单状态由 React state 管理（activeTab / 字段值 / errors / loading）
 * - toast 仍使用 DOM 创建（body 级浮层，跨 React 树，避免 portal 复杂化）
 * - 表单验证逻辑与原 DOM 版本完全一致
 * - className 保持不变（login-tab / login-form / login-input / login-field-error 等）
 * - 不使用 ES module，通过 window.GHRANK 访问 React 与挂载入口
 * ═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var { useState, useCallback } = React;

  /* ═══════════════════════════════════════════════════════════════
     1. Toast helper —— body 级浮层，保持 DOM 实现
        原因：toast 是全局浮层，独立于 React 树，用 DOM 更简单
     ═══════════════════════════════════════════════════════════════ */
  var toastEl = null;
  var toastTimer = null;

  function showToast(msg, duration) {
    // 懒创建 toast 元素，仅首次调用时挂到 body
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'login-toast';
      toastEl.id = 'loginToast';
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove('visible');
    }, duration || 3000);
  }

  /* ── 邮箱校验正则（与原版一致）── */
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /* ═══════════════════════════════════════════════════════════════
     2. LoginPage 组件 —— 登录/注册完整交互
     ═══════════════════════════════════════════════════════════════ */
  function LoginPage() {
    // Tab 状态：'signin' | 'register'
    var [activeTab, setActiveTab] = useState('signin');

    // Sign In 表单字段
    var [signinEmail, setSigninEmail] = useState('');
    var [signinPassword, setSigninPassword] = useState('');
    var [rememberMe, setRememberMe] = useState(false);

    // Register 表单字段
    var [regUsername, setRegUsername] = useState('');
    var [regEmail, setRegEmail] = useState('');
    var [regPassword, setRegPassword] = useState('');
    var [regConfirm, setRegConfirm] = useState('');

    // 错误对象：{ signinEmail: '...', regPassword: '...' }
    // 统一用一个对象管理所有字段错误，便于 Tab 切换时整体清空
    var [errors, setErrors] = useState({});

    // Loading 状态（两个表单独立）
    var [signinLoading, setSigninLoading] = useState(false);
    var [registerLoading, setRegisterLoading] = useState(false);

    /* ── Tab 切换：切换时清空所有错误 ── */
    var switchTab = useCallback(function (tab) {
      setActiveTab(tab);
      setErrors({});
    }, []);

    /* ── 清除单个字段错误（用户输入时实时清除）── */
    var clearFieldError = useCallback(function (field) {
      setErrors(function (prev) {
        if (!prev[field]) return prev;
        var next = Object.assign({}, prev);
        delete next[field];
        return next;
      });
    }, []);

    /* ── Sign In 提交：验证 + 模拟登录 ── */
    var handleSigninSubmit = useCallback(function (e) {
      e.preventDefault();
      var newErrors = {};

      if (!signinEmail.trim()) {
        newErrors.signinEmail = 'Email or username is required';
      }

      if (!signinPassword) {
        newErrors.signinPassword = 'Password is required';
      } else if (signinPassword.length < 6) {
        newErrors.signinPassword = 'Password must be at least 6 characters';
      }

      setErrors(newErrors);
      if (Object.keys(newErrors).length > 0) return;

      // 模拟登录请求
      setSigninLoading(true);
      setTimeout(function () {
        var userName = signinEmail.trim().split('@')[0] || signinEmail.trim();
        localStorage.setItem('ghrank_logged_in', '1');
        localStorage.setItem('ghrank_user_name', userName);
        window.location.href = 'index.html';
      }, 1200);
    }, [signinEmail, signinPassword]);

    /* ── Register 提交：验证 + 模拟注册 ── */
    var handleRegisterSubmit = useCallback(function (e) {
      e.preventDefault();
      var newErrors = {};

      if (!regUsername.trim()) {
        newErrors.regUsername = 'Username is required';
      } else if (regUsername.trim().length < 3) {
        newErrors.regUsername = 'Username must be at least 3 characters';
      }

      if (!regEmail.trim()) {
        newErrors.regEmail = 'Email is required';
      } else if (!EMAIL_RE.test(regEmail.trim())) {
        newErrors.regEmail = 'Enter a valid email address';
      }

      if (!regPassword) {
        newErrors.regPassword = 'Password is required';
      } else if (regPassword.length < 6) {
        newErrors.regPassword = 'Password must be at least 6 characters';
      }

      if (!regConfirm) {
        newErrors.regConfirm = 'Please confirm your password';
      } else if (regPassword !== regConfirm) {
        newErrors.regConfirm = 'Passwords do not match';
      }

      setErrors(newErrors);
      if (Object.keys(newErrors).length > 0) return;

      // 模拟注册请求
      setRegisterLoading(true);
      setTimeout(function () {
        localStorage.setItem('ghrank_logged_in', '1');
        localStorage.setItem('ghrank_user_name', regUsername.trim());
        window.location.href = 'index.html';
      }, 1400);
    }, [regUsername, regEmail, regPassword, regConfirm]);

    /* ── 社交按钮：toast 提示 ── */
    var handleSocial = useCallback(function (provider) {
      showToast(provider + ' OAuth coming soon', 3000);
    }, []);

    var isSignIn = activeTab === 'signin';

    return (
      <div className="login-page-wrapper">
        {/* 装饰侧标签（左）*/}
        <div className="login-side-label login-side-label-left">
          <span className="login-side-text">GHRANK</span>
          <span className="login-side-sep">//</span>
          <span className="login-side-text">SECURE</span>
          <span className="login-side-sep">//</span>
          <span className="login-side-text">ACCESS</span>
        </div>

        {/* 装饰侧标签（右）*/}
        <div className="login-side-label login-side-label-right">
          <span className="login-side-hex">{'\u2B22'}</span>
        </div>

        {/* 终端头部 */}
        <div className="login-terminal-header">
          <div className="login-terminal-header-inner">
            <span className="login-terminal-prompt">&gt;_</span>
            <span className="login-terminal-label">AUTHENTICATION</span>
            <span className="login-terminal-blink typewriter">{'\u25AE'}</span>
          </div>
        </div>

        {/* 登录卡片 */}
        <div className="login-card hud-panel" id="loginCard">
          {/* 卡片角标 */}
          <div className="login-corner login-corner-tl"></div>
          <div className="login-corner login-corner-tr"></div>
          <div className="login-corner login-corner-bl"></div>
          <div className="login-corner login-corner-br"></div>

          {/* Tab 切换器 */}
          <div className="login-tabs">
            <button
              className={'login-tab' + (isSignIn ? ' active' : '')}
              data-tab="signin"
              type="button"
              onClick={function () { switchTab('signin'); }}
            >SIGN IN</button>
            <button
              className={'login-tab' + (!isSignIn ? ' active' : '')}
              data-tab="register"
              type="button"
              onClick={function () { switchTab('register'); }}
            >REGISTER</button>
            <div className={'login-tab-slider' + (!isSignIn ? ' slide-right' : '')}></div>
          </div>

          {/* Sign In 表单 */}
          <form
            className={'login-form' + (isSignIn ? '' : ' hidden')}
            id="signinForm"
            data-tab-content="signin"
            noValidate
            onSubmit={handleSigninSubmit}
          >
            <div className="login-field">
              <label className="login-label" htmlFor="signinEmail">EMAIL / USERNAME</label>
              <input
                className={'login-input' + (errors.signinEmail ? ' input-error' : '')}
                type="text"
                id="signinEmail"
                name="email"
                placeholder="Enter email or username"
                autoComplete="username"
                spellCheck="false"
                value={signinEmail}
                onChange={function (e) {
                  setSigninEmail(e.target.value);
                  clearFieldError('signinEmail');
                }}
              />
              <div className={'login-field-error' + (errors.signinEmail ? ' visible' : '')}>{errors.signinEmail || ''}</div>
            </div>
            <div className="login-field">
              <label className="login-label" htmlFor="signinPassword">PASSWORD</label>
              <input
                className={'login-input' + (errors.signinPassword ? ' input-error' : '')}
                type="password"
                id="signinPassword"
                name="password"
                placeholder="Enter password"
                autoComplete="current-password"
                value={signinPassword}
                onChange={function (e) {
                  setSigninPassword(e.target.value);
                  clearFieldError('signinPassword');
                }}
              />
              <div className={'login-field-error' + (errors.signinPassword ? ' visible' : '')}>{errors.signinPassword || ''}</div>
            </div>
            <div className="login-options-row">
              <label className="login-checkbox-label">
                <input
                  type="checkbox"
                  className="login-checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={function (e) { setRememberMe(e.target.checked); }}
                />
                <span className="login-checkbox-custom"></span>
                <span className="login-checkbox-text">Remember me</span>
              </label>
              <a href="#" className="login-forgot-link">Forgot password?</a>
            </div>
            <button
              type="submit"
              className={'login-submit-btn' + (signinLoading ? ' loading' : '')}
              id="signinSubmitBtn"
              disabled={signinLoading}
            >
              <span className="login-submit-text" hidden={signinLoading}>SIGN IN</span>
              <span className="login-submit-loader" hidden={!signinLoading}>
                <span className="login-spinner"></span>
                AUTHENTICATING...
              </span>
            </button>

            {/* 分隔线 */}
            <div className="login-divider">
              <span className="login-divider-line"></span>
              <span className="login-divider-text">OR CONTINUE WITH</span>
              <span className="login-divider-line"></span>
            </div>

            {/* 社交按钮 */}
            <div className="login-social-row">
              <button type="button" className="login-social-btn" id="btnGithub" onClick={function () { handleSocial('GitHub'); }}>
                <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
                <span>Continue with GitHub</span>
              </button>
              <button type="button" className="login-social-btn" id="btnGoogle" onClick={function () { handleSocial('Google'); }}>
                <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#EA4335" d="M5.27 9.76A7.18 7.18 0 0 1 12 4.82c1.73 0 3.3.6 4.53 1.77l3.37-3.37A11.97 11.97 0 0 0 12 0 12 12 0 0 0 .46 9.76l4.81 3.73z"/><path fill="#34A853" d="M12 24a11.97 11.97 0 0 0 8.31-3.25l-4.55-3.54A7.07 7.07 0 0 1 5.27 14.24L.46 18A12 12 0 0 0 12 24z"/><path fill="#4A90D9" d="M23.49 12.27c0-.82-.07-1.6-.2-2.36H12v4.63h6.44a5.52 5.52 0 0 1-2.39 3.62l4.55 3.54c2.66-2.45 4.19-6.07 4.19-9.43z"/><path fill="#FBBC05" d="M5.27 14.24a7.12 7.12 0 0 1 0-4.48L.46 6A12 12 0 0 0 .46 18l4.81-3.76z"/></svg>
                <span>Continue with Google</span>
              </button>
            </div>
          </form>

          {/* Register 表单 */}
          <form
            className={'login-form' + (!isSignIn ? '' : ' hidden')}
            id="registerForm"
            data-tab-content="register"
            noValidate
            onSubmit={handleRegisterSubmit}
          >
            <div className="login-field">
              <label className="login-label" htmlFor="regUsername">USERNAME</label>
              <input
                className={'login-input' + (errors.regUsername ? ' input-error' : '')}
                type="text"
                id="regUsername"
                name="username"
                placeholder="Choose a username"
                autoComplete="username"
                spellCheck="false"
                value={regUsername}
                onChange={function (e) {
                  setRegUsername(e.target.value);
                  clearFieldError('regUsername');
                }}
              />
              <div className={'login-field-error' + (errors.regUsername ? ' visible' : '')}>{errors.regUsername || ''}</div>
            </div>
            <div className="login-field">
              <label className="login-label" htmlFor="regEmail">EMAIL</label>
              <input
                className={'login-input' + (errors.regEmail ? ' input-error' : '')}
                type="email"
                id="regEmail"
                name="email"
                placeholder="Enter your email"
                autoComplete="email"
                spellCheck="false"
                value={regEmail}
                onChange={function (e) {
                  setRegEmail(e.target.value);
                  clearFieldError('regEmail');
                }}
              />
              <div className={'login-field-error' + (errors.regEmail ? ' visible' : '')}>{errors.regEmail || ''}</div>
            </div>
            <div className="login-field">
              <label className="login-label" htmlFor="regPassword">PASSWORD</label>
              <input
                className={'login-input' + (errors.regPassword ? ' input-error' : '')}
                type="password"
                id="regPassword"
                name="password"
                placeholder="Min 6 characters"
                autoComplete="new-password"
                minLength="6"
                value={regPassword}
                onChange={function (e) {
                  setRegPassword(e.target.value);
                  clearFieldError('regPassword');
                }}
              />
              <div className={'login-field-error' + (errors.regPassword ? ' visible' : '')}>{errors.regPassword || ''}</div>
            </div>
            <div className="login-field">
              <label className="login-label" htmlFor="regConfirm">CONFIRM PASSWORD</label>
              <input
                className={'login-input' + (errors.regConfirm ? ' input-error' : '')}
                type="password"
                id="regConfirm"
                name="confirmPassword"
                placeholder="Repeat password"
                autoComplete="new-password"
                minLength="6"
                value={regConfirm}
                onChange={function (e) {
                  setRegConfirm(e.target.value);
                  clearFieldError('regConfirm');
                }}
              />
              <div className={'login-field-error' + (errors.regConfirm ? ' visible' : '')}>{errors.regConfirm || ''}</div>
            </div>
            <button
              type="submit"
              className={'login-submit-btn' + (registerLoading ? ' loading' : '')}
              id="registerSubmitBtn"
              disabled={registerLoading}
            >
              <span className="login-submit-text" hidden={registerLoading}>CREATE ACCOUNT</span>
              <span className="login-submit-loader" hidden={!registerLoading}>
                <span className="login-spinner"></span>
                CREATING...
              </span>
            </button>

            {/* 分隔线 */}
            <div className="login-divider">
              <span className="login-divider-line"></span>
              <span className="login-divider-text">OR CONTINUE WITH</span>
              <span className="login-divider-line"></span>
            </div>

            {/* 社交按钮 */}
            <div className="login-social-row">
              <button type="button" className="login-social-btn" id="btnGithubReg" onClick={function () { handleSocial('GitHub'); }}>
                <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
                <span>Continue with GitHub</span>
              </button>
              <button type="button" className="login-social-btn" id="btnGoogleReg" onClick={function () { handleSocial('Google'); }}>
                <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#EA4335" d="M5.27 9.76A7.18 7.18 0 0 1 12 4.82c1.73 0 3.3.6 4.53 1.77l3.37-3.37A11.97 11.97 0 0 0 12 0 12 12 0 0 0 .46 9.76l4.81 3.73z"/><path fill="#34A853" d="M12 24a11.97 11.97 0 0 0 8.31-3.25l-4.55-3.54A7.07 7.07 0 0 1 5.27 14.24L.46 18A12 12 0 0 0 12 24z"/><path fill="#4A90D9" d="M23.49 12.27c0-.82-.07-1.6-.2-2.36H12v4.63h6.44a5.52 5.52 0 0 1-2.39 3.62l4.55 3.54c2.66-2.45 4.19-6.07 4.19-9.43z"/><path fill="#FBBC05" d="M5.27 14.24a7.12 7.12 0 0 1 0-4.48L.46 6A12 12 0 0 0 .46 18l4.81-3.76z"/></svg>
                <span>Continue with Google</span>
              </button>
            </div>
          </form>
        </div>

        {/* 卡片下方装饰六边形 */}
        <div className="login-hex-deco">
          <span>{'\u2B22'} {'\u2B22'} {'\u2B22'}</span>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════════
     3. 挂载前准备 —— 确保 #chrome-body 存在、清理静态内容
        原因：HTML 中未预置 #chrome-body，且存在静态 login-page-wrapper
        React 完全接管登录页内容，需移除静态 HTML 避免重复
     ═══════════════════════════════════════════════════════════════ */
  function prepareMountPoint() {
    // 移除 HTML 中的静态 login-page-wrapper（React 完全接管）
    var staticWrapper = document.querySelector('.login-page-wrapper');
    if (staticWrapper) staticWrapper.remove();

    // 确保 #chrome-body 容器存在（core.js 的 ChromeHost 会 portal 到此）
    var body = document.getElementById('chrome-body');
    if (!body) {
      body = document.createElement('div');
      body.id = 'chrome-body';
      // 插入到 navbar 之后、footer 之前
      var navbar = document.getElementById('chrome-navbar');
      var footer = document.getElementById('chrome-footer');
      if (navbar && navbar.nextSibling) {
        navbar.parentNode.insertBefore(body, navbar.nextSibling);
      } else if (footer) {
        footer.parentNode.insertBefore(body, footer);
      } else {
        var main = document.querySelector('.main-content');
        if (main) main.appendChild(body);
      }
    }
  }

  /* ═══════════════════════════════════════════════════════════════
     4. 自动挂载 —— 等待 GHRANK 就绪后挂载 LoginPage
        原因：text/babel 脚本按文档顺序执行，login.js 可能在 core.js 之前
        通过轮询确保 GHRANK.mountChrome 已定义
     ═══════════════════════════════════════════════════════════════ */
  function mountWhenReady() {
    if (window.GHRANK && window.GHRANK.mountChrome) {
      prepareMountPoint();
      GHRANK.mountChrome('login', LoginPage);
    } else {
      setTimeout(mountWhenReady, 50);
    }
  }

  mountWhenReady();
})();
