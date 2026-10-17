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
  // Select all elements with .reveal class
  const revealElements = document.querySelectorAll('.reveal');

  // If user prefers reduced motion, show everything immediately
  if (prefersReducedMotion()) {
    revealElements.forEach(el => el.classList.add('visible'));
    return;
  }

  // Observer options:
  // - threshold: 0.1 = trigger when 10% visible
  // - rootMargin: negative bottom = trigger slightly before element enters viewport
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // Only animate once
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
        // Update active state on all nav links
        navLinks.forEach(link => {
          link.classList.toggle('active', link.dataset.nav === id);
        });
      }
    });
  }, {
    threshold: 0.4,
    rootMargin: '-80px 0px -60% 0px' // Account for sticky nav height
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
        const duration = 1200; // ms
        const step = target / (duration / 16); // 60fps approximation

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
        observer.unobserve(el); // Only animate once
      }
    });
  }, { threshold: 0.5 });

  statValues.forEach(el => observer.observe(el));
}

// ============================================================================
// TERMINAL EASTER EGG (Hidden terminal with commands)
// ============================================================================

function initTerminal() {
  const terminalToggle = document.getElementById('terminalToggle');
  const terminal = document.getElementById('terminal');
  const terminalBody = document.getElementById('terminalBody');

  if (!terminalToggle || !terminal || !terminalBody) return;

  // --- COMMAND DEFINITIONS ---
  // Add new commands here: 'commandName': 'output text\nwith\nnewlines'
  const commands = {
    help: `Available commands:
  help          - Show this help
  about         - About me
  projects      - List projects
  stack         - Tech stack
  contact       - Contact info
  easter        - Secret unlock
  clear         - Clear terminal
  exit          - Close terminal`,

    about: `Kisekitanto (Rahman)
Indonesia | 15 years old
Godot 4.7 beginner | 18 months in
Building: 2D top-down RPG + procgen
Story: Pre-written (Undertale/Stardew vibes)
Current pain: := type inference, file corruption`,

    projects: `Active projects:
1. Unnamed RPG - Godot 4.7, TileMapLayer, Dialogic, State Machine
2. ProcGen World - Biome blending, coastline beaches, Gaea
3. Combat System - Slice/Pierce/Crush, stamina-gated
4. Dialogic Narrative - Branching, BBCode, localization`,

    stack: `Daily drivers:
Engine: Godot 4.7 (GDScript)
Plugins: Dialogic 2.x, FastNoiseLite, Gaea
VCS: Git + GitHub (manual commits)
Learning: Source code > tutorials
Debugging: print() > breakpoints`,

    contact: `Get in touch:
Email: abdurrahman04791@gmail.com
GitHub: github.com/Kisekitanto
Godot Q&A: godotengine.org/qa/user/Kisekitanto
Discord: kisekitanto (rarely online)`,

    easter: `🎮  SECRET UNLOCKED  🎮

You found the developer console!
Here's a secret: the biome blending uses
a modified Voronoi diagram with climate
zone weighting. The beaches? Raycast from
water tiles toward land, place sand where
slope < 15°. Took 3 weeks to get right.

Also: Shift = run. Diagonals normalized.
You're welcome.`
  };

  // --- TERMINAL STATE ---
  let terminalHistory = [];
  let historyIndex = -1;

  // --- HELPER: Append a line to terminal output ---
  function appendLine(html, isPrompt = true) {
    const div = document.createElement('div');
    div.className = 'terminal-line';
    if (isPrompt) {
      div.innerHTML = `<span class="terminal-prompt">kiseki@portfolio:~$</span> ${html}`;
    } else {
      div.innerHTML = `<span class="terminal-output">${html}</span>`;
    }

    // Insert before the input line (last child)
    const lastLine = terminalBody.lastElementChild;
    if (lastLine && lastLine.querySelector('.terminal-input')) {
      terminalBody.insertBefore(div, lastLine);
    } else {
      terminalBody.appendChild(div);
    }
    terminalBody.scrollTop = terminalBody.scrollHeight;
  }

  // --- HELPER: Process a command ---
  function processCommand(cmd) {
    const cleanCmd = cmd.trim().toLowerCase();
    if (!cleanCmd) return;

    appendLine(cmd, true); // Show what user typed

    if (commands[cleanCmd]) {
      // Split multi-line output into separate terminal-output spans
      const output = commands[cleanCmd]
        .split('\n')
        .map(l => `<span class="terminal-output">${l}</span>`)
        .join('');
      appendLine(output, false);
    } else if (cleanCmd === 'clear') {
      terminalBody.innerHTML = '';
      // Re-create input line
      createInputLine();
      return;
    } else if (cleanCmd === 'exit') {
      closeTerminal();
      return;
    } else {
      appendLine(`Command not found: ${cleanCmd}. Type 'help' for commands.`, false);
    }

    // Add new input line after command
    createInputLine();
  }

  // --- HELPER: Create fresh input line ---
  function createInputLine() {
    const inputLine = document.createElement('div');
    inputLine.className = 'terminal-line';
    inputLine.innerHTML = `<span class="terminal-prompt">kiseki@portfolio:~$</span><input type="text" class="terminal-input" id="terminalInput" autocomplete="off" spellcheck="false">`;
    terminalBody.appendChild(inputLine);
    const newInput = document.getElementById('terminalInput');
    newInput.focus();
    bindTerminalInput(newInput);
  }

  // --- HELPER: Bind keyboard events to input ---
  function bindTerminalInput(input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const cmd = input.value;
        terminalHistory.push(cmd);
        historyIndex = terminalHistory.length;
        processCommand(cmd);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (historyIndex > 0) {
          historyIndex--;
          input.value = terminalHistory[historyIndex];
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIndex < terminalHistory.length - 1) {
          historyIndex++;
          input.value = terminalHistory[historyIndex];
        } else {
          historyIndex = terminalHistory.length;
          input.value = '';
        }
      } else if (e.key === 'Tab') {
        e.preventDefault();
        // Tab completion for known commands
        const val = input.value.toLowerCase();
        const matches = Object.keys(commands).filter(c => c.startsWith(val));
        if (matches.length === 1) {
          input.value = matches[0];
        } else if (matches.length > 1) {
          appendLine(matches.join('  '), false);
        }
      }
    });
  }

  // --- OPEN/CLOSE TERMINAL ---
  function openTerminal() {
    terminal.classList.add('open');
    terminalToggle.style.display = 'none';
    setTimeout(() => {
      const input = document.getElementById('terminalInput');
      if (input) input.focus();
    }, 100);
  }

  function closeTerminal() {
    terminal.classList.remove('open');
    terminalToggle.style.display = 'flex';
  }

  // --- EVENT LISTENERS ---
  terminalToggle.addEventListener('click', openTerminal);

  // Click outside terminal to close
  terminal.addEventListener('click', (e) => {
    if (e.target === terminal) closeTerminal();
  });

  // ESC to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && terminal.classList.contains('open')) closeTerminal();

    // Ctrl+` (backtick) to toggle terminal
    if (e.ctrlKey && e.key === '`') {
      e.preventDefault();
      if (terminal.classList.contains('open')) closeTerminal();
      else openTerminal();
    }
  });

  // Initial input binding
  bindTerminalInput(document.getElementById('terminalInput'));
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
        history.pushState(null, '', targetId); // Update URL without jump
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
  // Initialize all modules
  initScrollReveal();
  initActiveNav();
  initStatCounters();
  initTerminal();
  initSmoothScroll();
  initParallax();

  // Respect reduced motion for scanline animation
  if (prefersReducedMotion()) {
    const scanline = document.querySelector('.scanline');
    if (scanline) scanline.style.animation = 'none';
  }

  console.log('🎮 Portfolio loaded. Press Ctrl+\` for terminal.');
});