/**
 * =============================================================================
 * KISEKITANTO PORTFOLIO — MAIN JAVASCRIPT
 * =============================================================================


// ============================================================================
// UTILITY FUNCTIONS (Helpers used across the file)
// ============================================================================

/**
 * Debounce function - limits how often a function can fire
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Milliseconds to wait
 * @returns {Function} Debounced function
 */
function debounce(fn, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Check if user prefers reduced motion
 * @returns {boolean}
 */
function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Smooth scroll to element with offset for sticky nav
 * @param {string} selector - CSS selector for target element
 */
function smoothScrollTo(selector) {
  const target = document.querySelector(selector);
  if (!target) return;
  const navHeight = document.querySelector('.nav')?.offsetHeight || 64;
  const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight;
  window.scrollTo({ top: targetPosition, behavior: 'smooth' });
}

// ============================================================================
// SCROLL REVEAL (IntersectionObserver for fade-in animations)
// ============================================================================

function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal');

  if (prefersReducedMotion()) {
    revealElements.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  revealElements.forEach(el => observer.observe(el));
}

// ============================================================================
// ACTIVE NAV HIGHLIGHT (Highlights current section in navigation)
// ============================================================================

function initActiveNav() {
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  if (!navLinks.length || !sections.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.toggle('active', link.dataset.nav === id);
        });
      }
    });
  }, {
    threshold: 0.4,
    rootMargin: '-80px 0px -60% 0px'
  });

  sections.forEach(sec => observer.observe(sec));
}

// ============================================================================
// STAT COUNTER ANIMATION (Counts up numbers when stats section visible)
// ============================================================================

