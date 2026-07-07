// InnerScript Landing Page Application Logic

// 1. TYPING DEMO SIMULATOR CONTEXTS
const DEMO_DATA = {
  anxiety: {
    text: "Feeling that persistent loop of anxiety about product alignment again...",
    childText: "It feels exactly like that time when we were preparing to launch last October.",
    triggerIndex: 45,
    reflection: "You've written about team alignment anxiety across <em>three previous project launches</em>. Is this about the team's actual progress, or a fear of repeating past communication blockages?",
    citations: [
      {
        date: "OCTOBER 14, 2025",
        score: "strong match",
        text: "Tension during the beta release. Felt unheard by the team while discussing <mark>launch decisions</mark>. Need to write down guidelines early next time."
      },
      {
        date: "AUGUST 02, 2025",
        score: "related memory",
        text: "Felt anxious before client sync. Retrospectively, the alignment was fine, I was just overthinking the timeline differences."
      }
    ]
  },
  idea: {
    text: "I should design a better way to keep my notes connected across devices...",
    childText: "The important part is that my writing remains easy to move, revisit, and trust.",
    triggerIndex: 35,
    reflection: "You proposed a similar <em>portable writing archive</em> 9 months ago. Should this build on that older idea, or start from the journaling flow you use today?",
    citations: [
      {
        date: "SEPTEMBER 02, 2025",
        score: "strong match",
        text: "Thinking about connected notes. The archive should stay <mark>portable and easy to export</mark> rather than being trapped in one app."
      },
      {
        date: "JUNE 18, 2025",
        score: "related memory",
        text: "Researching better outlines for long-term journaling. The structure should stay simple enough to understand years later."
      }
    ]
  },
  relationship: {
    text: "I keep replaying that conversation and wondering why a small comment felt so personal...",
    childText: "Maybe it touched the old fear of being dismissed before I finish explaining myself.",
    triggerIndex: 48,
    reflection: "This resembles earlier entries about feeling <em>dismissed in close conversations</em>. Is the current hurt about this comment, or the older pattern it reminded you of?",
    citations: [
      {
        date: "NOVEMBER 21, 2025",
        score: "strong match",
        text: "Argument after dinner. I reacted less to the words and more to the feeling that my <mark>point was being waved away</mark>."
      },
      {
        date: "MAY 09, 2025",
        score: "related memory",
        text: "Noticed I get defensive when someone interrupts before I can finish. Need to separate interruption from rejection."
      }
    ]
  },
  energy: {
    text: "My focus collapsed again after three packed meeting days, even though the work itself was going well...",
    childText: "This feels less like laziness and more like ignoring the recovery pattern I already know.",
    triggerIndex: 54,
    reflection: "You've logged this <em>meeting-heavy exhaustion pattern</em> several times. Would a protected recovery block prevent the next crash?",
    citations: [
      {
        date: "JANUARY 17, 2026",
        score: "strong match",
        text: "Great progress early in the week, then no energy by Thursday after back-to-back calls. Need <mark>one quiet morning after meeting clusters</mark>."
      },
      {
        date: "OCTOBER 03, 2025",
        score: "related memory",
        text: "Focus returned after canceling two optional syncs and spending the morning writing alone."
      }
    ]
  }
};

// 2. STATE MANAGER
let typingInterval = null;
let currentDemo = 'anxiety';
let isTyping = false;

const interestCaptureConfig = {
  endpoint: 'https://script.google.com/macros/s/AKfycbycgtEG_SUmpuaCArSQgJXU3AHGbeQqQHEFbt3QsXwtnedqnSePYPSPrqkmw2qvZuZgvg/exec',
  emailFieldName: 'email',
  sourceFieldName: 'source',
  timestampFieldName: 'timestamp',
  userAgentFieldName: 'userAgent'
};

// DOM Elements
const textField = document.getElementById('typing-text-field');
const childNode = document.getElementById('node-child-1');
const childNodeText = childNode ? childNode.querySelector('.node-text') : null;
const reflectionPrompt = document.getElementById('reflection-prompt');
const citationListWrapper = document.getElementById('citation-list-wrapper');

