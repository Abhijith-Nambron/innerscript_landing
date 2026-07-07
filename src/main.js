// InnerScript Landing Page Application Logic

// 1. CONCEPT PREVIEW VARIATIONS
const PREVIEW_VARIATIONS = [
  {
    id: 'live-recall',
    label: 'Live Recall',
    note: 'Best for showing the product loop as a workspace.',
    eyebrow: 'CURRENT THOUGHT',
    title: 'The thought enters. The archive answers.',
    thought: 'My focus collapsed again after three packed meeting days, even though the work itself was going well.',
    followup: 'This feels less like laziness and more like ignoring the recovery pattern I already know.',
    reflection: 'This resembles earlier entries about meeting-heavy exhaustion. Is the problem motivation, or the recovery window you keep skipping?',
    sources: [
      {
        date: 'JAN 17, 2026',
        tag: 'strong match',
        text: 'Great progress early in the week, then no energy by Thursday after back-to-back calls. Need one quiet morning after meeting clusters.'
      },
      {
        date: 'OCT 03, 2025',
        tag: 'related memory',
        text: 'Focus returned after canceling two optional syncs and spending the morning writing alone.'
      }
    ]
  },
  {
    id: 'timeline-replay',
    label: 'Timeline Replay',
    note: 'Best for showing that old writing has a history, not just search results.',
    title: 'See the pattern move through time.',
    thought: 'The week went well, but my focus still crashed.',
    reflection: 'The same recovery pattern appears in older entries, across different workloads and seasons.',
    events: [
      {
        date: 'OCT 2025',
        title: 'Quiet morning restored focus',
        text: 'You noticed that fewer calls brought your writing energy back.'
      },
      {
        date: 'JAN 2026',
        title: 'Back-to-back calls drained the week',
        text: 'The entry connects progress with a delayed energy crash.'
      },
      {
        date: 'TODAY',
        title: 'Current thought repeats it',
        text: 'InnerScript connects the new entry to an older recovery pattern.'
      }
    ]
  },
  {
    id: 'source-stack',
    label: 'Source Stack',
    note: 'Best for making the source-backed promise obvious.',
    title: 'Every reflection can point back to the line.',
    thought: 'Why did my focus crash after a good work week?',
    reflection: 'Possible pattern: the crash follows meeting density more than the difficulty of the work.',
    sources: [
      {
        date: 'JAN 17, 2026',
        tag: 'line 14',
        text: 'No energy by Thursday after back-to-back calls. Need one quiet morning after meeting clusters.'
      },
      {
        date: 'OCT 03, 2025',
        tag: 'line 08',
        text: 'Focus returned after canceling two optional syncs and spending the morning writing alone.'
      },
      {
        date: 'FEB 12, 2026',
        tag: 'line 22',
        text: 'I keep scheduling recovery after the crash instead of before it.'
      }
    ]
  },
  {
    id: 'pattern-map',
    label: 'Pattern Map',
    note: 'Best for showing compact self-understanding without long lists.',
    title: 'A private entry becomes a pattern map.',
    thought: 'The calendar looked productive, but my body treated it like overload.',
    reflection: 'InnerScript groups the entry into a few grounded patterns you can inspect.',
    patterns: [
      {
        label: 'Energy curve',
        score: '7 matches',
        text: 'Focus falls after dense meeting clusters.'
      },
      {
        label: 'Repeated habit',
        score: '5 matches',
        text: 'Recovery is scheduled only after the crash.'
      },
      {
        label: 'Work rhythm',
        score: '4 matches',
        text: 'Writing returns after one quiet morning.'
      }
    ]
  },
  {
    id: 'before-after',
    label: 'Before / After',
    note: 'Best for explaining the silent archive problem quickly.',
    title: 'From stored writing to speaking context.',
    thought: 'My focus crashed after another packed week.',
    before: [
      'journal-2025-05.md',
      'dinner-notes.md',
      'voice-memos.txt'
    ],
    after: [
      'This looks like an older recovery pattern.',
      'Two entries mention meeting density as the trigger.',
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
  if (preview.id === 'pattern-map') return renderPatternMapPreview(preview);
  if (preview.id === 'before-after') return renderBeforeAfterPreview(preview);
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
