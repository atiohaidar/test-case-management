/**
 * Create Bulk page JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
    loadBulkSample();
});

function loadBulkSample() {
    const sampleJson = JSON.stringify([
        {
            name: "Login with valid credentials",
            description: "Test user login with valid email and password",
            type: "positive",
            priority: "high",
            steps: [
                { step: "Navigate to login page", expectedResult: "Login form is displayed" },
                { step: "Enter valid email", expectedResult: "Email field accepts input" },
                { step: "Enter valid password", expectedResult: "Password field accepts input" },
                { step: "Click login button", expectedResult: "User is redirected to dashboard" }
            ],
            expectedResult: "User successfully logged in",
            tags: ["login", "authentication"]
        },
        {
            name: "Login with invalid password",
            description: "Test user login with invalid password",
            type: "negative",
            priority: "medium",
            steps: [
                { step: "Navigate to login page", expectedResult: "Login form is displayed" },
                { step: "Enter valid email", expectedResult: "Email field accepts input" },
                { step: "Enter invalid password", expectedResult: "Password field accepts input" },
                { step: "Click login button", expectedResult: "Error message is displayed" }
            ],
            expectedResult: "Login fails with appropriate error message",
            tags: ["login", "authentication", "error-handling"]
        }
    ], null, 2);
    
    document.getElementById('bulk-json').value = sampleJson;
}

async function handleBulkSubmit() {
    const jsonInput = document.getElementById('bulk-json').value;
    const errorEl = document.getElementById('bulk-error');
    const resultsEl = document.getElementById('bulk-results');
    const submitBtn = document.getElementById('bulk-submit-btn');
    
    hideError('bulk-error');
    resultsEl.style.display = 'none';
    
    // Parse JSON
    let testCases;
    try {
        testCases = JSON.parse(jsonInput);
        if (!Array.isArray(testCases)) {
            throw new Error('Input must be a JSON array');
        }
        if (testCases.length === 0) {
            throw new Error('Array cannot be empty');
        }
    } catch (e) {
        showError('bulk-error', 'Invalid JSON: ' + e.message);
        return;
    }
    
    // Validate each test case
    for (let i = 0; i < testCases.length; i++) {
        const tc = testCases[i];
        if (!tc.name || !tc.description) {
            showError('bulk-error', 'Test case at index ' + i + ' is missing required fields (name, description)');
            return;
        }
    }
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<div class="spinner" style="position: static; transform: none;"></div>Creating ' + testCases.length + ' test cases...';
    
    try {
        const result = await apiCall('/testcases/bulk', 'POST', { testCases: testCases });
        
        // Show results
        resultsEl.innerHTML = '<div style="padding: 1rem; background-color: var(--bg-element); border-radius: 0.5rem; margin-top: 1rem;">' +
            '<h3 style="color: var(--text-primary); margin-bottom: 0.5rem;">Bulk Create Results</h3>' +
            '<p style="color: var(--text-secondary);">Total: <strong>' + result.total + '</strong> | ' +
            '<span style="color: var(--success);">Success: ' + result.successCount + '</span> | ' +
            '<span style="color: var(--error);">Failed: ' + result.failureCount + '</span></p>' +
            (result.failureCount > 0 ? '<div style="margin-top: 0.5rem;">' +
                result.results.filter(r => !r.success).map(r => 
                    '<p style="color: var(--error); font-size: 0.875rem;">❌ ' + escapeHtml(r.name || 'Unknown') + ': ' + escapeHtml(r.error) + '</p>'
                ).join('') +
            '</div>' : '') +
            '<a href="/" class="btn btn-primary" style="margin-top: 1rem;">View All Test Cases</a>' +
        '</div>';
        resultsEl.style.display = 'block';
        
    } catch (error) {
        showError('bulk-error', 'Failed to create test cases: ' + error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path></svg>Create All Test Cases';
    }
}
