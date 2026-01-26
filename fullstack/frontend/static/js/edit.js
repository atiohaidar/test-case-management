/**
 * Edit page JavaScript
 */

let editingTestCase = null;

document.addEventListener('DOMContentLoaded', () => {
    loadTestCase();
});

async function loadTestCase() {
    const container = document.getElementById('edit-form-container');
    
    try {
        editingTestCase = await apiCall('/testcases/' + testCaseId + '/full');
        renderEditForm();
    } catch (error) {
        container.innerHTML = '<div class="empty-state"><h3>Error</h3><p>' + error.message + '</p><a href="/" class="btn btn-primary" style="margin-top: 1rem;">Back to List</a></div>';
    }
}

function renderEditForm() {
    const container = document.getElementById('edit-form-container');
    const tc = editingTestCase;
    
    container.innerHTML = '<form id="edit-form" onsubmit="handleEditSubmit(event)">' +
        '<div class="form-row">' +
            '<div class="form-group" style="grid-column: span 2">' +
                '<label class="form-label">Name</label>' +
                '<input type="text" class="form-input" name="name" value="' + escapeAttr(tc.name) + '" required>' +
            '</div>' +
        '</div>' +
        '<div class="form-row">' +
            '<div class="form-group">' +
                '<label class="form-label">Tags (comma-separated)</label>' +
                '<input type="text" class="form-input" name="tags" value="' + escapeAttr((tc.tags || []).join(', ')) + '">' +
            '</div>' +
            '<div class="form-group">' +
                '<label class="form-label">Type</label>' +
                '<select class="form-select" name="type">' +
                    '<option value="positive"' + (tc.type === 'positive' ? ' selected' : '') + '>Positive</option>' +
                    '<option value="negative"' + (tc.type === 'negative' ? ' selected' : '') + '>Negative</option>' +
                '</select>' +
            '</div>' +
            '<div class="form-group">' +
                '<label class="form-label">Priority</label>' +
                '<select class="form-select" name="priority">' +
                    '<option value="high"' + (tc.priority === 'high' ? ' selected' : '') + '>High</option>' +
                    '<option value="medium"' + (tc.priority === 'medium' ? ' selected' : '') + '>Medium</option>' +
                    '<option value="low"' + (tc.priority === 'low' ? ' selected' : '') + '>Low</option>' +
                '</select>' +
            '</div>' +
        '</div>' +
        '<div class="form-group">' +
            '<label class="form-label">Description</label>' +
            '<textarea class="form-textarea" name="description" rows="3" required>' + escapeHtml(tc.description) + '</textarea>' +
        '</div>' +
        
        '<div class="form-group">' +
            '<label class="form-label">Expected Result</label>' +
            '<textarea class="form-textarea" name="expectedResult" rows="2">' + escapeHtml(tc.expectedResult || '') + '</textarea>' +
        '</div>' +
        
        '<div class="steps-container">' +
            '<h3 class="steps-title">Test Steps</h3>' +
            '<div id="steps-list" class="steps-list"></div>' +
            '<button type="button" class="add-step-btn" onclick="addStep()">' +
                '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
                    '<line x1="12" y1="5" x2="12" y2="19"></line>' +
                    '<line x1="5" y1="12" x2="19" y2="12"></line>' +
                '</svg>' +
                'Add Step' +
            '</button>' +
        '</div>' +
        
        '<div id="form-error" class="form-error" style="display: none;"></div>' +
        
        '<div class="form-actions">' +
            '<button type="submit" class="btn btn-primary" id="submit-btn">' +
                '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
                    '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>' +
                    '<polyline points="17 21 17 13 7 13 7 21"></polyline>' +
                    '<polyline points="7 3 7 8 15 8"></polyline>' +
                '</svg>' +
                'Save Changes' +
            '</button>' +
        '</div>' +
    '</form>';
    
    // Initialize steps
    setSteps(tc.steps && tc.steps.length > 0 ? tc.steps : [{ step: '', expectedResult: '' }]);
}

async function handleEditSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
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
        await apiCall('/testcases/' + testCaseId, 'PATCH', data);
        window.location.href = '/detail/' + testCaseId;
    } catch (error) {
        showError('form-error', error.message);
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path></svg>Save Changes';
    }
}
