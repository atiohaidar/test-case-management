/**
 * Create Manual page JavaScript
 */

let derivedFrom = null;
let nameSearchTimeout = null;

document.addEventListener('DOMContentLoaded', () => {
    // Initialize steps
    setSteps([{ step: '', expectedResult: '' }]);
    
    // Check for template in URL params
    const urlParams = new URLSearchParams(window.location.search);
    const templateId = urlParams.get('template');
    if (templateId) {
        loadTemplate(templateId);
    }
});

async function loadTemplate(id) {
    try {
        const tc = await apiCall('/testcases/' + id + '/full');
        derivedFrom = { id: tc.id, name: tc.name };
        
        // Fill form with template data
        const form = document.getElementById('manual-form');
        form.querySelector('[name="name"]').value = tc.name + ' (Copy)';
        form.querySelector('[name="description"]').value = tc.description;
        form.querySelector('[name="type"]').value = tc.type;
        form.querySelector('[name="priority"]').value = tc.priority;
        form.querySelector('[name="tags"]').value = (tc.tags || []).join(', ');
        form.querySelector('[name="expectedResult"]').value = tc.expectedResult || '';
        
        setSteps(tc.steps && tc.steps.length > 0 ? tc.steps : [{ step: '', expectedResult: '' }]);
        
        // Show derived from badge
        const badge = document.getElementById('derived-from-badge');
        badge.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path></svg>Derived from: <strong>' + escapeHtml(derivedFrom.name) + '</strong>';
        badge.style.display = 'flex';
        
        document.getElementById('form-title-text').textContent = 'Create from Template';
    } catch (e) {
        console.error('Template load error:', e);
    }
}

function handleNameInput(value) {
    if (nameSearchTimeout) clearTimeout(nameSearchTimeout);
    if (!value.trim() || derivedFrom) {
        document.getElementById('name-search-results').innerHTML = '';
        return;
    }
    
    nameSearchTimeout = setTimeout(async () => {
        try {
            const results = await apiCall('/testcases/search?query=' + encodeURIComponent(value) + '&minSimilarity=0.3&limit=5');
            if (results.length > 0) {
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
    window.location.href = '/create/manual?template=' + id;
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
        expectedResult: form.querySelector('[name="expectedResult"]').value || form.querySelector('[name="description"]').value,
    };
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<div class="spinner" style="position: static; transform: none;"></div>Saving...';
    hideError('form-error');
    
    try {
        if (derivedFrom) {
            await apiCall('/testcases/derive/' + derivedFrom.id, 'POST', data);
        } else {
            await apiCall('/testcases', 'POST', data);
        }
        window.location.href = '/';
    } catch (error) {
        showError('form-error', error.message);
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path></svg>Create Test Case';
    }
}
