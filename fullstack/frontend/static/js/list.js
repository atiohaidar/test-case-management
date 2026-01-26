/**
 * List page JavaScript
 */

let testCases = [];
let searchTimeout = null;

document.addEventListener('DOMContentLoaded', () => {
    loadTestCases();
});

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

function renderTestCaseList(items) {
    const listEl = document.getElementById('testcase-list');
    
    if (!items || items.length === 0) {
        listEl.innerHTML = '<div class="empty-state"><h3>No Test Cases Found</h3><p>Create your first test case to get started.</p><a href="/create" class="btn btn-primary" style="margin-top: 1rem;">Create Test Case</a></div>';
        return;
    }
    
    listEl.innerHTML = items.map(tc => renderTestCaseCard(tc)).join('');
}

function handleQuickSearch(query) {
    if (searchTimeout) clearTimeout(searchTimeout);
    
    const spinner = document.getElementById('search-spinner');
    const infoEl = document.getElementById('search-info');
    
    if (!query.trim()) {
        hideSpinner('search-spinner');
        infoEl.style.display = 'none';
        renderTestCaseList(testCases);
        return;
    }
    
    showSpinner('search-spinner');
    
    searchTimeout = setTimeout(async () => {
        try {
            const results = await apiCall('/testcases/search?query=' + encodeURIComponent(query) + '&minSimilarity=0.1&limit=20');
            hideSpinner('search-spinner');
            infoEl.style.display = 'block';
            infoEl.textContent = 'Showing ' + results.length + ' semantic search results for "' + query + '"';
            renderTestCaseList(results.map(r => ({ ...r.testCase, similarity: r.similarity })));
        } catch (error) {
            hideSpinner('search-spinner');
            console.error('Search error:', error);
        }
    }, 500);
}