// 3. TYPING EFFECT SIMULATOR
function startTypingDemo(demoKey) {
  // Clear any active interval
  if (typingInterval) {
    clearInterval(typingInterval);
  }
  isTyping = true;
  currentDemo = demoKey;
  
  const data = DEMO_DATA[demoKey];
  let charIndex = 0;
  
  // Reset DOM Elements
  textField.innerHTML = '';
  textField.classList.remove('highlighted');
  
  childNode.classList.remove('visible');
  childNodeText.textContent = '';
  
  reflectionPrompt.style.opacity = '0.3';
  reflectionPrompt.innerHTML = 'Waiting for thoughts to be recorded...';
  
  citationListWrapper.innerHTML = `
    <div class="citation-empty-state" id="citation-empty">
      Write in the journal to surface related memories.
    </div>
  `;
  
  // Animate active typing node glow
  const parentNode = document.getElementById('node-parent');
  parentNode.classList.add('active-typing');

  // Start character timer
  typingInterval = setInterval(() => {
    if (charIndex < data.text.length) {
      textField.textContent += data.text.charAt(charIndex);
      charIndex++;
      
      // Trigger recall once enough writing context is established.
      if (charIndex === data.triggerIndex) {
        triggerSemanticRetrieval(data);
      }
    } else {
      // Done typing main node
      clearInterval(typingInterval);
      parentNode.classList.remove('active-typing');
      
      // Start typing child outliner node after a short pause
      setTimeout(() => {
        typeChildNode(data);
      }, 800);
    }
  }, 40);
}

function typeChildNode(data) {
  childNode.classList.add('visible');
  let childIndex = 0;
  
  typingInterval = setInterval(() => {
    if (childIndex < data.childText.length) {
      childNodeText.textContent += data.childText.charAt(childIndex);
      childIndex++;
    } else {
      clearInterval(typingInterval);
      isTyping = false;
      
      // Highlight the key triggered text in the main node for emphasis
      highlightTriggeredPhrases(data);
    }
  }, 30);
}

function highlightTriggeredPhrases(data) {
  const text = data.text;
  if (currentDemo === 'anxiety') {
    const start = text.indexOf('anxiety about product alignment');
    if (start !== -1) {
      const len = 'anxiety about product alignment'.length;
      textField.innerHTML = 
        text.substring(0, start) + 
        `<span style="color: var(--color-blue); background-color: rgba(177, 197, 255, 0.08); border-bottom: 1px dashed var(--color-blue); padding: 0 2px; border-radius: 2px;">` + 
        text.substring(start, start + len) + 
        `</span>` + 
        text.substring(start + len);
    }
  } else if (currentDemo === 'idea') {
    const start = text.indexOf('notes connected across devices');
    if (start !== -1) {
      const len = 'notes connected across devices'.length;
      textField.innerHTML = 
        text.substring(0, start) + 
        `<span style="color: var(--color-blue); background-color: rgba(177, 197, 255, 0.05); border-bottom: 1px dashed var(--color-blue); padding: 0 2px; border-radius: 2px;">` + 
        text.substring(start, start + len) + 
        `</span>` + 
        text.substring(start + len);
    }
  } else if (currentDemo === 'relationship') {
    highlightPhrase(text, 'small comment felt so personal', 'var(--color-blue)', 'rgba(177, 197, 255, 0.08)');
  } else if (currentDemo === 'energy') {
    highlightPhrase(text, 'focus collapsed again', 'var(--color-gold)', 'rgba(220, 198, 97, 0.08)');
  }
}

function highlightPhrase(text, phrase, color, backgroundColor) {
  const start = text.indexOf(phrase);
  if (start === -1) return;

  textField.innerHTML =
    text.substring(0, start) +
    `<span style="color: ${color}; background-color: ${backgroundColor}; border-bottom: 1px dashed ${color}; padding: 0 2px; border-radius: 2px;">` +
    text.substring(start, start + phrase.length) +
    `</span>` +
    text.substring(start + phrase.length);
}

