/* ==========================================================================
   AXIOM QUANT — RESEARCH PORTAL INTERACTION ENGINE
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Initial paper typesetting
    if (window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise();
    }
});

/* Tab Switching between Monograph Papers */
function loadPaper(paperId) {
    // Update nav items
    const navItems = document.querySelectorAll('.paper-nav-item');
    navItems.forEach(item => {
        if (item.getAttribute('data-paper') === paperId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // Update paper content view
    const paperViews = document.querySelectorAll('.paper-content');
    paperViews.forEach(view => {
        if (view.id === `paper-${paperId}`) {
            view.classList.add('active');
        } else {
            view.classList.remove('active');
        }
    });

    // Update breadcrumb
    const breadcrumb = document.getElementById('paperBreadcrumb');
    if (breadcrumb) {
        const titles = {
            'concept-map': 'MONOGRAPH // 01 // CONCEPT MAP',
            'ultramarathon': 'MONOGRAPH // 02 // THE ULTRAMARATHON',
            'dyadic-ternary': 'MONOGRAPH // 03 // DYADIC-TERNARY BRIDGE',
            'microstructure-chaos': 'MONOGRAPH // 04 // MICROSTRUCTURE & CHAOS',
            'transfer-operator': 'MONOGRAPH // 05 // TRANSFER OPERATOR',
            'black-scholes': 'MONOGRAPH // 06 // BLACK-SCHOLES GREEKS',
            'bibliography': 'CATALOG // FOUNDATIONAL BIBLIOGRAPHY'
        };
        breadcrumb.innerText = titles[paperId] || 'MONOGRAPH // RESEARCH';
    }

    // Scroll to top of content
    const content = document.querySelector('.portal-content');
    if (content) content.scrollTop = 0;

    // Trigger MathJax re-typeset for new tab
    if (window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise();
    }
}

/* Real-time Paper & Concept Filtering */
function filterPapers() {
    const query = document.getElementById('paperSearch').value.toLowerCase();
    const navItems = document.querySelectorAll('.paper-nav-item');

    navItems.forEach(item => {
        const title = item.querySelector('.p-title').innerText.toLowerCase();
        const sub = item.querySelector('.p-sub').innerText.toLowerCase();
        
        if (title.includes(query) || sub.includes(query)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}
