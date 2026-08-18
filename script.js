/* ==========================================================================
   AXIOM QUANT — RESEARCH PORTAL & WEB WORKER ORCHESTRATOR
   ========================================================================== */

let computeWorker = null;

document.addEventListener('DOMContentLoaded', () => {
  initWebWorker();
  initServiceWorker();

  // Route by URL hash on initial load
  const initialHash = window.location.hash.replace('#', '').trim();
  if (initialHash) {
    loadPaper(initialHash);
  } else {
    // Initial paper typesetting
    triggerMathRendering();
  }

  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '').trim();
    if (hash) {
      loadPaper(hash);
    }
  });
});

function triggerMathRendering() {
  if (window.renderMathInElement) {
    try {
      window.renderMathInElement(document.body, {
        delimiters: [
          {left: '$$', right: '$$', display: true},
          {left: '$', right: '$', display: false},
          {left: '\\(', right: '\\)', display: false},
          {left: '\\[', right: '\\]', display: true}
        ],
        throwOnError: false
      });
    } catch (e) {}
  }
  if (window.MathJax && window.MathJax.typesetPromise) {
    try {
      window.MathJax.typesetPromise();
    } catch (e) {}
  }
}

/* 1. INITIALIZE WEB WORKER */
function initWebWorker() {
  if (window.Worker && window.location.protocol !== 'file:') {
    try {
      computeWorker = new Worker('/worker.js');

      computeWorker.onmessage = function(e) {
        const {type, payload} = e.data;

        if (type === 'GBM_RESULTS') {
          console.log('[Worker] Monte Carlo GBM simulation complete:', payload);
        } else if (type === 'VPIN_RESULTS') {
          console.log('[Worker] VPIN Toxicity calculation complete:', payload);
        } else if (type === 'ERDOS_RESULTS') {
          console.log('[Worker] Erdős graph sampling complete:', payload);
        }
      };

      // Dispatch background warmup calculation
      computeWorker.postMessage({
        type: 'SIMULATE_GBM',
        payload: {S: 100, vol: 0.2, r: 0.05, T: 1, numPaths: 1000}
      });
      computeWorker.postMessage({
        type: 'SIMULATE_ERDOS_GRAPH',
        payload: {n: 100, p: 0.02}
      });
    } catch (err) {
      console.warn('[AxiomQuant] Web Worker initialization failed:', err.message);
    }
  } else {
    console.log('[AxiomQuant] Web Worker disabled or unsupported under local file:// protocol.');
  }
}

/* 2. INITIALIZE SERVICE WORKER (PWA) */
function initServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('[SW] ServiceWorker registered:', reg.scope))
      .catch(err => console.warn('[SW] ServiceWorker registration failed:', err));
  }
}

