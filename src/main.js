// InnerScript Landing Page Application Logic

// 1. TYPING DEMO SIMULATOR CONTEXTS
const DEMO_DATA = {
  anxiety: {
    text: "Feeling that persistent loop of anxiety about product alignment again...",
    childText: "It feels exactly like that time when we were preparing to launch last October.",
    triggerIndex: 45, // Trigger RAG when typing reaches "product alignment"
    reflection: "You've written about team alignment anxiety across <em>three previous project launches</em>. Is this about the team's actual progress, or a fear of repeating past communication blockages?",
    citations: [
      {
        date: "OCTOBER 14, 2025",
        score: "cos_sim: 0.94",
        text: "Tension during the beta release. Felt unheard by team when discussing <mark>SQLite vectors</mark>. Need to write down guidelines early next time."
      },
      {
        date: "AUGUST 02, 2025",
        score: "cos_sim: 0.81",
        text: "Felt anxious before client sync. Retrospectively, the alignment was fine, I was just overthinking the timeline differences."
      }
    ],
    graphHighlightNodes: [0, 4, 12, 18] // Which nodes light up for anxiety demo
  },
  idea: {
    text: "I should design a local-first peer-to-peer sync engine for my notes database...",
    childText: "Using CRDTs over a local SQLite file so we never need a centralized server.",
    triggerIndex: 35, // Trigger RAG when typing reaches "peer-to-peer sync"
    reflection: "You proposed a similar <em>local-first database replication scheme</em> 9 months ago. Should this build on your SQLite-Vec sync project or utilize a raw WebRTC socket?",
    citations: [
      {
        date: "SEPTEMBER 02, 2025",
        score: "cos_sim: 0.89",
        text: "Thinking about local sync. We could sync notes using <mark>raw bytes over WebRTC</mark> directly to browser SQLite rather than a cloud DB."
      },
      {
        date: "JUNE 18, 2025",
        score: "cos_sim: 0.76",
        text: "Researching CRDTs for outliner bullet structures. Yjs is solid, but writing a custom LWW-Register on SQLite column rows seems simpler."
      }
    ],
    graphHighlightNodes: [0, 8, 15, 23] // Which nodes light up for sync idea demo
  }
};

