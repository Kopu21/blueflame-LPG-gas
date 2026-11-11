/**
 * LPG Gas Agency & Delivery - Main Script
 * Handles Theme Management, RTL/LTR Direction, Mobile Menu, Toasts, and Shared State
 */

// Initialize Direction (RTL / LTR)
function initDirection() {
  const savedDir = localStorage.getItem('lpg_direction') || 'ltr';
  document.documentElement.setAttribute('dir', savedDir);
  updateDirIcons();
}

// Toggle Direction (RTL / LTR)
function toggleDirection() {
  const currentDir = document.documentElement.getAttribute('dir') || 'ltr';
  const newDir = currentDir === 'rtl' ? 'ltr' : 'rtl';
  document.documentElement.setAttribute('dir', newDir);
  localStorage.setItem('lpg_direction', newDir);
  updateDirIcons();
}

// Update Direction Toggle Tooltips / State
function updateDirIcons() {
  const isRtl = document.documentElement.getAttribute('dir') === 'rtl';
  document.querySelectorAll('.dir-toggle-btn').forEach(btn => {
    btn.setAttribute('title', isRtl ? 'Switch to LTR' : 'Switch to RTL');
    btn.classList.toggle('text-sky-600', isRtl);
    btn.classList.toggle('dark:text-sky-400', isRtl);
  });
}

// Initialize Theme
function initTheme() {
  const savedTheme = localStorage.getItem('lpg_theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  updateThemeIcons();
}

// Toggle Theme
function toggleTheme() {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('lpg_theme', isDark ? 'dark' : 'light');
  updateThemeIcons();
}

// Update Theme Toggle Icons (Sun/Moon)
function updateThemeIcons() {
  const isDark = document.documentElement.classList.contains('dark');
  document.querySelectorAll('.theme-toggle-icon-sun').forEach(el => {
    el.classList.toggle('hidden', !isDark);
  });
  document.querySelectorAll('.theme-toggle-icon-moon').forEach(el => {
    el.classList.toggle('hidden', isDark);
  });
}

// Toast Notification System
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'fixed bottom-8 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  const typeStyles = {
    success: 'bg-emerald-600 text-white border-emerald-500',
    error: 'bg-rose-600 text-white border-rose-500',
    warning: 'bg-amber-600 text-white border-amber-500',
    info: 'bg-sky-700 text-white border-sky-600'
  };

  const icons = {
    success: '<i data-lucide="check-circle" class="w-5 h-5 flex-shrink-0"></i>',
    error: '<i data-lucide="alert-octagon" class="w-5 h-5 flex-shrink-0"></i>',
    warning: '<i data-lucide="alert-triangle" class="w-5 h-5 flex-shrink-0"></i>',
    info: '<i data-lucide="info" class="w-5 h-5 flex-shrink-0"></i>'
  };

  toast.className = `flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border text-sm font-medium transform transition-all duration-300 translate-y-4 opacity-0 pointer-events-auto ${typeStyles[type] || typeStyles.info}`;
  toast.innerHTML = `
    ${icons[type] || icons.info}
    <div class="flex-1">${message}</div>
    <button onclick="this.parentElement.remove()" class="text-white/80 hover:text-white ml-2">
      <i data-lucide="x" class="w-4 h-4"></i>
    </button>
  `;

  container.appendChild(toast);
  if (window.lucide) lucide.createIcons();

  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-4', 'opacity-0');
  });

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Mobile Menu Toggle (preserves sticky header without body overflow lock glitches)
function toggleMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  const backdrop = document.getElementById('mobile-menu-backdrop');
  if (menu) {
    const isHidden = menu.classList.contains('hidden');
    if (isHidden) {
      menu.classList.remove('hidden');
      if (backdrop) backdrop.classList.remove('hidden');
    } else {
      menu.classList.add('hidden');
      if (backdrop) backdrop.classList.add('hidden');
    }
  }
}

// Toggle Home Submenu in Mobile drawer
function toggleMobileHomeSubmenu() {
  const sub = document.getElementById('mobile-home-submenu');
  const icon = document.getElementById('mobile-home-icon');
  if (sub) {
    sub.classList.toggle('hidden');
    if (icon) icon.classList.toggle('rotate-180');
  }
}

