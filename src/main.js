// InnerScript Landing Page Application Logic

// 1. CONCEPT PREVIEW VARIATIONS
const PREVIEW_VARIATIONS = [
  {
    id: 'live-recall',
    label: 'Live Recall',
    note: 'Best for showing the product loop as a workspace.',
    eyebrow: 'CURRENT THOUGHT',
    title: 'The thought enters. The archive answers.',
    thought: 'I keep returning to the same idea, then pretending it does not matter.',
    followup: 'Every few months I write around it, rename it, and make it sound smaller than it is.',
    reflection: 'This resembles older entries where the ambition appears right before you dismiss it as unrealistic. Is the doubt about timing, or about admitting you still want the thing enough to start?',
    journalNotes: [
      {
        label: 'Later that night',
        text: 'I keep calling it a side thought, a someday idea, a distraction. That is easier than admitting I still want it.'
      },
      {
        label: 'Morning / night',
        text: 'By morning I dismiss it. By night I am sketching the first version again.'
      },
      {
        label: 'The uncomfortable part',
        text: 'The want is older than the excuse.'
      },
      {
        label: 'For tomorrow',
        text: 'What would the smallest honest version look like if I stopped trying to make it impressive?'
      }
    ],
    sources: [
      {
        date: 'MAR 12, 2026',
        tag: 'strong match',
        text: 'Woke up thinking about the same product again. I called it a distraction, but it felt more like something I was afraid to commit to.'
      },
      {
        date: 'NOV 05, 2025',
        tag: 'related memory',
        text: 'Listed three reasons the idea would not work, then spent the evening sketching it anyway.'
      },
      {
        date: 'JUN 18, 2025',
        tag: 'older signal',
        text: 'If I still care about this next month, I should stop calling it a side thought.'
      }
    ]
  },
  {
    id: 'timeline-replay',
    label: 'Timeline Replay',
    note: 'Best for showing that old writing has a history, not just search results.',
    title: 'See the pattern move through time.',
    thought: 'The same ambition returned again.',
    reflection: 'The archive shows a cycle: excitement, dismissal, renaming, then a quiet return.',
    events: [
      {
        date: 'JUN 2025',
        title: 'The first serious note',
        text: 'You described the idea as impractical, then wrote three pages about why it mattered.'
      },
      {
        date: 'NOV 2025',
        title: 'Dismissed, then sketched',
        text: 'The entry argues against the idea while quietly designing the first version.'
      },
      {
        date: 'MAR 2026',
        title: 'Renamed as a distraction',
        text: 'You tried to shrink the ambition by calling it a side thought.'
      },
      {
        date: 'TODAY',
        title: 'The idea returns',
        text: 'InnerScript connects the new entry to an older buried ambition.'
      }
    ]
  },
  {
    id: 'source-stack',
    label: 'Source Stack',
    note: 'Best for making the source-backed promise obvious.',
    title: 'Every reflection can point back to the line.',
    thought: 'Why do I keep coming back to this idea?',
    reflection: 'Possible pattern: the idea is not random. You repeatedly file it away right after it starts feeling personally important, then return to it with a new name.',
    sources: [
      {
        date: 'MAR 12, 2026',
        tag: 'line 14',
        text: 'I called it a distraction, but it felt more like something I was afraid to commit to.'
      },
      {
        date: 'NOV 05, 2025',
        tag: 'line 08',
        text: 'Listed three reasons the idea would not work, then spent the evening sketching it anyway.'
      },
      {
        date: 'JUN 18, 2025',
        tag: 'line 22',
        text: 'If I still care about this next month, I should stop calling it a side thought.'
      },
      {
        date: 'APR 02, 2026',
        tag: 'line 31',
        text: 'Maybe I keep postponing it because finishing the first version would make the want visible.'
      }
    ]
  }
];

/*
 * Archived preview explorations for later review. The live V3 switcher intentionally
 * keeps three variants: Live Recall, Timeline, and Sources.
 */
