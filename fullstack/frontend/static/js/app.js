/**
 * AI Test Case Manager - Fullstack Frontend Application
 * A vanilla JavaScript single-page application for test case management
 */

// ==================== API BASE URL ====================
const API_BASE = '/api';

// ==================== STATE ====================
let currentView = 'list';
let testCases = [];
let searchResults = null;
let searchTimeout = null;
let currentTestCaseId = null;
let editingTestCase = null;
let derivedFrom = null;
let aiPreview = null;

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    loadTestCases();
});

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

// ==================== NAVIGATION ====================
function navigateTo(view, data) {
    // Hide all views
    document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
    
    // Show create button only on list view
    const createBtn = document.getElementById('create-btn');
    createBtn.style.display = view === 'list' ? 'flex' : 'none';
    
    currentView = view;
    
    switch (view) {
        case 'list':
            document.getElementById('view-list').style.display = 'block';
            loadTestCases();
            break;
        case 'detail':
            document.getElementById('view-detail').style.display = 'block';
            currentTestCaseId = data;
            loadTestCaseDetail(data);
            break;
        case 'create-choice':
            document.getElementById('view-create-choice').style.display = 'block';
            break;
        case 'create-manual':
            document.getElementById('view-create-manual').style.display = 'block';
            editingTestCase = null;
            derivedFrom = null;
            renderManualForm();
            break;
        case 'create-semantic-search':
            document.getElementById('view-create-semantic-search').style.display = 'block';
            derivedFrom = null;
            renderSemanticSearchForm();
            break;
        case 'create-ai':
            document.getElementById('view-create-ai').style.display = 'block';
            aiPreview = null;
            renderAIForm();
            break;
        case 'edit':
            document.getElementById('view-create-manual').style.display = 'block';
            editingTestCase = data;
            derivedFrom = null;
            renderManualForm();
            break;
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

async function loadTestCases() {
    const listEl = document.getElementById('testcase-list');
    listEl.innerHTML = '<div class="loading">Loading test cases...</div>';
    
    try {
        testCases = await apiCall('/testcases');
        renderTestCaseList(testCases);
    } catch (error) {
        listEl.innerHTML = '<div class="empty-state"><h3>Error</h3><p>' + error.message + '</p></div>';
    }
}

async function loadTestCaseDetail(id) {
    const detailEl = document.getElementById('view-detail');
    detailEl.innerHTML = '<div class="loading">Loading details...</div>';
    
    try {
        const testCase = await apiCall('/testcases/' + id + '/full');
        renderTestCaseDetail(testCase);
    } catch (error) {
        detailEl.innerHTML = '<div class="empty-state"><h3>Error</h3><p>' + error.message + '</p></div>';
    }
}

// ==================== SEARCH ====================
function handleSearch(query) {
    if (searchTimeout) clearTimeout(searchTimeout);
    
    const spinner = document.getElementById('search-spinner');
    const infoEl = document.getElementById('search-info');
    
    if (!query.trim()) {
        spinner.style.display = 'none';
        infoEl.style.display = 'none';
        searchResults = null;
        renderTestCaseList(testCases);
        return;
    }
    
    spinner.style.display = 'block';
    
    searchTimeout = setTimeout(async () => {
        try {
            searchResults = await apiCall('/testcases/search?query=' + encodeURIComponent(query) + '&minSimilarity=0.1&limit=20');
            spinner.style.display = 'none';
            infoEl.style.display = 'block';
            infoEl.textContent = 'Showing ' + searchResults.length + ' semantic search results for "' + query + '"';
            renderTestCaseList(searchResults.map(r => ({ ...r.testCase, similarity: r.similarity })));
        } catch (error) {
            spinner.style.display = 'none';
            console.error('Search error:', error);
        }
    }, 500);
}

// ==================== RENDER FUNCTIONS ====================
function renderTestCaseList(items) {
    const listEl = document.getElementById('testcase-list');
    
    if (!items || items.length === 0) {
        listEl.innerHTML = '<div class="empty-state"><h3>No Test Cases Found</h3><p>Create your first test case to get started.</p></div>';
        return;
    }
    
    listEl.innerHTML = items.map(tc => {
        const tags = (tc.tags || []).slice(0, 3).map(t => '<span class="badge badge-tag">' + escapeHtml(t) + '</span>').join('');
        const similarity = tc.similarity !== undefined ? '<span class="similarity-badge">~' + Math.round(tc.similarity * 100) + '%</span>' : '';
        
        return '<div class="testcase-item animate-fade-in" onclick="navigateTo(\'detail\', \'' + tc.id + '\')">' +
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
    }).join('');
}

function renderTestCaseDetail(tc) {
    const detailEl = document.getElementById('view-detail');
    
    const tags = (tc.tags || []).map(t => '<span class="badge badge-tag">' + escapeHtml(t) + '</span>').join('');
    const steps = (tc.steps || []).map((s, i) => 
        '<div class="step-detail">' +
            '<span class="step-action">' + (i + 1) + '. ' + escapeHtml(s.step) + '</span>' +
            '<div class="step-expected"><strong>Expected:</strong> ' + escapeHtml(s.expectedResult) + '</div>' +
        '</div>'
    ).join('');
    
    const references = (tc.references || []).map(ref => renderReferenceItem(ref, 'target')).join('');
    const referencedBy = (tc.referencedBy || []).concat((tc.derivedTestCases || []).map(d => ({
        id: d.referenceInfo.id,
        sourceId: d.id,
        similarityScore: d.referenceInfo.similarityScore,
        referenceType: d.referenceInfo.referenceType,
        source: { id: d.id, name: d.name, type: d.type, priority: d.priority }
    }))).map(ref => renderReferenceItem(ref, 'source')).join('');
    
    let aiDetails = '';
    if (tc.aiGenerated) {
        const tokenInfo = tc.tokenUsage ? 
            '<div class="ai-detail-item"><span class="ai-detail-label">Total Tokens:</span><span class="ai-detail-value">' + 
            (tc.tokenUsage.total_token_count || tc.tokenUsage.totalTokens || 0) + '</span></div>' : '';
        
        aiDetails = '<div class="detail-section">' +
            '<h2 class="detail-section-title"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>AI Generation Details</h2>' +
            '<div class="ai-details">' +
                '<div class="ai-details-grid">' +
                    '<div class="ai-detail-item"><span class="ai-detail-label">Method:</span><span class="ai-detail-value">' + (tc.aiGenerationMethod || 'N/A') + '</span></div>' +
                    (tc.aiConfidence ? '<div class="ai-detail-item"><span class="ai-detail-label">Confidence:</span><span class="ai-detail-value">' + Math.round(tc.aiConfidence * 100) + '%</span></div>' : '') +
                    tokenInfo +
                '</div>' +
                (tc.originalPrompt ? '<div><span class="ai-detail-label">Original Prompt:</span><div class="ai-prompt">' + escapeHtml(tc.originalPrompt) + '</div></div>' : '') +
                (tc.aiSuggestions ? '<div style="margin-top: 0.75rem"><span class="ai-detail-label">AI Suggestions:</span><p style="color: var(--text-secondary); font-style: italic; margin-top: 0.25rem">"' + escapeHtml(tc.aiSuggestions) + '"</p></div>' : '') +
            '</div>' +
        '</div>';
    }
    
    detailEl.innerHTML = '<div class="detail-container animate-fade-in">' +
        '<div class="detail-header">' +
            '<div class="detail-header-left">' +
                '<button class="back-link" onclick="navigateTo(\'list\')"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>Back to List</button>' +
                '<h1 class="detail-title">' + escapeHtml(tc.name) + '</h1>' +
                '<div class="detail-badges">' +
                    '<span class="badge badge-type-' + tc.type + '">' + tc.type + '</span>' +
                    '<span class="badge badge-priority-' + tc.priority + '">' + tc.priority + '</span>' +
                    (tc.aiGenerated ? '<span class="badge badge-ai">AI Generated</span>' : '') +
                    tags +
                '</div>' +
            '</div>' +
            '<div class="detail-actions">' +
                '<button class="btn btn-secondary" onclick="handleEdit(\'' + tc.id + '\')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>Edit</button>' +
                '<button class="btn btn-danger" onclick="handleDelete(\'' + tc.id + '\')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>Delete</button>' +
            '</div>' +
        '</div>' +
        
        '<p class="detail-description">' + escapeHtml(tc.description) + '</p>' +
        
        aiDetails +
        
        '<div class="detail-section">' +
            '<h2 class="detail-section-title"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>Test Steps</h2>' +
            '<div class="steps-list-detail">' + (steps || '<p class="no-references">No steps defined.</p>') + '</div>' +
        '</div>' +
        
        '<div class="references-grid">' +
            '<div class="detail-section">' +
                '<h2 class="detail-section-title"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>References (' + (tc.referencesCount || 0) + ')</h2>' +
                '<div class="references-section">' + (references || '<p class="no-references">This test case does not reference any others.</p>') + '</div>' +
            '</div>' +
            '<div class="detail-section">' +
                '<h2 class="detail-section-title"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 7h3a5 5 0 0 1 5 5 5 5 0 0 1-5 5h-3m-6 0H6a5 5 0 0 1-5-5 5 5 0 0 1 5-5h3"></path><line x1="8" y1="12" x2="16" y2="12"></line></svg>Referenced By (' + ((tc.referencedBy?.length || 0) + (tc.derivedTestCases?.length || 0)) + ')</h2>' +
                '<div class="references-section">' + (referencedBy || '<p class="no-references">No other test cases reference this one.</p>') + '</div>' +
            '</div>' +
        '</div>' +
    '</div>';
}

function renderReferenceItem(ref, type) {
    const item = type === 'target' ? ref.target : ref.source;
    const typeClass = ref.referenceType === 'manual' ? 'manual' : ref.referenceType === 'rag_retrieval' ? 'rag' : 'semantic';
    const typeLabel = ref.referenceType === 'manual' ? 'Manual' : ref.referenceType === 'rag_retrieval' ? 'RAG' : 'SS';
    
    return '<div class="reference-item">' +
        '<div>' +
            '<div class="reference-name">' + escapeHtml(item.name) + '</div>' +
            '<div class="reference-meta">' +
                '<span class="badge badge-type-' + item.type + '">' + item.type + '</span>' +
                '<span class="badge badge-priority-' + item.priority + '">' + item.priority + '</span>' +
            '</div>' +
        '</div>' +
        '<div style="display: flex; align-items: center; gap: 0.5rem;">' +
            (ref.similarityScore ? '<span class="similarity-badge">' + Math.round(ref.similarityScore * 100) + '%</span>' : '') +
            '<span class="reference-type-badge reference-type-' + typeClass + '">' + typeLabel + '</span>' +
        '</div>' +
    '</div>';
}

// ==================== MANUAL FORM ====================
function renderManualForm() {
    const container = document.getElementById('view-create-manual');
    const isEditing = !!editingTestCase;
    const data = editingTestCase || { name: '', description: '', type: 'positive', priority: 'medium', steps: [{ step: '', expectedResult: '' }], expectedResult: '', tags: [] };
    
    container.innerHTML = '<div class="form-container animate-fade-in">' +
        '<div class="form-header">' +
            '<h1 class="form-title"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>' + (isEditing ? 'Edit Test Case' : 'Create Manual Test Case') + '</h1>' +
            '<button class="back-link" onclick="navigateTo(\'' + (isEditing ? 'detail\', \'' + editingTestCase.id : 'create-choice') + '\')"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>Cancel</button>' +
        '</div>' +
        
        '<form id="manual-form" onsubmit="handleManualSubmit(event)">' +
            '<div class="form-row">' +
                '<div class="form-group" style="grid-column: span 2">' +
                    '<label class="form-label">Name</label>' +
                    '<input type="text" class="form-input" name="name" value="' + escapeAttr(data.name) + '" required oninput="handleNameInput(this.value)">' +
                    '<div id="name-search-results"></div>' +
                    (derivedFrom ? '<div class="derived-from-badge"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path></svg>Derived from: <strong>' + escapeHtml(derivedFrom.name) + '</strong></div>' : '') +
                '</div>' +
            '</div>' +
            '<div class="form-row">' +
                '<div class="form-group">' +
                    '<label class="form-label">Tags (comma-separated)</label>' +
                    '<input type="text" class="form-input" name="tags" value="' + escapeAttr((data.tags || []).join(', ')) + '">' +
                '</div>' +
                '<div class="form-group">' +
                    '<label class="form-label">Type</label>' +
                    '<select class="form-select" name="type">' +
                        '<option value="positive"' + (data.type === 'positive' ? ' selected' : '') + '>Positive</option>' +
                        '<option value="negative"' + (data.type === 'negative' ? ' selected' : '') + '>Negative</option>' +
                    '</select>' +
                '</div>' +
                '<div class="form-group">' +
                    '<label class="form-label">Priority</label>' +
                    '<select class="form-select" name="priority">' +
                        '<option value="high"' + (data.priority === 'high' ? ' selected' : '') + '>High</option>' +
                        '<option value="medium"' + (data.priority === 'medium' ? ' selected' : '') + '>Medium</option>' +
                        '<option value="low"' + (data.priority === 'low' ? ' selected' : '') + '>Low</option>' +
                    '</select>' +
                '</div>' +
            '</div>' +
            '<div class="form-group">' +
                '<label class="form-label">Description</label>' +
                '<textarea class="form-textarea" name="description" rows="3" required>' + escapeHtml(data.description) + '</textarea>' +
            '</div>' +
            
            '<div class="steps-container">' +
                '<h3 class="steps-title">Test Steps</h3>' +
                '<div id="steps-list" class="steps-list">' + renderStepsEditor(data.steps) + '</div>' +
                '<button type="button" class="add-step-btn" onclick="addStep()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>Add Step</button>' +
            '</div>' +
            
            '<div id="form-error" class="form-error" style="display: none;"></div>' +
            
            '<div class="form-actions">' +
                '<button type="submit" class="btn btn-primary" id="submit-btn"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>' + (isEditing ? 'Save Changes' : 'Create Test Case') + '</button>' +
            '</div>' +
        '</form>' +
    '</div>';
}

function renderStepsEditor(steps) {
    return steps.map((s, i) => 
        '<div class="step-item">' +
            '<span class="step-number">' + (i + 1) + '</span>' +
            '<div class="step-inputs">' +
                '<textarea class="form-textarea" name="step_' + i + '" rows="2" placeholder="Step action..." required>' + escapeHtml(s.step) + '</textarea>' +
                '<textarea class="form-textarea" name="expected_' + i + '" rows="2" placeholder="Expected result..." required>' + escapeHtml(s.expectedResult) + '</textarea>' +
            '</div>' +
            '<button type="button" class="step-remove" onclick="removeStep(' + i + ')"' + (steps.length <= 1 ? ' disabled' : '') + '><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>' +
        '</div>'
    ).join('');
}

function addStep() {
    const stepsList = document.getElementById('steps-list');
    const currentSteps = getStepsFromForm();
    currentSteps.push({ step: '', expectedResult: '' });
    stepsList.innerHTML = renderStepsEditor(currentSteps);
}

function removeStep(index) {
    const currentSteps = getStepsFromForm();
    if (currentSteps.length > 1) {
        currentSteps.splice(index, 1);
        document.getElementById('steps-list').innerHTML = renderStepsEditor(currentSteps);
    }
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

let nameSearchTimeout = null;
function handleNameInput(value) {
    if (nameSearchTimeout) clearTimeout(nameSearchTimeout);
    if (!value.trim() || editingTestCase) {
        document.getElementById('name-search-results').innerHTML = '';
        return;
    }
    
    nameSearchTimeout = setTimeout(async () => {
        try {
            const results = await apiCall('/testcases/search?query=' + encodeURIComponent(value) + '&minSimilarity=0.3&limit=5');
            if (results.length > 0 && !derivedFrom) {
                document.getElementById('name-search-results').innerHTML = '<div class="search-results-container">' +
                    '<p style="font-size: 0.75rem; color: var(--text-muted); padding: 0.5rem;">Similar existing test cases:</p>' +
                    results.map(r => 
                        '<div class="search-result-item">' +
                            '<div class="search-result-info">' +
                                '<div class="search-result-name">' + escapeHtml(r.testCase.name) + '</div>' +
                                '<div class="search-result-meta">' +
                                    '<span class="badge badge-type-' + r.testCase.type + '">' + r.testCase.type + '</span>' +
                                    '<span class="badge badge-priority-' + r.testCase.priority + '">' + r.testCase.priority + '</span>' +
                                    '<span class="similarity-badge">~' + Math.round(r.similarity * 100) + '%</span>' +
                                '</div>' +
                            '</div>' +
                            '<button type="button" class="btn btn-primary" style="padding: 0.25rem 0.75rem; font-size: 0.75rem;" onclick="useAsTemplate(\'' + r.testCase.id + '\')">Use</button>' +
                        '</div>'
                    ).join('') +
                '</div>';
            } else {
                document.getElementById('name-search-results').innerHTML = '';
            }
        } catch (e) {
            console.error('Name search error:', e);
        }
    }, 500);
}

async function useAsTemplate(id) {
    try {
        const tc = await apiCall('/testcases/' + id + '/full');
        derivedFrom = { id: tc.id, name: tc.name };
        editingTestCase = null;
        
        // Re-render form with template data
        const form = document.getElementById('manual-form');
        form.querySelector('[name="name"]').value = tc.name + ' (Copy)';
        form.querySelector('[name="description"]').value = tc.description;
        form.querySelector('[name="type"]').value = tc.type;
        form.querySelector('[name="priority"]').value = tc.priority;
        form.querySelector('[name="tags"]').value = (tc.tags || []).join(', ');
        document.getElementById('steps-list').innerHTML = renderStepsEditor(tc.steps.length ? tc.steps : [{ step: '', expectedResult: '' }]);
        document.getElementById('name-search-results').innerHTML = '<div class="derived-from-badge"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path></svg>Derived from: <strong>' + escapeHtml(derivedFrom.name) + '</strong></div>';
    } catch (e) {
        console.error('Template load error:', e);
    }
}

async function handleManualSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const errorEl = document.getElementById('form-error');
    const submitBtn = document.getElementById('submit-btn');
    
    const data = {
        name: form.querySelector('[name="name"]').value,
        description: form.querySelector('[name="description"]').value,
        type: form.querySelector('[name="type"]').value,
        priority: form.querySelector('[name="priority"]').value,
        tags: form.querySelector('[name="tags"]').value.split(',').map(t => t.trim()).filter(Boolean),
        steps: getStepsFromForm(),
        expectedResult: form.querySelector('[name="description"]').value,
    };
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<div class="spinner" style="position: static; transform: none;"></div>Saving...';
    errorEl.style.display = 'none';
    
    try {
        if (editingTestCase) {
            await apiCall('/testcases/' + editingTestCase.id, 'PATCH', data);
        } else if (derivedFrom) {
            await apiCall('/testcases/derive/' + derivedFrom.id, 'POST', data);
        } else {
            await apiCall('/testcases', 'POST', data);
        }
        navigateTo('list');
    } catch (error) {
        errorEl.textContent = error.message;
        errorEl.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path></svg>' + (editingTestCase ? 'Save Changes' : 'Create Test Case');
    }
}

// ==================== SEMANTIC SEARCH FORM ====================
function renderSemanticSearchForm() {
    const container = document.getElementById('view-create-semantic-search');
    
    container.innerHTML = '<div class="form-container animate-fade-in">' +
        '<div class="form-header">' +
            '<h1 class="form-title"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>Create from Semantic Search</h1>' +
            '<button class="back-link" onclick="navigateTo(\'create-choice\')"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>Back</button>' +
        '</div>' +
        
        '<div class="form-group">' +
            '<label class="form-label">Search for similar test cases</label>' +
            '<div style="position: relative;">' +
                '<input type="text" class="form-input" id="semantic-search-input" placeholder="Type to search..." oninput="handleSemanticSearch(this.value)">' +
                '<div id="semantic-spinner" class="spinner" style="display: none;"></div>' +
            '</div>' +
        '</div>' +
        
        '<div id="semantic-results"></div>' +
    '</div>';
}

let semanticSearchTimeout = null;
async function handleSemanticSearch(query) {
    if (semanticSearchTimeout) clearTimeout(semanticSearchTimeout);
    
    const spinner = document.getElementById('semantic-spinner');
    const resultsEl = document.getElementById('semantic-results');
    
    if (!query.trim()) {
        resultsEl.innerHTML = '';
        return;
    }
    
    spinner.style.display = 'block';
    
    semanticSearchTimeout = setTimeout(async () => {
        try {
            const results = await apiCall('/testcases/search?query=' + encodeURIComponent(query) + '&minSimilarity=0.1&limit=10');
            spinner.style.display = 'none';
            
            if (results.length === 0) {
                resultsEl.innerHTML = '<div class="empty-state"><h3>No Results</h3><p>No similar test cases found. Try a different search term.</p></div>';
                return;
            }
            
            resultsEl.innerHTML = '<p style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 1rem;">Found ' + results.length + ' similar test cases. Click to use as template:</p>' +
                '<div class="testcase-list">' +
                results.map(r => 
                    '<div class="testcase-item" onclick="selectSemanticTemplate(\'' + r.testCase.id + '\')">' +
                        '<div class="testcase-header">' +
                            '<div>' +
                                '<div class="testcase-title">' + escapeHtml(r.testCase.name) + '</div>' +
                                '<div class="testcase-description">' + escapeHtml(r.testCase.description) + '</div>' +
                            '</div>' +
                            '<span class="similarity-badge">~' + Math.round(r.similarity * 100) + '%</span>' +
                        '</div>' +
                        '<div class="testcase-meta">' +
                            '<span class="badge badge-type-' + r.testCase.type + '">' + r.testCase.type + '</span>' +
                            '<span class="badge badge-priority-' + r.testCase.priority + '">' + r.testCase.priority + '</span>' +
                        '</div>' +
                    '</div>'
                ).join('') +
                '</div>';
        } catch (e) {
            spinner.style.display = 'none';
            resultsEl.innerHTML = '<div class="empty-state"><h3>Error</h3><p>' + e.message + '</p></div>';
        }
    }, 500);
}

async function selectSemanticTemplate(id) {
    try {
        const tc = await apiCall('/testcases/' + id + '/full');
        derivedFrom = { id: tc.id, name: tc.name };
        editingTestCase = {
            name: tc.name + ' (Copy)',
            description: tc.description,
            type: tc.type,
            priority: tc.priority,
            steps: tc.steps,
            tags: tc.tags,
        };
        navigateTo('create-manual');
    } catch (e) {
        console.error('Template load error:', e);
    }
}

// ==================== AI FORM ====================
function renderAIForm() {
    const container = document.getElementById('view-create-ai');
    
    container.innerHTML = '<div class="form-container animate-fade-in">' +
        '<div class="form-header">' +
            '<h1 class="form-title"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>Generate Test Case with AI</h1>' +
            '<button class="back-link" onclick="navigateTo(\'create-choice\')"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>Back</button>' +
        '</div>' +
        
        '<div class="form-group">' +
            '<label class="form-label">Prompt</label>' +
            '<textarea class="form-textarea" id="ai-prompt" rows="4" placeholder="e.g., \'Create a test case for a user trying to reset their password with an expired token...\'"></textarea>' +
        '</div>' +
        
        '<div class="rag-toggle">' +
            '<div class="rag-toggle-label"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>Enable RAG (Retrieval-Augmented Generation)</div>' +
            '<label class="toggle-switch"><input type="checkbox" id="use-rag" checked><span class="toggle-slider"></span></label>' +
        '</div>' +
        
        '<div class="advanced-settings">' +
            '<button type="button" class="advanced-toggle" onclick="toggleAdvanced()"><span>Advanced RAG Settings</span><svg id="advanced-chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg></button>' +
            '<div id="advanced-content" class="advanced-content">' +
                '<div class="slider-group">' +
                    '<div class="slider-header"><label class="form-label">Similarity Threshold</label><span class="slider-value" id="threshold-value">0.70</span></div>' +
                    '<input type="range" class="range-slider" id="rag-threshold" min="0" max="1" step="0.05" value="0.7" oninput="document.getElementById(\'threshold-value\').textContent = parseFloat(this.value).toFixed(2)">' +
                '</div>' +
                '<div class="form-group">' +
                    '<label class="form-label">Max RAG References</label>' +
                    '<input type="number" class="form-input" id="max-references" min="1" max="10" value="3">' +
                '</div>' +
            '</div>' +
        '</div>' +
        
        '<div id="ai-preview"></div>' +
        '<div id="ai-error" class="form-error" style="display: none;"></div>' +
        
        '<div class="form-actions">' +
            '<button type="button" class="btn btn-secondary" id="preview-btn" onclick="handleAIPreview()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>Preview</button>' +
            '<button type="button" class="btn btn-success" id="generate-save-btn" onclick="handleAIGenerateAndSave()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>Generate and Save</button>' +
        '</div>' +
    '</div>';
}

function toggleAdvanced() {
    const content = document.getElementById('advanced-content');
    const chevron = document.getElementById('advanced-chevron');
    content.classList.toggle('show');
    chevron.style.transform = content.classList.contains('show') ? 'rotate(180deg)' : '';
}

async function handleAIPreview() {
    const prompt = document.getElementById('ai-prompt').value;
    if (prompt.length < 10) {
        showAIError('Please provide a more detailed prompt (at least 10 characters).');
        return;
    }
    
    const previewBtn = document.getElementById('preview-btn');
    previewBtn.disabled = true;
    previewBtn.innerHTML = '<div class="spinner" style="position: static; transform: none;"></div>Generating...';
    hideAIError();
    
    try {
        const data = {
            prompt: prompt,
            useRAG: document.getElementById('use-rag').checked,
            ragSimilarityThreshold: parseFloat(document.getElementById('rag-threshold').value),
            maxRAGReferences: parseInt(document.getElementById('max-references').value),
        };
        
        aiPreview = await apiCall('/testcases/generate-with-ai', 'POST', data);
        renderAIPreview();
    } catch (error) {
        showAIError('Failed to generate preview. ' + error.message);
    } finally {
        previewBtn.disabled = false;
        previewBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>Preview';
    }
}

function renderAIPreview() {
    if (!aiPreview) return;
    
    const previewEl = document.getElementById('ai-preview');
    const tc = aiPreview;
    
    const ragRefs = (tc.ragReferences || []).map(ref => 
        '<div class="rag-reference-item">' +
            '<div class="rag-reference-name"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>' + escapeHtml(ref.testCase.name) + '</div>' +
            '<span class="similarity-badge">' + Math.round(ref.similarity * 100) + '% match</span>' +
        '</div>'
    ).join('');
    
    previewEl.innerHTML = '<div class="preview-container">' +
        '<h2 class="preview-title"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>AI Generated Preview</h2>' +
        '<div class="preview-content">' +
            '<div class="form-group">' +
                '<label class="form-label">Name</label>' +
                '<input type="text" class="form-input" id="preview-name" value="' + escapeAttr(tc.name) + '">' +
            '</div>' +
            '<div class="form-group">' +
                '<label class="form-label">Description</label>' +
                '<textarea class="form-textarea" id="preview-description" rows="3">' + escapeHtml(tc.description) + '</textarea>' +
            '</div>' +
            '<div class="form-row">' +
                '<div class="form-group">' +
                    '<label class="form-label">Type</label>' +
                    '<select class="form-select" id="preview-type">' +
                        '<option value="positive"' + (tc.type === 'positive' ? ' selected' : '') + '>Positive</option>' +
                        '<option value="negative"' + (tc.type === 'negative' ? ' selected' : '') + '>Negative</option>' +
                    '</select>' +
                '</div>' +
                '<div class="form-group">' +
                    '<label class="form-label">Priority</label>' +
                    '<select class="form-select" id="preview-priority">' +
                        '<option value="high"' + (tc.priority === 'high' ? ' selected' : '') + '>High</option>' +
                        '<option value="medium"' + (tc.priority === 'medium' ? ' selected' : '') + '>Medium</option>' +
                        '<option value="low"' + (tc.priority === 'low' ? ' selected' : '') + '>Low</option>' +
                    '</select>' +
                '</div>' +
            '</div>' +
            '<div class="form-group">' +
                '<label class="form-label">Expected Result</label>' +
                '<textarea class="form-textarea" id="preview-expected" rows="2">' + escapeHtml(tc.expectedResult) + '</textarea>' +
            '</div>' +
            '<div class="form-group">' +
                '<label class="form-label">Tags (comma-separated)</label>' +
                '<input type="text" class="form-input" id="preview-tags" value="' + escapeAttr((tc.tags || []).join(', ')) + '">' +
            '</div>' +
            (ragRefs ? '<div class="rag-references"><label class="form-label">RAG References Used</label>' + ragRefs + '</div>' : '') +
            (tc.confidence ? '<div style="margin-top: 1rem; font-size: 0.875rem; color: var(--text-secondary);">AI Confidence: <span style="color: var(--accent-color); font-family: monospace;">' + Math.round(tc.confidence * 100) + '%</span></div>' : '') +
        '</div>' +
        '<div class="form-actions" style="margin-top: 1rem;">' +
            '<button type="button" class="btn btn-secondary" onclick="aiPreview = null; document.getElementById(\'ai-preview\').innerHTML = \'\';">Back to Edit</button>' +
            '<button type="button" class="btn btn-primary" id="save-preview-btn" onclick="handleSavePreview()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path></svg>Save Edited Test Case</button>' +
        '</div>' +
    '</div>';
}

async function handleSavePreview() {
    if (!aiPreview) return;
    
    const saveBtn = document.getElementById('save-preview-btn');
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<div class="spinner" style="position: static; transform: none;"></div>Saving...';
    hideAIError();
    
    try {
        const prompt = document.getElementById('ai-prompt').value;
        const useRAG = document.getElementById('use-rag').checked;
        
        const data = {
            name: document.getElementById('preview-name').value,
            description: document.getElementById('preview-description').value,
            type: document.getElementById('preview-type').value,
            priority: document.getElementById('preview-priority').value,
            expectedResult: document.getElementById('preview-expected').value,
            tags: document.getElementById('preview-tags').value.split(',').map(t => t.trim()).filter(Boolean),
            steps: aiPreview.steps || [],
            aiGenerated: true,
            originalPrompt: prompt,
            aiGenerationMethod: useRAG ? 'rag' : 'pure_ai',
            aiConfidence: aiPreview.confidence,
            ragReferences: (aiPreview.ragReferences || []).map(r => ({ testCaseId: r.testCaseId, similarity: r.similarity })),
        };
        
        await apiCall('/testcases', 'POST', data);
        navigateTo('list');
    } catch (error) {
        showAIError('Failed to save test case. ' + error.message);
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path></svg>Save Edited Test Case';
    }
}

async function handleAIGenerateAndSave() {
    const prompt = document.getElementById('ai-prompt').value;
    if (prompt.length < 10) {
        showAIError('Please provide a more detailed prompt (at least 10 characters).');
        return;
    }
    
    const btn = document.getElementById('generate-save-btn');
    btn.disabled = true;
    btn.innerHTML = '<div class="spinner" style="position: static; transform: none;"></div>Generating...';
    hideAIError();
    
    try {
        const data = {
            prompt: prompt,
            useRAG: document.getElementById('use-rag').checked,
            ragSimilarityThreshold: parseFloat(document.getElementById('rag-threshold').value),
            maxRAGReferences: parseInt(document.getElementById('max-references').value),
        };
        
        await apiCall('/testcases/generate-and-save-with-ai', 'POST', data);
        navigateTo('list');
    } catch (error) {
        showAIError('Failed to generate and save. ' + error.message);
        btn.disabled = false;
        btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>Generate and Save';
    }
}

function showAIError(message) {
    const errorEl = document.getElementById('ai-error');
    errorEl.textContent = message;
    errorEl.style.display = 'block';
}

function hideAIError() {
    document.getElementById('ai-error').style.display = 'none';
}

// ==================== EDIT & DELETE ====================
async function handleEdit(id) {
    try {
        const tc = await apiCall('/testcases/' + id + '/full');
        navigateTo('edit', tc);
    } catch (e) {
        console.error('Edit load error:', e);
    }
}

async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this test case? This action cannot be undone.')) {
        return;
    }
    
    try {
        await apiCall('/testcases/' + id, 'DELETE');
        navigateTo('list');
    } catch (e) {
        alert('Failed to delete: ' + e.message);
    }
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
