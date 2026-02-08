/**
 * Create AI page JavaScript
 */

let aiPreview = null;

function toggleAdvanced() {
    const content = document.getElementById('advanced-content');
    const chevron = document.getElementById('advanced-chevron');
    content.classList.toggle('show');
    chevron.style.transform = content.classList.contains('show') ? 'rotate(180deg)' : '';
}

async function handleAIPreview() {
    const prompt = document.getElementById('ai-prompt').value;
    if (prompt.length < 10) {
        showError('ai-error', 'Please provide a more detailed prompt (at least 10 characters).');
        return;
    }

    const previewBtn = document.getElementById('preview-btn');
    previewBtn.disabled = true;
    previewBtn.innerHTML = '<div class="spinner" style="position: static; transform: none;"></div>Generating...';
    hideError('ai-error');

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
        showError('ai-error', 'Failed to generate preview. ' + error.message);
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
        '<div class="form-group">' +
        '<label class="form-label">Test Steps</label>' +
        '<div id="preview-steps-list" class="steps-list">' + renderStepsEditor(tc.steps || []) + '</div>' +
        '<button type="button" class="add-step-btn" onclick="addAIPreviewStep()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>Add Step</button>' +
        '</div>' +
        (ragRefs ? '<div class="rag-references"><label class="form-label">RAG References Used</label>' + ragRefs + '</div>' : '') +
        (tc.confidence ? '<div style="margin-top: 1rem; font-size: 0.875rem; color: var(--text-secondary);">AI Confidence: <span style="color: var(--accent-color); font-family: monospace;">' + Math.round(tc.confidence * 100) + '%</span></div>' : '') +
        '</div>' +
        '<div class="form-actions" style="margin-top: 1rem;">' +
        '<button type="button" class="btn btn-secondary" onclick="clearPreview()">Back to Edit</button>' +
        '<button type="button" class="btn btn-primary" id="save-preview-btn" onclick="handleSavePreview()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path></svg>Save Edited Test Case</button>' +
        '</div>' +
        '</div>';
}

function clearPreview() {
    aiPreview = null;
    document.getElementById('ai-preview').innerHTML = '';
}

async function handleSavePreview() {
    if (!aiPreview) return;

    const saveBtn = document.getElementById('save-preview-btn');
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<div class="spinner" style="position: static; transform: none;"></div>Saving...';
    hideError('ai-error');

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
            steps: getStepsFromForm(), // Get modified steps from preview
            aiGenerated: true,
            originalPrompt: prompt,
            aiGenerationMethod: useRAG ? 'rag' : 'pure_ai',
            aiConfidence: aiPreview.confidence,
            ragReferences: (aiPreview.ragReferences || []).map(r => ({ testCaseId: r.testCaseId, similarity: r.similarity })),
        };

        await apiCall('/testcases', 'POST', data);
        window.location.href = '/';
    } catch (error) {
        showError('ai-error', 'Failed to save test case. ' + error.message);
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path></svg>Save Edited Test Case';
    }
}

/**
 * Add a step to the AI preview editor
 */
function addAIPreviewStep() {
    const stepsList = document.getElementById('preview-steps-list');
    const steps = getStepsFromForm();
    steps.push({ step: '', expectedResult: '' });
    stepsList.innerHTML = renderStepsEditor(steps);
}

async function handleAIGenerateAndSave() {
    const prompt = document.getElementById('ai-prompt').value;
    if (prompt.length < 10) {
        showError('ai-error', 'Please provide a more detailed prompt (at least 10 characters).');
        return;
    }

    const btn = document.getElementById('generate-save-btn');
    btn.disabled = true;
    btn.innerHTML = '<div class="spinner" style="position: static; transform: none;"></div>Generating...';
    hideError('ai-error');

    try {
        const data = {
            prompt: prompt,
            useRAG: document.getElementById('use-rag').checked,
            ragSimilarityThreshold: parseFloat(document.getElementById('rag-threshold').value),
            maxRAGReferences: parseInt(document.getElementById('max-references').value),
        };

        await apiCall('/testcases/generate-and-save-with-ai', 'POST', data);
        window.location.href = '/';
    } catch (error) {
        showError('ai-error', 'Failed to generate and save. ' + error.message);
        btn.disabled = false;
        btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>Generate and Save';
    }
}