const ARCHIVED_PREVIEW_VARIATIONS = [
  {
    id: 'pattern-map',
    label: 'Pattern Map',
    note: 'Best for showing compact self-understanding without long lists.',
    title: 'A private entry becomes a pattern map.',
    thought: 'I keep pretending this ambition is optional, but it keeps coming back.',
    reflection: 'InnerScript groups the entry into grounded patterns without turning one journal line into a diagnosis.',
    patterns: [
      {
        label: 'Buried ambition',
        score: '8 matches',
        text: 'The same idea returns after quiet periods and transition weeks.'
      },
      {
        label: 'Repeated habit',
        score: '6 matches',
        text: 'You label it impractical before testing the smallest version.'
      },
      {
        label: 'Contradiction',
        score: '4 matches',
        text: 'You dismiss it, then keep designing around it in private.'
      }
    ]
  },
  {
    id: 'before-after',
    label: 'Before / After',
    note: 'Best for explaining the silent archive problem quickly.',
    title: 'From stored writing to speaking context.',
    thought: 'I keep returning to the same idea.',
    before: [
      'ideas-i-keep-postponing.md',
      'late-night-sketches.md',
      'journal-2026-03.md',
      'private-notes.txt'
    ],
    after: [
      'This looks like a recurring ambition.',
      'Older entries show excitement followed by self-dismissal.',
      'One note asks you to stop calling it a side thought.',
      'The exact supporting lines are ready to inspect.'
    ]
  }
];

// 2. STATE MANAGER
let currentPreviewId = 'live-recall';

const interestCaptureConfig = {
  endpoint: 'https://script.google.com/macros/s/AKfycbycgtEG_SUmpuaCArSQgJXU3AHGbeQqQHEFbt3QsXwtnedqnSePYPSPrqkmw2qvZuZgvg/exec',
  emailFieldName: 'email',
  sourceFieldName: 'source',
  timestampFieldName: 'timestamp',
  userAgentFieldName: 'userAgent'
};

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  })[char]);
}

function renderPreviewVariation(previewId) {
  const preview = PREVIEW_VARIATIONS.find((item) => item.id === previewId) || PREVIEW_VARIATIONS[0];
  const stage = document.getElementById('concept-preview-stage');
  const note = document.getElementById('preview-decision-note');
  const selectedIndex = PREVIEW_VARIATIONS.findIndex((item) => item.id === preview.id);

  if (!stage) return;

  currentPreviewId = preview.id;
  stage.className = `concept-preview-stage preview-${preview.id}`;
  stage.setAttribute('aria-labelledby', `tab-${preview.id}`);
  stage.innerHTML = getPreviewMarkup(preview);

  if (note) {
    note.textContent = `Variation ${selectedIndex + 1} of ${PREVIEW_VARIATIONS.length} / ${preview.label}`;
  }

  document.querySelectorAll('[data-preview-tab]').forEach((button) => {
    const isActive = button.dataset.previewTab === preview.id;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-selected', isActive ? 'true' : 'false');
    button.tabIndex = isActive ? 0 : -1;
  });
}

function getPreviewMarkup(preview) {
  if (preview.id === 'timeline-replay') return renderTimelinePreview(preview);
  if (preview.id === 'source-stack') return renderSourceStackPreview(preview);
  return renderLiveRecallPreview(preview);
}