function initStatCounters() {
  const statValues = document.querySelectorAll('.stat-value[data-count]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        let current = 0;
        const duration = 1200;
        const step = target / (duration / 16);

        function animate() {
          current += step;
          if (current >= target) {
            el.textContent = target;
            return;
          }
          el.textContent = Math.floor(current);
          requestAnimationFrame(animate);
        }

        animate();
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  statValues.forEach(el => observer.observe(el));
}

// ============================================================================
// TERMINAL EASTER EGG — Professional Dev Terminal
// ============================================================================

function initTerminal() {
  const terminalToggle = document.getElementById('terminalToggle');
  const terminal = document.getElementById('terminal');
  const terminalBody = document.getElementById('terminalBody');
  const terminalInput = document.getElementById('terminalInput');
  const terminalClear = document.getElementById('terminalClear');
  const terminalMinimize = document.getElementById('terminalMinimize');
  const promptLine = document.getElementById('promptLine');

  if (!terminalToggle || !terminal || !terminalBody || !terminalInput || !promptLine) return;

  const commands = {
    help: {
      output: `Available commands:
  help          - Show this help
  about         - About me
  projects      - List projects
  stack         - Tech stack
  contact       - Contact info
  easter        - Secret unlock
  clear         - Clear terminal (Ctrl+L)
  exit          - Close terminal (Esc)`,
      type: 'info'
    },

    about: {
      output: `Kisekitanto (Rahman)
Indonesia | 15 years old
Godot 4.7 beginner | 18 months in
Building: 2D top-down RPG + procgen
Story: Pre-written (Undertale/Stardew vibes)
Current pain: := type inference, file corruption`,
      type: 'info'
    },

    projects: {
      output: `Active projects:
1. Unnamed RPG - Godot 4.7, TileMapLayer, Dialogic, State Machine
2. ProcGen World - Biome blending, coastline beaches, Gaea
3. Combat System - Slice/Pierce/Crush, stamina-gated
4. Dialogic Narrative - Branching, BBCode, localization`,
      type: 'info'
    },

    stack: {
      output: `Daily drivers:
Engine: Godot 4.7 (GDScript)
Plugins: Dialogic 2.x, FastNoiseLite, Gaea
VCS: Git + GitHub (manual commits)
Learning: Source code > tutorials
Debugging: print() > breakpoints`,
      type: 'info'
    },

    contact: {
      output: `Get in touch:
Email: abdurrahman04791@gmail.com
GitHub: github.com/Kisekitanto
Godot Q&A: godotengine.org/qa/user/Kisekitanto
Discord: kisekitanto (rarely online)`,
      type: 'info'
    },

    easter: {
      output: `🎮  SECRET UNLOCKED  🎮

You found the developer console!
Here's a secret: the biome blending uses
a modified Voronoi diagram with climate
zone weighting. The beaches? Raycast from
water tiles toward land, place sand where
slope < 15°. Took 3 weeks to get right.

Also: Shift = run. Diagonals normalized.
You're welcome.`,
      type: 'success'
    }
  };

  let terminalHistory = [];
  let historyIndex = -1;
  let isProcessing = false;

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function appendOutput(text, type = 'output') {
    const div = document.createElement('div');
    div.className = 'terminal-line output';
    const escaped = escapeHtml(text);
    const typeClass = type !== 'output' ? ` terminal-output-${type}` : '';
    div.innerHTML = `<span class="terminal-output${typeClass}">${escaped.replace(/\n/g, '<br>')}</span>`;

    terminalBody.insertBefore(div, promptLine);
    terminalBody.scrollTop = terminalBody.scrollHeight;
  }

  function appendEcho(cmd) {
    const div = document.createElement('div');
    div.className = 'terminal-line echo';
    div.innerHTML = `<span class="terminal-prompt" data-prompt="kiseki@portfolio:~$"></span><span class="terminal-output"><span class="cmd">${escapeHtml(cmd)}</span></span>`;
    terminalBody.insertBefore(div, promptLine);
    terminalBody.scrollTop = terminalBody.scrollHeight;
  }

  function clearTerminal() {
    const lines = terminalBody.querySelectorAll('.terminal-line');
    lines.forEach(line => {
      if (line === promptLine) return;
      if (line.classList.contains('terminal-welcome')) return;
      line.remove();
    });
  }

  function processCommand(cmd) {
    if (isProcessing) return;
    isProcessing = true;

    const cleanCmd = cmd.trim().toLowerCase();

    appendEcho(cmd);
    terminalInput.value = '';

    if (!cleanCmd) {
      isProcessing = false;
      return;
    }

    if (cleanCmd === 'clear') {
      clearTerminal();
      isProcessing = false;
      return;
    }
    if (cleanCmd === 'exit') {
      closeTerminal();
      isProcessing = false;
      return;
    }

    if (commands[cleanCmd]) {
      const { output, type } = commands[cleanCmd];
      setTimeout(() => {
        appendOutput(output, type);
        isProcessing = false;
      }, 50);
    } else {
      setTimeout(() => {
        appendOutput(`Command not found: ${cleanCmd}. Type 'help' for commands.`, 'error');
        isProcessing = false;
      }, 50);
    }
  }

  terminalInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const cmd = terminalInput.value;
      terminalHistory.push(cmd);
      historyIndex = terminalHistory.length;
      processCommand(cmd);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex > 0) {
        historyIndex--;
        terminalInput.value = terminalHistory[historyIndex];
        terminalInput.setSelectionRange(terminalInput.value.length, terminalInput.value.length);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex < terminalHistory.length - 1) {
        historyIndex++;
        terminalInput.value = terminalHistory[historyIndex];
      } else {
        historyIndex = terminalHistory.length;
        terminalInput.value = '';
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const val = terminalInput.value.toLowerCase();
      const matches = Object.keys(commands).filter(c => c.startsWith(val));
      if (matches.length === 1) {
        terminalInput.value = matches[0];
      } else if (matches.length > 1) {
        appendOutput(matches.join('  '), 'dim');
      }
    } else if (e.key === 'l' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      clearTerminal();
    }
  });

  terminalBody.addEventListener('click', (e) => {
    if (e.target === terminalBody || e.target.closest('.terminal-line.output')) {
      terminalInput.focus();
    }
  });

  if (terminalClear) {
    terminalClear.addEventListener('click', clearTerminal);
  }
  if (terminalMinimize) {
    terminalMinimize.addEventListener('click', closeTerminal);
  }

  function openTerminal() {
    terminal.classList.add('open');
    terminalToggle.style.display = 'none';
    setTimeout(() => terminalInput.focus(), 120);
  }

  function closeTerminal() {
    terminal.classList.remove('open');
    terminalToggle.style.display = 'flex';
  }

  terminalToggle.addEventListener('click', openTerminal);

  terminal.addEventListener('click', (e) => {
    if (e.target === terminal) closeTerminal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && terminal.classList.contains('open')) {
      closeTerminal();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === '`') {
      e.preventDefault();
      if (terminal.classList.contains('open')) closeTerminal();
      else openTerminal();
    }
  });

  terminalInput.addEventListener('focus', () => {
    promptLine.classList.add('focused');
  });
  terminalInput.addEventListener('blur', () => {
    promptLine.classList.remove('focused');
  });

  console.log('🎮 Terminal ready. Press Ctrl+` to toggle.');
}

// ============================================================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ============================================================================

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.pushState(null, '', targetId);
      }
    });
  });
}

// ============================================================================
// PARALLAX BACKGROUND (Subtle background movement on scroll)
// ============================================================================

function initParallax() {
  const atmosphere = document.querySelector('.bg-gradient');
  if (!atmosphere) return;

  let ticking = false;

  function updateParallax() {
    const scrollY = window.scrollY;
    atmosphere.style.transform = `translateY(${scrollY * 0.15}px)`;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }, { passive: true });
}

// ============================================================================
// INITIALIZATION (Run everything on DOM ready)
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  initActiveNav();
  initStatCounters();
  initTerminal();
  initSmoothScroll();
  initParallax();

  if (prefersReducedMotion()) {
    const scanline = document.querySelector('.scanline');
    if (scanline) scanline.style.animation = 'none';
  }

  console.log('🎮 Portfolio loaded. Press Ctrl+` for terminal.');
});