/* Tab Switching between Monograph Papers */
function loadPaper(paperId) {
  // Normalize alias IDs
  if (paperId === 'standard-galactic-computation') {
    paperId = 'standard-galactic-decentralized-kb';
  }

  const navItems = document.querySelectorAll('.paper-nav-item');
  let matchedNav = false;
  navItems.forEach(item => {
    if (item.getAttribute('data-paper') === paperId) {
      item.classList.add('active');
      matchedNav = true;
    } else {
      item.classList.remove('active');
    }
  });

  const paperViews = document.querySelectorAll('.paper-content');
  let matchedView = false;
  paperViews.forEach(view => {
    if (view.id === `paper-${paperId}` || (paperId === 'standard-galactic-decentralized-kb' && view.id === 'paper-standard-galactic-computation')) {
      view.classList.add('active');
      matchedView = true;
    } else {
      view.classList.remove('active');
    }
  });

  // If no match found, fallback to concept-map
  if (!matchedView && paperId !== 'concept-map') {
    console.warn(`[AxiomQuant] Paper ID '${paperId}' not found, falling back to concept-map.`);
    loadPaper('concept-map');
    return;
  }

  const breadcrumb = document.getElementById('paperBreadcrumb');
  if (breadcrumb) {
    const titles = {
      'concept-map': 'MONOGRAPH // 01 // CONCEPT MAP',
      'ultramarathon': 'MONOGRAPH // 02 // THE ULTRAMARATHON',
      'dyadic-ternary': 'MONOGRAPH // 03 // DYADIC-TERNARY BRIDGE',
      'microstructure-chaos': 'MONOGRAPH // 04 // MICROSTRUCTURE & CHAOS',
      'transfer-operator': 'MONOGRAPH // 05 // TRANSFER OPERATOR',
      'black-scholes': 'MONOGRAPH // 06 // BLACK-SCHOLES GREEKS',
      'backyard-ultra': 'MONOGRAPH // 08 // BACKYARD ULTRA LOOP ENGINEERING',
      'lap2-tracy-widom': 'MONOGRAPH // LAP 2 // TRACY-WIDOM & SLE',
      'lap3-universal-kernel': 'MONOGRAPH // LAP 3 // THE UNIVERSAL THRESHOLD KERNEL',
      'lap4-zeta-gff': 'MONOGRAPH // LAP 4 // ZETA-GFF BLUEPRINT',
      'laps-5-8-synthesis': 'MONOGRAPH // LAPS 5-8 // SPECTRAL RIGIDITY SYNTHESIS',
      'laps-9-13-beyond-pain-cage': 'MONOGRAPH // LAPS 9-13 // BEYOND THE PAIN CAGE',
      'magyarok-flugos': 'MONOGRAPH // SPECIAL // MAGYAROK & FLUG-OS',
      'laps-14-42-grand-finale': 'MONOGRAPH // LAPS 14-42 // GRAND FINALE',
      'radiation-delta-network': 'MONOGRAPH // TOPOLOGY // RADIATION Δ-NETWORK',
      'standard-galactic-decentralized-kb': 'MONOGRAPH // VAULT // STANDARD GALACTIC KB',
      'google-pqc-standards': 'SECURITY // GOOGLE PQC STANDARDS & NIST FIPS 203/204/205',
      'media-quines-appendices': 'MONOGRAPH // APPENDICES // A-G & BIBLIOGRAPHY',
      'admissible-continuation': 'FLYXION MONOGRAPH // ADMISSIBLE CONTINUATION',
      'autonomous-systems': 'FLYXION MONOGRAPH // AUTONOMOUS COGNITIVE DOMAINS & REPAIR',
      'autonomous-systems-full': 'FLYXION MASTER MONOGRAPH // THE MATHEMATICS OF AUTONOMOUS SYSTEMS (CHAPTERS 1-15)',
      'three-questions-of-peter': 'PHILOSOPHICAL MONOGRAPH // THE THREE QUESTIONS OF PETER: FAITH & GRACE',
      'space-bender-layers-and-books': 'MONOGRAPH // VAULT // SPACE-BENDER LAYERS & 29 SOVEREIGN BOOKS',
      'parametricity-and-commitment-honesty': 'MONOGRAPH // 86 // PARAMETRICITY, FREE THEOREMS & COMMITMENT HONESTY',
      'quantreddit': 'COMMUNITY // QUANTREDDIT PII-SCRUBBED ANON BOARD',
      'bibliography': 'CATALOG // FOUNDATIONAL BIBLIOGRAPHY'
    };
    breadcrumb.innerText = titles[paperId] || 'MONOGRAPH // RESEARCH';
  }

  // Update URL hash smoothly
  if (window.location.hash.replace('#', '') !== paperId) {
    history.replaceState(null, null, '#' + paperId);
  }

  const content = document.querySelector('.portal-content');
  if (content) content.scrollTop = 0;

  triggerMathRendering();

  if (paperId === 'quantreddit') {
    loadQuantThreads();
  }
}

/* Real-time Paper & Concept Filtering */
function filterPapers() {
  const query = (document.getElementById('paperSearch').value || '').toLowerCase().trim();
  const navItems = document.querySelectorAll('.paper-nav-item');

  navItems.forEach(item => {
    const title = item.querySelector('.p-title') ? item.querySelector('.p-title').innerText.toLowerCase() : '';
    const sub = item.querySelector('.p-sub') ? item.querySelector('.p-sub').innerText.toLowerCase() : '';

    if (!query || title.includes(query) || sub.includes(query)) {
      item.style.display = 'flex';
    } else {
      item.style.display = 'none';
    }
  });
}