function renderLiveRecallPreview(preview) {
  return `
    <div class="workspace-grid" data-preview-panel="${preview.id}">
      <article class="workspace-panel outliner-panel">
        <div class="panel-header">
          <div class="panel-title"><span class="icon-outline"></span><span>journal / today.md</span></div>
          <div class="panel-status">WRITING</div>
        </div>
        <div class="outliner-content">
          <div class="outliner-node depth-0 active-typing">
            <span class="bullet-point"></span>
            <div class="node-text-wrapper">
              <span class="node-text">${escapeHtml(preview.thought)}</span>
            </div>
          </div>
          <div class="outliner-node depth-1 visible">
            <span class="bullet-point"></span>
            <div class="node-text-wrapper">
              <span class="node-text text-muted">${escapeHtml(preview.followup)}</span>
            </div>
          </div>
          ${preview.journalNotes.map((note) => `
            <div class="outliner-node depth-1 visible note-detail-node">
              <span class="bullet-point"></span>
              <div class="node-text-wrapper">
                <span class="node-label">${escapeHtml(note.label)}</span>
                <span class="node-text">${escapeHtml(note.text)}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </article>
      <article class="workspace-panel reflection-panel">
        <div class="panel-header">
          <div class="panel-title"><span class="icon-reflection"></span><span>Reflection</span></div>
          <div class="panel-tag">SOURCES ACTIVE</div>
        </div>
        <div class="reflection-content">
          <div class="reflection-card">
            <div class="card-badge">REFLECTION QUESTION</div>
            <h3 class="reflection-question">${escapeHtml(preview.reflection)}</h3>
            <p class="reflection-meta">A concept preview for source-backed reflection from personal writing.</p>
          </div>
          <div class="citations-container">
            <div class="citation-title">RELATED WRITING</div>
            <div class="citation-list">
              ${preview.sources.map(renderCitationCard).join('')}
            </div>
          </div>
        </div>
      </article>
    </div>
    <p class="preview-usage-note">${escapeHtml(preview.note)}</p>
  `;
}

function renderTimelinePreview(preview) {
  return `
    <div class="preview-composition preview-timeline-layout" data-preview-panel="${preview.id}">
      <article class="preview-summary-panel">
        <div class="card-badge">TIMELINE REPLAY</div>
        <h3>${escapeHtml(preview.title)}</h3>
        <p>${escapeHtml(preview.reflection)}</p>
        <div class="current-thought-pill">${escapeHtml(preview.thought)}</div>
      </article>
      <ol class="memory-timeline" aria-label="Related journal history">
        ${preview.events.map((event) => `
          <li class="timeline-event">
            <span class="timeline-date">${escapeHtml(event.date)}</span>
            <div>
              <strong>${escapeHtml(event.title)}</strong>
              <p>${escapeHtml(event.text)}</p>
            </div>
          </li>
        `).join('')}
      </ol>
    </div>
    <p class="preview-usage-note">${escapeHtml(preview.note)}</p>
  `;
}

function renderSourceStackPreview(preview) {
  return `
    <div class="preview-composition preview-source-layout" data-preview-panel="${preview.id}">
      <article class="source-query-panel">
        <div class="card-badge">SOURCE-BACKED ANSWER</div>
        <h3>${escapeHtml(preview.title)}</h3>
        <p class="source-query">${escapeHtml(preview.thought)}</p>
        <p>${escapeHtml(preview.reflection)}</p>
      </article>
      <div class="source-stack-list">
        ${preview.sources.map(renderSourceCard).join('')}
      </div>
    </div>
    <p class="preview-usage-note">${escapeHtml(preview.note)}</p>
  `;
}

/*
 * Archived renderers for the removed V3 preview variants.
 *
function renderPatternMapPreview(preview) {
  return `
    <div class="preview-composition preview-pattern-layout" data-preview-panel="${preview.id}">
      <article class="pattern-current-card">
        <div class="card-badge">PATTERN MAP</div>
        <h3>${escapeHtml(preview.title)}</h3>
        <p>${escapeHtml(preview.thought)}</p>
        <span>${escapeHtml(preview.reflection)}</span>
      </article>
      <div class="pattern-grid" aria-label="Detected pattern groups">
        ${preview.patterns.map((pattern) => `
          <article class="pattern-card">
            <div class="pattern-score">${escapeHtml(pattern.score)}</div>
            <h4>${escapeHtml(pattern.label)}</h4>
            <p>${escapeHtml(pattern.text)}</p>
          </article>
        `).join('')}
      </div>
    </div>
    <p class="preview-usage-note">${escapeHtml(preview.note)}</p>
  `;
}

function renderBeforeAfterPreview(preview) {
  return `
    <div class="preview-composition preview-before-after-layout" data-preview-panel="${preview.id}">
      <article class="archive-column archive-before">
        <div class="card-badge">BEFORE</div>
        <h3>Stored, but silent.</h3>
        <p>${escapeHtml(preview.thought)}</p>
        <ul>
          ${preview.before.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
        </ul>
      </article>
      <article class="archive-column archive-after">
        <div class="card-badge">AFTER</div>
        <h3>${escapeHtml(preview.title)}</h3>
        <ul>
          ${preview.after.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
        </ul>
      </article>
    </div>
    <p class="preview-usage-note">${escapeHtml(preview.note)}</p>
  `;
}
 */

function renderCitationCard(citation) {
  return `
    <article class="citation-card">
      <div class="citation-header">
        <span class="citation-date">${escapeHtml(citation.date)}</span>
        <span class="citation-score">${escapeHtml(citation.tag)}</span>
      </div>
      <p class="citation-text">${escapeHtml(citation.text)}</p>
    </article>
  `;
}

function renderSourceCard(source) {
  return `
    <article class="source-card">
      <div class="citation-header">
        <span class="citation-date">${escapeHtml(source.date)}</span>
        <span class="citation-score">${escapeHtml(source.tag)}</span>
      </div>
      <p>${escapeHtml(source.text)}</p>
    </article>
  `;
}

// 3. EMAIL INTEREST CAPTURE
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

      const isCollaboration = source.startsWith('collaboration');
      showInterestToast(
        isCollaboration
          ? 'Thanks. We will reach out about collaborating.'
          : 'You are on the early access list.',
        !isCollaboration,
      );
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

function showInterestToast(message, celebrate = false) {
  let toast = document.querySelector('[data-interest-toast]');

  if (!toast) {
    toast = document.createElement('div');
    toast.setAttribute('data-interest-toast', '');
    toast.className = 'interest-toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.appendChild(toast);
  }

  toast.replaceChildren();
  const shouldAnimate = celebrate && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (celebrate) {
    if (shouldAnimate) {
      const toastRipple = document.createElement('span');
      toastRipple.className = 'interest-toast-ripple';
      toastRipple.setAttribute('aria-hidden', 'true');
      toast.appendChild(toastRipple);
    }

    const toastIcon = document.createElement('span');
    toastIcon.className = 'interest-toast-icon';
    toastIcon.setAttribute('aria-hidden', 'true');
    toastIcon.textContent = '🎉';
    toast.appendChild(toastIcon);
  }

  const toastMessage = document.createElement('span');
  toastMessage.className = 'interest-toast-message';
  toastMessage.textContent = message;
  toast.appendChild(toastMessage);

  if (shouldAnimate) {
    const confetti = document.createElement('span');
    confetti.className = 'interest-toast-confetti';
    confetti.setAttribute('aria-hidden', 'true');

    const colors = ['#5b8cff', '#8caeff', '#f4c95d', '#f06f7b', '#73d2a7'];
    for (let index = 0; index < 28; index += 1) {
      const particle = document.createElement('span');
      const angle = (index / 28) * Math.PI * 2;
      const distance = 70 + Math.random() * 70;

      particle.className = 'interest-toast-confetti-piece';
      particle.style.setProperty('--confetti-x', `${Math.cos(angle) * distance}px`);
      particle.style.setProperty('--confetti-y', `${Math.sin(angle) * distance}px`);
      particle.style.setProperty('--confetti-rotation', `${Math.random() * 540 - 270}deg`);
      particle.style.setProperty('--confetti-delay', `${Math.random() * 120}ms`);
      particle.style.setProperty('--confetti-color', colors[index % colors.length]);
      confetti.appendChild(particle);
    }

    toast.appendChild(confetti);
  }

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

function initScrollTopLinks() {
  document.querySelectorAll('[data-scroll-top]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();

      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });

      if (window.location.hash) {
        window.history.replaceState(null, document.title, `${window.location.pathname}${window.location.search}`);
      }
    });
  });
}

function initHeaderSectionLinks() {
  document.querySelectorAll('[data-highlight-target]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const target = document.querySelector(link.getAttribute('data-highlight-target'));
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });

      target.classList.remove('is-callout-highlight');
      window.setTimeout(() => target.classList.add('is-callout-highlight'), 20);
      window.setTimeout(() => target.classList.remove('is-callout-highlight'), 1700);
    });
  });
}

// 8. SANDBOX CONTROLLERS (PREVIEW CHOOSER)
function initSandboxControls() {
  const previewButtons = Array.from(document.querySelectorAll('[data-preview-tab]'));

  previewButtons.forEach((button, index) => {
    button.addEventListener('click', () => {
      renderPreviewVariation(button.dataset.previewTab);
    });

    button.addEventListener('keydown', (event) => {
      if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;

      event.preventDefault();
      let nextIndex = index;
      if (event.key === 'ArrowRight') nextIndex = (index + 1) % previewButtons.length;
      if (event.key === 'ArrowLeft') nextIndex = (index - 1 + previewButtons.length) % previewButtons.length;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = previewButtons.length - 1;

      previewButtons[nextIndex].focus();
      renderPreviewVariation(previewButtons[nextIndex].dataset.previewTab);
    });
  });

  renderPreviewVariation(currentPreviewId);
}

// 8. APP INITIALIZATION
window.addEventListener('DOMContentLoaded', () => {
  // Initialize email interest capture forms
  initInterestCaptureForms();

  // Initialize Sandbox Button Handlers
  initSandboxControls();
  
  // Initialize Scroll animations
  initScrollObserver();

  // Make footer top links work repeatedly even when the hash is already set.
  initScrollTopLinks();

  // Clarify where header CTA actions land.
  initHeaderSectionLinks();
  
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
