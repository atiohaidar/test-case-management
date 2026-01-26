/**
 * Common JavaScript utilities shared across all pages
 */

const API_BASE = '/api';

// ==================== THEME ====================
function initTheme() {
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = stored || (prefersDark ? 'dark' : 'light');
    setTheme(theme);
}

function toggleTheme() {
    const current = document.documentElement.classList.contains('theme-dark') ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('theme', next);
}

function setTheme(theme) {
    document.documentElement.classList.remove('theme-dark', 'theme-light');
    document.documentElement.classList.add('theme-' + theme);
    
    const sunIcon = document.getElementById('sun-icon');
    const moonIcon = document.getElementById('moon-icon');
    const label = document.querySelector('.theme-label');
    
    if (sunIcon && moonIcon && label) {
        if (theme === 'dark') {
            sunIcon.style.display = 'block';
            moonIcon.style.display = 'none';
            label.textContent = 'Light mode';
        } else {
            sunIcon.style.display = 'none';
            moonIcon.style.display = 'block';
            label.textContent = 'Dark mode';
        }
    }
}

// ==================== API CALLS ====================
async function apiCall(endpoint, method = 'GET', body = null) {
    const options = {
        method,
        headers: { 'Content-Type': 'application/json' },
    };
    if (body) {
        options.body = JSON.stringify(body);
    }
    
    const response = await fetch(API_BASE + endpoint, options);
    
    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(error.error || 'Request failed');
    }
    
    if (response.status === 204) return null;
    return response.json();
}

// ==================== UTILITIES ====================
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function escapeAttr(text) {
    if (!text) return '';
    return text.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function showSpinner(elementId) {
    const el = document.getElementById(elementId);
    if (el) el.style.display = 'block';
}

function hideSpinner(elementId) {
    const el = document.getElementById(elementId);
    if (el) el.style.display = 'none';
}

function showError(elementId, message) {
    const el = document.getElementById(elementId);
    if (el) {
        el.textContent = message;
        el.style.display = 'block';
    }
}

function hideError(elementId) {
    const el = document.getElementById(elementId);
    if (el) el.style.display = 'none';
}

// ==================== TEST CASE CARD RENDERING ====================
function renderTestCaseCard(tc, clickHandler = null) {
    const tags = (tc.tags || []).slice(0, 3).map(t => '<span class="badge badge-tag">' + escapeHtml(t) + '</span>').join('');
    const similarity = tc.similarity !== undefined ? '<span class="similarity-badge">~' + Math.round(tc.similarity * 100) + '%</span>' : '';
    
    const onclick = clickHandler ? 'onclick="' + clickHandler + '(\'' + tc.id + '\')"' : 'onclick="window.location.href=\'/detail/' + tc.id + '\'"';
    
    return '<div class="testcase-item animate-fade-in" ' + onclick + '>' +
        '<div class="testcase-header">' +
            '<div>' +
                '<div class="testcase-title">' + escapeHtml(tc.name) + '</div>' +
                '<div class="testcase-description">' + escapeHtml(tc.description) + '</div>' +
            '</div>' +
            similarity +
        '</div>' +
        '<div class="testcase-meta">' +
            '<span class="badge badge-type-' + tc.type + '">' + tc.type + '</span>' +
            '<span class="badge badge-priority-' + tc.priority + '">' + tc.priority + '</span>' +
            (tc.aiGenerated ? '<span class="badge badge-ai">AI Generated</span>' : '') +
            (tc.aiGenerationMethod === 'rag' ? '<span class="badge badge-rag">RAG</span>' : '') +
            tags +
        '</div>' +
    '</div>';
}

// ==================== STEPS EDITOR ====================
function renderStepsEditor(steps) {
    return steps.map((s, i) => 
        '<div class="step-item">' +
            '<span class="step-number">' + (i + 1) + '</span>' +
            '<div class="step-inputs">' +
                '<textarea class="form-textarea" name="step_' + i + '" rows="2" placeholder="Step action..." required>' + escapeHtml(s.step) + '</textarea>' +
                '<textarea class="form-textarea" name="expected_' + i + '" rows="2" placeholder="Expected result..." required>' + escapeHtml(s.expectedResult) + '</textarea>' +
            '</div>' +
            '<button type="button" class="step-remove" onclick="removeStep(' + i + ')"' + (steps.length <= 1 ? ' disabled' : '') + '>' +
                '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
                    '<polyline points="3 6 5 6 21 6"></polyline>' +
                    '<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>' +
                '</svg>' +
            '</button>' +
        '</div>'
    ).join('');
}

function getStepsFromForm() {
    const steps = [];
    let i = 0;
    while (true) {
        const stepEl = document.querySelector('[name="step_' + i + '"]');
        const expectedEl = document.querySelector('[name="expected_' + i + '"]');
        if (!stepEl) break;
        steps.push({ step: stepEl.value, expectedResult: expectedEl.value });
        i++;
    }
    return steps;
}

// Current steps for add/remove
let currentSteps = [{ step: '', expectedResult: '' }];

function addStep() {
    currentSteps = getStepsFromForm();
    currentSteps.push({ step: '', expectedResult: '' });
    document.getElementById('steps-list').innerHTML = renderStepsEditor(currentSteps);
}

function removeStep(index) {
    currentSteps = getStepsFromForm();
    if (currentSteps.length > 1) {
        currentSteps.splice(index, 1);
        document.getElementById('steps-list').innerHTML = renderStepsEditor(currentSteps);
    }
}

function setSteps(steps) {
    currentSteps = steps && steps.length > 0 ? steps : [{ step: '', expectedResult: '' }];
    const stepsListEl = document.getElementById('steps-list');
    if (stepsListEl) {
        stepsListEl.innerHTML = renderStepsEditor(currentSteps);
    }
}

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
});