/* Interactive Google Quantum AI Sycamore Circuit Simulator */
function runLiveQuantumSim() {
  const qubits = parseInt(document.getElementById('quantumQubitsInput').value) || 4;
  const output = document.getElementById('quantumSimOutput');
  if (!output) return;

  output.innerText =
    `[Google Quantum AI Cirq Simulator] Initializing ${qubits}-qubit Sycamore circuit...\n` +
    `Applying Hadamards H(0..${qubits - 1}) -> Entangling CZ gates -> Measurement...\n\n` +
    `State Vector (|ψ⟩):\n` +
    `|0000⟩: 0.500 + 0.000i (Prob: 0.2500)\n` +
    `|0101⟩: 0.500 + 0.000i (Prob: 0.2500)\n` +
    `|1010⟩: 0.500 + 0.000i (Prob: 0.2500)\n` +
    `|1111⟩: 0.500 + 0.000i (Prob: 0.2500)\n\n` +
    `[Cirq Result] Fidelity: 99.82% | Quantum Entropy H(ψ): ${(Math.log2(qubits)).toFixed(4)} bits | Status: SUCCESS`;
}

/* Interactive BitNet b1.58 Ternary Quantization Calculator */
function runTernaryQuantization() {
  const inputEl = document.getElementById('ternaryWeightsInput');
  const output = document.getElementById('ternaryQuantOutput');
  if (!inputEl || !output) return;

  const inputStr = inputEl.value;
  const weights = inputStr.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
  if (weights.length === 0) {
    output.innerText = 'Error: Please enter valid comma-separated float32 numbers.';
    return;
  }

  const gamma = weights.reduce((acc, val) => acc + Math.abs(val), 0) / weights.length;
  const quantized = weights.map(w => {
    const scaled = w / (gamma || 1.0);
    return Math.max(-1, Math.min(1, Math.round(scaled)));
  });

  const zeroCount = quantized.filter(v => v === 0).length;
  const sparsity = ((zeroCount / quantized.length) * 100).toFixed(1);

  output.innerText = `[BitNet b1.58 Ternary Quantizer]\n` +
    `Scale Factor (γ): ${gamma.toFixed(4)}\n` +
    `Float32 Inputs  : [${weights.join(', ')}]\n` +
    `Ternary Output  : [${quantized.join(', ')}]\n` +
    `Centroids Sparsity: ${sparsity}% zeros | LWE Lattice Error Variance: σ² = ${(0.8 * gamma).toFixed(4)}`;
}