// 4. RETRIEVAL AND INTERACTIVE UI UPDATES
function triggerSemanticRetrieval(data) {
  // 1. Update reflection question
  reflectionPrompt.style.opacity = '1';
  reflectionPrompt.innerHTML = data.reflection;
  
  // 2. Render citations
  citationListWrapper.innerHTML = '';
  data.citations.forEach(cit => {
    const card = document.createElement('div');
    card.className = 'citation-card';
    card.style.borderLeftColor = currentDemo === 'energy' ? 'var(--color-gold)' : 'var(--color-blue)';
    card.innerHTML = `
      <div class="citation-header">
        <span class="citation-date" style="color: ${currentDemo === 'energy' ? 'var(--color-gold)' : 'var(--color-blue)'}">${cit.date}</span>
        <span class="citation-score">${cit.score}</span>
      </div>
      <p class="citation-text">${cit.text}</p>
    `;
    citationListWrapper.appendChild(card);
  });
  
}

// 5. EMAIL INTEREST CAPTURE
function initInterestCaptureForms() {
  document.querySelectorAll('[data-interest-form]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();

      if (!form.reportValidity()) return;

      const emailInput = form.querySelector('input[type="email"]');
      const email = emailInput ? emailInput.value.trim() : '';
      const source = form.getAttribute('data-source') || 'unknown';

      if (!email) return;

      postInterestCapture(interestCaptureConfig, email, source);
      form.reset();

      showInterestToast(source.startsWith('collaboration')
        ? 'Thanks. We will reach out about collaborating.'
        : 'You are on the early access list.');
    });
  });
}

function postInterestCapture(config, email, source) {
  const iframe = ensureInterestCaptureFrame();
  const submitForm = document.createElement('form');

  submitForm.method = 'POST';
  submitForm.action = config.endpoint.trim();
  submitForm.target = iframe.name;
  submitForm.acceptCharset = 'UTF-8';
  submitForm.style.display = 'none';

  appendHiddenField(submitForm, config.emailFieldName, email);
  appendHiddenField(submitForm, config.sourceFieldName, source);
  appendHiddenField(submitForm, config.timestampFieldName, new Date().toISOString());
  appendHiddenField(submitForm, config.userAgentFieldName, navigator.userAgent);

  document.body.appendChild(submitForm);
  submitForm.submit();
  setTimeout(() => submitForm.remove(), 0);
}

function ensureInterestCaptureFrame() {
  const frameName = 'interest-capture-frame';
  let iframe = document.querySelector(`iframe[name="${frameName}"]`);

  if (!iframe) {
    iframe = document.createElement('iframe');
    iframe.name = frameName;
    iframe.title = 'Hidden interest capture submission frame';
    iframe.setAttribute('aria-hidden', 'true');
    iframe.tabIndex = -1;
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
  }

  return iframe;
}

function appendHiddenField(form, name, value) {
  if (!name) return;

  const input = document.createElement('input');
  input.type = 'hidden';
  input.name = name;
  input.value = value;
  form.appendChild(input);
}

function showInterestToast(message) {
  let toast = document.querySelector('[data-interest-toast]');

  if (!toast) {
    toast = document.createElement('div');
    toast.setAttribute('data-interest-toast', '');
    toast.className = 'interest-toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add('visible');

  clearTimeout(showInterestToast.hideTimer);
  showInterestToast.hideTimer = setTimeout(() => {
    toast.classList.remove('visible');
  }, 3200);
}

// 7. ANIMATIONS ON SCROLL
function initScrollObserver() {
  const sections = document.querySelectorAll('section');
  const borderLines = document.querySelectorAll('.section-divider-line');
  
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('section-visible');
        // Find inside elements to reveal
        const bentoCards = entry.target.querySelectorAll('.bento-card, .loop-card');
        bentoCards.forEach((c, idx) => {
          c.style.transitionDelay = `${idx * 0.1}s`;
          c.style.opacity = '1';
          c.style.transform = 'translateY(0)';
        });
      }
    });
  }, { threshold: 0.15 });

  sections.forEach(s => {
    sectionObserver.observe(s);
  });
}