// Check if user is logged in - ALWAYS links to Consumer Login (login.html) without redirecting to dashboard
function checkAuthUser() {
  const userStatusEls = document.querySelectorAll('.user-auth-status');
  
  userStatusEls.forEach(el => {
    el.innerHTML = `
      <a href="login.html" aria-label="Consumer Login" title="Consumer Login Portal" class="w-8.5 h-8.5 xl:w-10 xl:h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition flex items-center justify-center flex-shrink-0">
        <i data-lucide="user" class="w-4 h-4"></i>
      </a>
    `;
  });

  if (window.lucide) lucide.createIcons();
}

function logoutUser() {
  localStorage.removeItem('lpg_auth_user');
  showToast('You have been logged out safely.', 'info');
  setTimeout(() => {
    if (window.location.pathname.includes('dashboard.html')) {
      window.location.href = 'login.html';
    } else {
      checkAuthUser();
    }
  }, 600);
}

// Subtle LPG Scroll Reveal Observer
function initScrollReveal() {
  const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Auto-target LPG cylinder cards, service cards, and explicit reveal elements
  const targets = document.querySelectorAll(
    '.lpg-reveal, .cylinder-card, #products .group, #eco-friendly-fleet .grid > div, #support .grid > div'
  );

  if (isReduced || !('IntersectionObserver' in window)) {
    targets.forEach(el => el.classList.add('lpg-revealed'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('lpg-revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -25px 0px'
  });

  targets.forEach((el, index) => {
    el.classList.add('lpg-reveal');
    // Stagger slightly for sibling elements within the same container
    el.style.transitionDelay = `${(index % 4) * 0.08}s`;
    observer.observe(el);
  });
}

// Field Validation Engine for Name and Number Fields
function initFieldValidation() {
  function isNameField(el) {
    if (!el || el.tagName !== 'INPUT') return false;
    if (el.type === 'hidden' || el.type === 'password' || el.type === 'email' || el.type === 'radio' || el.type === 'checkbox' || el.type === 'file' || el.type === 'date' || el.type === 'number' || el.type === 'range') return false;
    
    if (el.dataset.validate === 'name') return true;

    const id = (el.id || '').toLowerCase();
    const name = (el.name || '').toLowerCase();
    const placeholder = (el.placeholder || '').toLowerCase();

    // Preserve alphanumeric identifiers (consumer ID, order ID, email, password, address)
    if (id.includes('consumer') || name.includes('consumer') || placeholder.includes('consumer') ||
        id.includes('order') || name.includes('order') ||
        id.includes('email') || name.includes('email') ||
        id.includes('password') || name.includes('password') ||
        id.includes('address') || name.includes('address') ||
        id.includes('identifier') || name.includes('identifier')) {
      return false;
    }

    return id.includes('name') || name.includes('name') || placeholder.includes('full name') || placeholder.includes('your name');
  }

  function isNumberField(el) {
    if (!el || el.tagName !== 'INPUT') return false;
    if (el.type === 'hidden' || el.type === 'password' || el.type === 'email' || el.type === 'radio' || el.type === 'checkbox' || el.type === 'file' || el.type === 'date' || el.type === 'range') return false;
    
    if (el.dataset.validate === 'number') return true;

    const id = (el.id || '').toLowerCase();
    const name = (el.name || '').toLowerCase();
    const placeholder = (el.placeholder || '').toLowerCase();

    // Preserve alphanumeric identifiers
    if (id.includes('consumer') || name.includes('consumer') || placeholder.includes('consumer') ||
        id.includes('order') || name.includes('order') ||
        id.includes('password') || id.includes('email') ||
        id.includes('identifier') || name.includes('identifier') ||
        id.includes('address') || name.includes('address')) {
      return false;
    }

    if (el.type === 'tel') return true;
    return id.includes('mobile') || name.includes('mobile') || id.includes('phone') || name.includes('phone') || id.includes('contact') || name.includes('contact');
  }

  function sanitizeInputValue(input, regex) {
    const orig = input.value;
    if (!regex.test(orig)) return;
    const selStart = input.selectionStart || 0;
    const beforeCursor = orig.slice(0, selStart);
    const matchesBefore = (beforeCursor.match(regex) || []).length;
    input.value = orig.replace(regex, '');
    const newPos = Math.max(0, selStart - matchesBefore);
    if (typeof input.setSelectionRange === 'function') {
      input.setSelectionRange(newPos, newPos);
    }
  }

  // 1. Live keydown blocking
  document.addEventListener('keydown', (e) => {
    const el = e.target;
    // Allow non-printable/control keys: Backspace, Tab, Enter, Escape, Arrow keys, Home, End, Delete, F-keys, Ctrl/Meta shortcuts
    if (e.isComposing || e.key.length !== 1 || e.ctrlKey || e.metaKey || e.altKey) {
      return;
    }

    // Name field: allow only alphabetic characters and spaces; block numbers 0-9
    if (isNameField(el)) {
      if (/[0-9]/.test(e.key)) {
        e.preventDefault();
      }
    }

    // Number field: allow only numeric digits; block alphabetic letters a-z, A-Z
    else if (isNumberField(el)) {
      if (/[a-zA-Z]/.test(e.key)) {
        e.preventDefault();
      }
    }
  }, true);

  // 2. Clipboard Paste sanitization
  document.addEventListener('paste', (e) => {
    const el = e.target;
    const isName = isNameField(el);
    const isNum = isNumberField(el);
    if (!isName && !isNum) return;

    const pastedText = (e.clipboardData || window.clipboardData)?.getData('text');
    if (!pastedText) return;

    if (isName && /[0-9]/.test(pastedText)) {
      e.preventDefault();
      const sanitized = pastedText.replace(/[0-9]/g, '');
      insertSanitizedText(el, sanitized);
    } else if (isNum && /[a-zA-Z]/.test(pastedText)) {
      e.preventDefault();
      let sanitized = pastedText.replace(/[a-zA-Z]/g, '');
      const maxLen = el.getAttribute('maxlength');
      if (maxLen) {
        const curLen = el.value.length - ((el.selectionEnd || 0) - (el.selectionStart || 0));
        const avail = parseInt(maxLen, 10) - curLen;
        if (avail <= 0) return;
        sanitized = sanitized.slice(0, avail);
      }
      insertSanitizedText(el, sanitized);
    }
  }, true);

  function insertSanitizedText(target, text) {
    if (!text && text !== '') return;
    if (document.queryCommandSupported && document.queryCommandSupported('insertText')) {
      try {
        const ok = document.execCommand('insertText', false, text);
        if (ok) return;
      } catch (err) {
        // Fallback to manual selection replacement
      }
    }
    const start = target.selectionStart || 0;
    const end = target.selectionEnd || 0;
    const val = target.value;
    target.value = val.slice(0, start) + text + val.slice(end);
    const newPos = start + text.length;
    if (typeof target.setSelectionRange === 'function') {
      target.setSelectionRange(newPos, newPos);
    }
    if (typeof Event !== 'undefined' && typeof target.dispatchEvent === 'function') {
      target.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  // 3. Input event cleanup (handles mobile keyboards, voice dictation, autofill, autocomplete)
  document.addEventListener('input', (e) => {
    const el = e.target;
    if (isNameField(el)) {
      sanitizeInputValue(el, /[0-9]/g);
    } else if (isNumberField(el)) {
      sanitizeInputValue(el, /[a-zA-Z]/g);
    }
  }, true);
}

// Document Ready
document.addEventListener('DOMContentLoaded', () => {
  initDirection();
  initTheme();
  checkAuthUser();
  initScrollReveal();
  initFieldValidation();
  if (window.lucide) {
    lucide.createIcons();
  }

  // Scroll effect on header
  window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (header) {
      if (window.scrollY > 20) {
        header.classList.add('shadow-md', 'bg-white/95', 'dark:bg-slate-900/95');
        header.classList.remove('bg-white/90', 'dark:bg-slate-900/90');
      } else {
        header.classList.remove('shadow-md');
      }
    }
  });
});