// 2. STATE MANAGER
let typingInterval = null;
let currentDemo = 'anxiety';
let isTyping = false;

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
      Write in the journal to trigger semantic recall.
    </div>
  `;
  
  // Reset Graph Node states
  resetGraphHighlight();
  
  // Animate active typing node glow
  const parentNode = document.getElementById('node-parent');
  parentNode.classList.add('active-typing');

  // Start character timer
  typingInterval = setInterval(() => {
    if (charIndex < data.text.length) {
      textField.textContent += data.text.charAt(charIndex);
      charIndex++;
      
      // Trigger RAG midway once writing semantic context is established
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
        `<span style="color: var(--color-teal); background-color: var(--color-teal-low); border-bottom: 1px dashed var(--color-teal); padding: 0 2px; border-radius: 2px;">` + 
        text.substring(start, start + len) + 
        `</span>` + 
        text.substring(start + len);
    }
  } else if (currentDemo === 'idea') {
    const start = text.indexOf('peer-to-peer sync engine');
    if (start !== -1) {
      const len = 'peer-to-peer sync engine'.length;
      textField.innerHTML = 
        text.substring(0, start) + 
        `<span style="color: var(--color-blue); background-color: rgba(177, 197, 255, 0.05); border-bottom: 1px dashed var(--color-blue); padding: 0 2px; border-radius: 2px;">` + 
        text.substring(start, start + len) + 
        `</span>` + 
        text.substring(start + len);
    }
  }
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
    card.style.borderLeftColor = currentDemo === 'anxiety' ? 'var(--color-teal)' : 'var(--color-gold)';
    card.innerHTML = `
      <div class="citation-header">
        <span class="citation-date" style="color: ${currentDemo === 'anxiety' ? 'var(--color-teal)' : 'var(--color-gold)'}">${cit.date}</span>
        <span class="citation-score">${cit.score}</span>
      </div>
      <p class="citation-text">${cit.text}</p>
    `;
    citationListWrapper.appendChild(card);
  });
  
  // 3. Highlight nodes and links in the Graph SVG
  highlightGraphNodes(data.graphHighlightNodes);
}

// 5. SEMANTIC GRAPH VIEW LOGIC (SVG Generator & Interactive physics)
const graphNodes = [];
const graphLinks = [];
const numNodes = 25;

function initSemanticGraph() {
  const svgLinks = document.getElementById('graph-links');
  const svgNodes = document.getElementById('graph-nodes');
  
  if (!svgLinks || !svgNodes) return;
  
  // Clear
  svgLinks.innerHTML = '';
  svgNodes.innerHTML = '';
  graphNodes.length = 0;
  graphLinks.length = 0;
  
  // Generate random clustered coordinates inside viewBox="0 0 800 220"
  const width = 800;
  const height = 220;
  
  // Node 0: Central active editing node
  graphNodes.push({ id: 0, x: width / 2, y: height / 2, label: 'Active Entry', size: 8, isCentral: true });
  
  // Generate cluster nodes
  for (let i = 1; i < numNodes; i++) {
    // Determine cluster focus
    let targetX = width / 2;
    let targetY = height / 2;
    let clusterName = 'general';
    
    if (i < 8) {
      // Anxiety cluster (left side)
      targetX = width * 0.3;
      targetY = height * 0.45;
      clusterName = 'anxiety';
    } else if (i < 16) {
      // Sync/Idea cluster (right side)
      targetX = width * 0.7;
      targetY = height * 0.55;
      clusterName = 'sync';
    } else {
      // Distant memory nodes
      targetX = width * (0.1 + Math.random() * 0.8);
      targetY = height * (0.1 + Math.random() * 0.8);
    }
    
    // Disperse slightly around targets
    const dist = 30 + Math.random() * 60;
    const angle = Math.random() * Math.PI * 2;
    const x = targetX + Math.cos(angle) * dist;
    const y = targetY + Math.sin(angle) * dist;
    
    let label = '';
    if (i === 4) label = 'Oct 14 beta release';
    if (i === 8) label = 'P2P WebRTC proposal';
    if (i === 12) label = 'August timeline anxiety';
    if (i === 15) label = 'Yjs outliner research';
    
    graphNodes.push({
      id: i,
      x: Math.max(20, Math.min(width - 20, x)),
      y: Math.max(20, Math.min(height - 20, y)),
      label: label,
      cluster: clusterName,
      size: label ? 5 : 3.5
    });
  }
  
  // Establish links (logical connections)
  // Link some nodes back to central node
  graphLinks.push({ source: 0, target: 4, cluster: 'anxiety' });
  graphLinks.push({ source: 0, target: 12, cluster: 'anxiety' });
  graphLinks.push({ source: 0, target: 8, cluster: 'sync' });
  graphLinks.push({ source: 0, target: 15, cluster: 'sync' });
  
  // Interconnect cluster nodes
  for (let i = 1; i < numNodes; i++) {
    const node = graphNodes[i];
    // Find closest nodes in same cluster and link them
    for (let j = i + 1; j < numNodes; j++) {
      const other = graphNodes[j];
      if (node.cluster === other.cluster && node.cluster !== 'general') {
        const dx = node.x - other.x;
        const dy = node.y - other.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 80 && Math.random() > 0.4) {
          graphLinks.push({ source: i, target: j, cluster: node.cluster });
        }
      }
    }
  }
  
  // Render Links
  graphLinks.forEach((link, idx) => {
    const sourceNode = graphNodes[link.source];
    const targetNode = graphNodes[link.target];
    
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', sourceNode.x);
    line.setAttribute('y1', sourceNode.y);
    line.setAttribute('x2', targetNode.x);
    line.setAttribute('y2', targetNode.y);
    line.setAttribute('class', 'graph-link');
    line.setAttribute('id', `link-${idx}`);
    line.dataset.source = link.source;
    line.dataset.target = link.target;
    line.dataset.cluster = link.cluster;
    
    svgLinks.appendChild(line);
  });
  
  // Render Nodes
  graphNodes.forEach(node => {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', node.x);
    circle.setAttribute('cy', node.y);
    circle.setAttribute('r', node.size);
    circle.setAttribute('id', `node-${node.id}`);
    
    if (node.isCentral) {
      circle.setAttribute('class', 'graph-node central-node');
    } else {
      circle.setAttribute('class', 'graph-node');
    }
    
    // Hover animations
    circle.addEventListener('mouseenter', () => {
      if (node.label) {
        showLabel(node.id);
      }
    });
    circle.addEventListener('mouseleave', () => {
      if (node.label && !circle.classList.contains('active')) {
        hideLabel(node.id);
      }
    });
    
    group.appendChild(circle);
    
    // Add Label elements
    if (node.label) {
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', node.x + 10);
      text.setAttribute('y', node.y + 4);
      text.setAttribute('class', 'graph-node-label');
      text.setAttribute('id', `label-${node.id}`);
      text.textContent = node.label;
      text.style.opacity = '0'; // Hidden by default, reveal on interaction/trigger
      group.appendChild(text);
    }
    
    svgNodes.appendChild(group);
  });
}

function showLabel(nodeId) {
  const label = document.getElementById(`label-${nodeId}`);
  if (label) {
    label.style.opacity = '1';
    label.classList.add('active');
  }
}

function hideLabel(nodeId) {
  const label = document.getElementById(`label-${nodeId}`);
  if (label) {
    label.style.opacity = '0';
    label.classList.remove('active');
  }
}

function highlightGraphNodes(nodeIds) {
  // First clear old active links
  const links = document.querySelectorAll('.graph-link');
  links.forEach(l => {
    l.classList.remove('active');
    l.classList.remove('teal-active');
  });
  
  nodeIds.forEach(id => {
    const circle = document.getElementById(`node-${id}`);
    if (circle) {
      circle.classList.add('active');
      if (currentDemo === 'anxiety') {
        circle.classList.add('teal-node');
      }
      showLabel(id);
    }
    
    // Check links that connect active targets
    links.forEach((l, idx) => {
      const s = parseInt(l.dataset.source);
      const t = parseInt(l.dataset.target);
      const cluster = l.dataset.cluster;
      
      if ((s === 0 && nodeIds.includes(t)) || (t === 0 && nodeIds.includes(s))) {
        if (currentDemo === 'anxiety' && cluster === 'anxiety') {
          l.classList.add('teal-active');
        } else if (currentDemo === 'idea' && cluster === 'sync') {
          l.classList.add('active');
        }
      }
    });
  });
}

function resetGraphHighlight() {
  const circles = document.querySelectorAll('.graph-node');
  circles.forEach(c => {
    if (!c.classList.contains('central-node')) {
      c.className.baseVal = 'graph-node';
    }
  });
  
  const labels = document.querySelectorAll('.graph-node-label');
  labels.forEach(l => {
    l.style.opacity = '0';
    l.classList.remove('active');
  });
  
  const links = document.querySelectorAll('.graph-link');
  links.forEach(l => {
    l.className.baseVal = 'graph-link';
  });
}

// 6. PERSONA TABS LOGIC
function initPersonaSwitcher() {
  const tabs = document.querySelectorAll('.tab-pill');
  const cards = document.querySelectorAll('.audience-card');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.dataset.target;
      
      // Remove active states
      tabs.forEach(t => t.classList.remove('active'));
      cards.forEach(c => c.classList.remove('active'));
      
      // Add active state to selected
      tab.classList.add('active');
      const targetCard = document.getElementById(targetId);
      if (targetCard) {
        targetCard.classList.add('active');
      }
    });
  });
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
        const bentoCards = entry.target.querySelectorAll('.bento-card, .loop-card, .seizure-box');
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
  const btnAnxiety = document.getElementById('btn-demo-anxiety');
  const btnIdea = document.getElementById('btn-demo-idea');
  const btnReset = document.getElementById('btn-demo-reset');
  
  if (btnAnxiety) {
    btnAnxiety.addEventListener('click', () => {
      if (isTyping) return;
      btnAnxiety.classList.add('active');
      btnIdea.classList.remove('active');
      startTypingDemo('anxiety');
    });
  }
  
  if (btnIdea) {
    btnIdea.addEventListener('click', () => {
      if (isTyping) return;
      btnIdea.classList.add('active');
      btnAnxiety.classList.remove('active');
      startTypingDemo('idea');
    });
  }
  
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      if (typingInterval) clearInterval(typingInterval);
      isTyping = false;
      textField.textContent = '';
      childNode.classList.remove('visible');
      childNodeText.textContent = '';
      reflectionPrompt.innerHTML = 'Waiting for thoughts to be recorded...';
      citationListWrapper.innerHTML = `
        <div class="citation-empty-state" id="citation-empty">
          Write in the journal to trigger semantic recall.
        </div>
      `;
      resetGraphHighlight();
    });
  }
}

// 9. APP INITIALIZATION
window.addEventListener('DOMContentLoaded', () => {
  // Initialize Graph View
  initSemanticGraph();
  
  // Initialize Persona Switcher
  initPersonaSwitcher();
  
  // Initialize Sandbox Button Handlers
  initSandboxControls();
  
  // Initialize Scroll animations
  initScrollObserver();
  
  // Start the default demo (anxiety) after a slight loading timeout
  setTimeout(() => {
    startTypingDemo('anxiety');
  }, 1200);

  // Load Three.js and initialize 3D Socrates model
  loadThreeAndInit3D();
});

// 10. DYNAMIC THREE.JS AND GLTF MODEL LOADER
function loadThreeAndInit3D() {
  // Only load WebGL scenes on desktop/tablet views to preserve performance
  if (window.innerWidth < 768) return;

  // Step 1: Load main Three.js library
  const scriptThree = document.createElement('script');
  scriptThree.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
  scriptThree.onload = () => {
    // Step 2: Load GLTFLoader addon
    const scriptGLTF = document.createElement('script');
    scriptGLTF.src = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js';
    scriptGLTF.onload = () => {
      // Step 3: Initialize both background sphere and foreground Socrates
      initBackgroundSphere3D();
      initForegroundSocrates3D();
    };
    document.head.appendChild(scriptGLTF);
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
  const geometry = new THREE.IcosahedronGeometry(7, 3); // Large, moderately detailed sphere
  
  // Wireframe material (Periwinkle Blue)
  const lineMat = new THREE.MeshBasicMaterial({
    color: 0xb1c5ff,
    wireframe: true,
    transparent: true,
    opacity: 0.06
  });
  const sphereLines = new THREE.Mesh(geometry, lineMat);
  scene.add(sphereLines);

  // Vertices points material (Gold stars)
  const pointsMat = new THREE.PointsMaterial({
    color: 0xdcc661,
    size: 0.05,
    transparent: true,
    opacity: 0.35
  });
  const spherePoints = new THREE.Points(geometry, pointsMat);
  scene.add(spherePoints);

  // Scroll parallax interaction variables
  let scrollY = 0;
  window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
  });

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const time = clock.getElapsedTime();

    // Constant slow rotations
    sphereLines.rotation.y = time * 0.02;
    sphereLines.rotation.x = time * 0.01;
    spherePoints.rotation.y = time * 0.02;
    spherePoints.rotation.x = time * 0.01;

    // Parallax scroll reaction (slide sphere upwards as user scrolls)
    sphereLines.position.y = scrollY * 0.003;
    spherePoints.position.y = scrollY * 0.003;

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

// Foreground Scene: Load and render the GLB Socrates statue model
function initForegroundSocrates3D() {
  const canvas = document.getElementById('hero-3d-canvas');
  const container = document.getElementById('hero-statue-container');
  const staticImage = document.getElementById('statue-image');
  if (!canvas || !container || !staticImage) return;

  // Render on full window size
  let width = window.innerWidth;
  let height = window.innerHeight;

  const scene = new THREE.Scene();
  // Telephoto lens simulation: 13.5 degrees vertical FOV, camera pulled back to z = 18
  const camera = new THREE.PerspectiveCamera(13.5, width / height, 0.1, 100);
  camera.position.set(0, 0, 18);

  const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true, preserveDrawingBuffer: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Lighting - Soft museum-style lighting for classical matte marble
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.25);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0xfff5ea, 0.7);
  keyLight.position.set(-6, 8, 8);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xe5f0ff, 0.45);
  fillLight.position.set(6, -4, 6);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0xb1c5ff, 1.1);
  rimLight.position.set(4, 8, -8);
  scene.add(rimLight);

  const softFrontLight = new THREE.PointLight(0xffffff, 0.1, 10);
  softFrontLight.position.set(0, 0, 4);
  scene.add(softFrontLight);

  // Group to handle model placement and rotation
  const headGroup = new THREE.Group();
  scene.add(headGroup);

  // Load the 3D model
  const loader = new THREE.GLTFLoader();
  loader.load(
    '/socrate.glb',
    (gltf) => {
      // Traverse mesh and assign matte warm white marble material
      gltf.scene.traverse((node) => {
        if (node.isMesh) {
          node.material = new THREE.MeshStandardMaterial({
            color: 0xe2e3e7,
            roughness: 0.9,
            metalness: 0.0,
            flatShading: false
          });
        }
      });

      // Centering and automatic scaling math
      const box = new THREE.Box3().setFromObject(gltf.scene);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      gltf.scene.position.x += (gltf.scene.position.x - center.x);
      gltf.scene.position.y += (gltf.scene.position.y - center.y);
      gltf.scene.position.z += (gltf.scene.position.z - center.z);

      // Scale model based on dimensions
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 6.4 / maxDim; // Maintain scale for consistent framing
      gltf.scene.scale.set(scale, scale, scale);

      headGroup.add(gltf.scene);

      // Reveal transition: hide static placeholder and show WebGL Canvas
      canvas.classList.add('visible');
      staticImage.style.opacity = '0';
      staticImage.style.pointerEvents = 'none';
      staticImage.style.transition = 'opacity 1.2s ease-in-out';

      // Log the canvas data URL after it renders in its resting state
      setTimeout(() => {
        const url = canvas.toDataURL('image/png');
        console.log("SOCRATES_DATA_URL_START");
        console.log(url);
        console.log("SOCRATES_DATA_URL_END");
      }, 5000);
    },
    undefined,
    (error) => {
      console.error('Error loading Socrates 3D model glb:', error);
    }
  );

  // Function to project the 3D headGroup to track the center of the HTML container
  function updateModelPosition() {
    const rect = container.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Convert screen pixel coordinates to Normalized Device Coordinates (NDC)
    const ndcX = (centerX / window.innerWidth) * 2 - 1;
    const ndcY = -(centerY / window.innerHeight) * 2 + 1;

    // Unproject to find corresponding coordinates in 3D scene space at depth Z=0
    const tempV = new THREE.Vector3(ndcX, ndcY, 0.5);
    tempV.unproject(camera);
    tempV.sub(camera.position).normalize();

    const targetZ = 0;
    const distance = (targetZ - camera.position.z) / tempV.z;
    const targetPosition = camera.position.clone().add(tempV.multiplyScalar(distance));

    // Align model position with horizontal/vertical offsets for optimal bust framing
    headGroup.position.x = targetPosition.x - 0.55;
    headGroup.position.y = targetPosition.y - 0.3;
  }

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const time = clock.getElapsedTime();

    // Dynamically update model position relative to screen container coordinates
    updateModelPosition();

    // Smooth continuous Y rotation, no mouse look-at as requested
    headGroup.rotation.y = time * 0.05;
    headGroup.rotation.x = 0;

    renderer.render(scene, camera);
  }
  animate();

  // Resize handler
  window.addEventListener('resize', () => {
    width = window.innerWidth;
    height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  });
}