// 8. SANDBOX CONTROLLERS (DEMO CHOOSER)
function initSandboxControls() {
  const demoButtons = document.querySelectorAll('[data-demo]');
  const btnReset = document.getElementById('btn-demo-reset');

  demoButtons.forEach((button) => {
    button.addEventListener('click', () => {
      if (isTyping) return;
      demoButtons.forEach((btn) => btn.classList.remove('active'));
      button.classList.add('active');
      startTypingDemo(button.dataset.demo);
    });
  });
  
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      if (typingInterval) clearInterval(typingInterval);
      isTyping = false;
      textField.textContent = '';
      childNode.classList.remove('visible');
      childNodeText.textContent = '';
      reflectionPrompt.innerHTML = 'Waiting for thoughts to be recorded...';
      demoButtons.forEach((btn) => btn.classList.remove('active'));
      citationListWrapper.innerHTML = `
        <div class="citation-empty-state" id="citation-empty">
          Write in the journal to surface related memories.
        </div>
      `;
    });
  }
}

// 8. APP INITIALIZATION
window.addEventListener('DOMContentLoaded', () => {
  // Initialize email interest capture forms
  initInterestCaptureForms();

  // Initialize Sandbox Button Handlers
  initSandboxControls();
  
  // Initialize Scroll animations
  initScrollObserver();
  
  // Start the default demo (anxiety) after a slight loading timeout
  setTimeout(() => {
    startTypingDemo('anxiety');
  }, 1200);

  // Load Three.js and initialize the subtle hero background.
  loadThreeAndInit3D();
});

// 9. DYNAMIC THREE.JS LOADER
function loadThreeAndInit3D() {
  // Only load WebGL scenes on desktop/tablet views to preserve performance
  if (window.innerWidth < 768) return;

  const scriptThree = document.createElement('script');
  scriptThree.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
  scriptThree.onload = () => {
    initBackgroundSphere3D();
  };
  scriptThree.onerror = () => {
    console.warn('Three.js failed to load. Falling back to static layouts.');
  };
  document.head.appendChild(scriptThree);
}

// Background Scene: Large rotating wireframe constellation sphere
function initBackgroundSphere3D() {
  const canvas = document.getElementById('bg-3d-canvas');
  const heroSection = document.getElementById('hero');
  if (!canvas || !heroSection) return;

  let width = heroSection.clientWidth;
  let height = heroSection.clientHeight;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.set(0, 0, 15);

  const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Create large wireframe sphere
  const sphereRadius = 7.2;
  const geometry = new THREE.IcosahedronGeometry(sphereRadius, 4);
  const densePointsGeometry = geometry.clone();
  
  // Wireframe material (Periwinkle Blue)
  const lineMat = new THREE.MeshBasicMaterial({
    color: 0xb1c5ff,
    wireframe: true,
    transparent: true,
    opacity: 0.12
  });
  const sphereLines = new THREE.Mesh(geometry, lineMat);
  scene.add(sphereLines);

  // Vertices points material (Gold stars)
  const pointsMat = new THREE.PointsMaterial({
    color: 0xdcc661,
    size: 0.04,
    transparent: true,
    opacity: 0.5
  });
  const spherePoints = new THREE.Points(densePointsGeometry, pointsMat);
  scene.add(spherePoints);

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const time = clock.getElapsedTime();

    // Constant slow rotations
    sphereLines.rotation.y = time * 0.02;
    sphereLines.rotation.x = time * 0.01;
    spherePoints.rotation.y = time * 0.02;
    spherePoints.rotation.x = time * 0.01;

    renderer.render(scene, camera);
  }
  animate();

  // Resize handler
  window.addEventListener('resize', () => {
    width = heroSection.clientWidth;
    height = heroSection.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  });
}
