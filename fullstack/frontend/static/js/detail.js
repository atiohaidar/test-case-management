/**
 * Detail page JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
    loadTestCaseDetail();
});

async function loadTestCaseDetail() {
    const container = document.getElementById('detail-container');
    
    try {
        const tc = await apiCall('/testcases/' + testCaseId + '/full');
        renderDetail(tc);
    } catch (error) {
        container.innerHTML = '<div class="empty-state"><h3>Error</h3><p>' + error.message + '</p><a href="/" class="btn btn-primary" style="margin-top: 1rem;">Back to List</a></div>';
    }
}

function renderDetail(tc) {
    const container = document.getElementById('detail-container');
    
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
    
    container.innerHTML = '<div class="detail-header">' +
        '<div class="detail-header-left">' +
            '<a href="/" class="back-link"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>Back to List</a>' +
            '<h1 class="detail-title">' + escapeHtml(tc.name) + '</h1>' +
            '<div class="detail-badges">' +
                '<span class="badge badge-type-' + tc.type + '">' + tc.type + '</span>' +
                '<span class="badge badge-priority-' + tc.priority + '">' + tc.priority + '</span>' +
                (tc.aiGenerated ? '<span class="badge badge-ai">AI Generated</span>' : '') +
                tags +
            '</div>' +
        '</div>' +
        '<div class="detail-actions">' +
            '<a href="/edit/' + tc.id + '" class="btn btn-secondary"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>Edit</a>' +
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
    '</div>';
}

function renderReferenceItem(ref, type) {
    const item = type === 'target' ? ref.target : ref.source;
    const typeClass = ref.referenceType === 'manual' ? 'manual' : ref.referenceType === 'rag_retrieval' ? 'rag' : 'semantic';
    const typeLabel = ref.referenceType === 'manual' ? 'Manual' : ref.referenceType === 'rag_retrieval' ? 'RAG' : 'SS';
    
    return '<a href="/detail/' + item.id + '" class="reference-item">' +
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
    '</a>';
}

async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this test case? This action cannot be undone.')) {
        return;
    }
    
    try {
        await apiCall('/testcases/' + id, 'DELETE');
        window.location.href = '/';
    } catch (e) {
        alert('Failed to delete: ' + e.message);
    }
}