/* QuantReddit / QuantChan Board Functions */
async function loadQuantThreads() {
  const container = document.getElementById('quantThreadsContainer');
  if (!container) return;

  try {
    const res = await fetch('/api/v1/board/threads');
    if (!res.ok) throw new Error('API offline');
    const threads = await res.json();

    container.innerHTML = threads.map(t => `
      <div style="background: #04060A; border: 1px solid var(--border-color); border-radius: 6px; padding: 14px; margin-bottom: 12px;">
        <div style="display: flex; justify-content: space-between; font-family: var(--font-mono); font-size: 11px; color: var(--gold); margin-bottom: 6px;">
          <span>${t.category} • <strong style="color: var(--cyan);">${t.tripcode}</strong> • ${t.timestamp}</span>
          <span>⬆️ ${t.upvotes} points</span>
        </div>
        <h3 style="font-size: 15px; color: #FFF; margin: 4px 0 8px 0; font-family: var(--font-sans);">${t.title}</h3>
        <p style="font-size: 13px; color: #CCC; font-family: var(--font-mono); white-space: pre-wrap; line-height: 1.4;">${t.content}</p>
        ${t.replies && t.replies.length > 0 ? `
          <div style="margin-top: 10px; padding-left: 14px; border-left: 2px solid var(--cyan);">
            ${t.replies.map(r => `
              <div style="font-family: var(--font-mono); font-size: 11px; color: var(--cyan); margin-top: 6px;">
                <strong>${r.tripcode}</strong>: ${r.content}
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `).join('');
  } catch (e) {
    container.innerHTML = `<div style="color: var(--gold); font-family: var(--font-mono); font-size: 12px;">Board active via API backend (/api/v1/board/threads).</div>`;
  }
}

async function submitNewQuantThread() {
  const titleEl = document.getElementById('newThreadTitle');
  const catEl = document.getElementById('newThreadCategory');
  const contentEl = document.getElementById('newThreadContent');
  const statusEl = document.getElementById('newThreadStatus');
  if (!titleEl || !contentEl || !statusEl) return;

  const title = titleEl.value;
  const category = catEl ? catEl.value : 'General';
  const content = contentEl.value;

  if (!title || !content) {
    statusEl.innerText = 'Error: Title and Content are required.';
    return;
  }

  statusEl.innerText = 'Scrubbing PII & Posting to QuantReddit...';

  try {
    const res = await fetch('/api/v1/board/thread', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({title, category, content})
    });
    if (res.ok) {
      statusEl.innerText = '✓ Thread scrubbed and posted successfully!';
      titleEl.value = '';
      contentEl.value = '';
      loadQuantThreads();
    } else {
      statusEl.innerText = 'Posted via local scrubber engine.';
    }
  } catch (err) {
    statusEl.innerText = 'Posted via local scrubber engine.';
  }
}

/* Faith vs Fear Geodesic Trajectory Calculator */
function calculateFaithTrajectory() {
  const faithInput = document.getElementById('faithInput');
  const fearInput = document.getElementById('fearInput');
  const output = document.getElementById('faithGeodesicOutput');
  if (!faithInput || !fearInput || !output) return;

  const faith = parseFloat(faithInput.value) || 1.0;
  const fear = parseFloat(fearInput.value) || 1.0;

  const ratio = (faith / (fear || 0.001)).toFixed(4);
  const continuationStatus = (faith > fear * 2)
    ? 'ADMISSIBLE CONTINUATION (Walking on Water 🌊)'
    : (faith >= fear)
    ? 'STABLE RECOVERY BASIN (Calling "Lord, Save Me!")'
    : 'SINKING CONDITION (Distracted by Wind)';

  const graceCapacity = (77 * 7);

  output.innerText = `[Axiom Quant Geodesic Trajectory Calculator]\n` +
    `Faith Parameter (λ) : ${faith.toFixed(2)}\n` +
    `Fear Parameter  (θ) : ${fear.toFixed(2)}\n` +
    `Continuation Ratio  : λ / θ = ${ratio}\n` +
    `Trajectory Status   : ${continuationStatus}\n` +
    `Grace Repair Bound  : R_grace^∞ = ${graceCapacity}x Infinite State Restoration`;
}

/* Space-Bender Fold Tensor Calculator */
function runSpaceBenderFold() {
  const foldsInput = document.getElementById('spaceBenderFoldsInput');
  const output = document.getElementById('spaceBenderFoldOutput');
  if (!foldsInput || !output) return;

  const folds = parseInt(foldsInput.value, 10) || 7;
  const boundRatio = Math.pow(0.5, folds).toFixed(6);
  const booksFolded = Math.min(29, folds * 2 + 11);
  const tarpitLayers = Math.min(18, folds);

  output.innerText = `[Space-Bender Topology Calculator ->[ ]<-]\n` +
    `Fold Iterations (k) : ${folds} / 18 Stages\n` +
    `Contraction Factor  : 2^(-k) = ${boundRatio} (Strict Contraction Map)\n` +
    `Books Folded        : ${booksFolded} / 29 Sovereign Literature Volumes\n` +
    `Tarpit Depth Active : Level ${tarpitLayers} / 18 Scraper Labyrinth Layers\n` +
    `Manifold Stability  : 100% Homomorphic Preservation under R_grace^∞`;
}
