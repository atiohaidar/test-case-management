/**
 * Semantic Search page JavaScript
 */

let semanticSearchTimeout = null;

async function handleSemanticSearch(query) {
    if (semanticSearchTimeout) clearTimeout(semanticSearchTimeout);

    const spinner = document.getElementById('semantic-spinner');
    const resultsEl = document.getElementById('semantic-results');

    if (!query.trim()) {
        resultsEl.innerHTML = '';
        return;
    }

    showSpinner('semantic-spinner');

    semanticSearchTimeout = setTimeout(async () => {
        try {
            const results = await apiCall('/testcases/search?query=' + encodeURIComponent(query) + '&minSimilarity=0.1&limit=10');
            hideSpinner('semantic-spinner');

            if (results.length === 0) {
                resultsEl.innerHTML = '<div class="empty-state"><h3>No Results</h3><p>No similar test cases found. Try a different search term.</p></div>';
                return;
            }

            resultsEl.innerHTML = '<p style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 1rem;">Found ' + results.length + ' similar test cases. Click to use as template:</p>' +
                '<div class="testcase-list">' +
                results.map(r => renderTestCaseCard({ ...r.testCase, similarity: r.similarity }, 'selectTemplate')).join('') +
                '</div>';
        } catch (e) {
            hideSpinner('semantic-spinner');
            resultsEl.innerHTML = '<div class="empty-state"><h3>Error</h3><p>' + e.message + '</p></div>';
        }
    }, 500);
}

function selectTemplate(id) {
    window.location.href = '/create/manual?template=' + id;
}
