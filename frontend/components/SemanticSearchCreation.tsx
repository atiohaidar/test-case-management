import React, { useState } from 'react';
import { SearchResult, TestCaseDetail, CreateTestCaseDto } from '../types';
import * as api from '../services/api';
import { BackIcon, SearchIcon, EditIcon, SaveIcon } from './Icons';
import { Badge, PriorityBadge, TypeBadge } from './Badge';

interface SemanticSearchCreationProps {
    onBack: () => void;
    onTestCaseCreated: (testCase: TestCaseDetail) => void;
}

const SemanticSearchCreation: React.FC<SemanticSearchCreationProps> = ({ onBack, onTestCaseCreated }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [selectedTestCase, setSelectedTestCase] = useState<SearchResult | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state for editing
    const [formData, setFormData] = useState<CreateTestCaseDto>({
        name: '',
        description: '',
        type: 'positive',
        priority: 'medium',
        steps: [{ step: '', expectedResult: '' }],
        expectedResult: '',
        tags: [],
        referenceTo: '',
        referenceType: 'semantic_search'
    });

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setLoading(true);
        setError(null);
        try {
            const results = await api.semanticSearch(searchQuery);
            setSearchResults(results);
            setSelectedTestCase(null);
            setIsEditing(false);
        } catch (err) {
            setError('Failed to search test cases');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectTestCase = (result: SearchResult) => {
        setSelectedTestCase(result);
        setFormData({
            name: result.testCase.name,
            description: result.testCase.description,
            type: result.testCase.type,
            priority: result.testCase.priority,
            steps: [{ step: '', expectedResult: '' }], // Will be filled when editing
            expectedResult: '',
            tags: [...result.testCase.tags],
            referenceTo: result.testCase.id,
            referenceType: 'semantic_search'
        });
    };

    const handleEdit = async () => {
        if (!selectedTestCase) return;

        try {
            // Fetch full test case details to get steps
            const fullTestCase = await api.fetchTestCaseDetail(selectedTestCase.testCase.id);
            setFormData(prev => ({
                ...prev,
                steps: fullTestCase.steps,
                expectedResult: fullTestCase.expectedResult
            }));
            setIsEditing(true);
        } catch (err) {
            setError('Failed to load test case details');
            console.error(err);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await api.createTestCase(formData);
            onTestCaseCreated(result);
        } catch (err) {
            setError('Failed to create test case');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const updateFormData = (field: keyof CreateTestCaseDto, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const updateStep = (index: number, field: 'step' | 'expectedResult', value: string) => {
        const newSteps = [...formData.steps];
        newSteps[index] = { ...newSteps[index], [field]: value };
        setFormData(prev => ({ ...prev, steps: newSteps }));
    };

    const addStep = () => {
        setFormData(prev => ({
            ...prev,
            steps: [...prev.steps, { step: '', expectedResult: '' }]
        }));
    };

    const removeStep = (index: number) => {
        if (formData.steps.length > 1) {
            setFormData(prev => ({
                ...prev,
                steps: prev.steps.filter((_, i) => i !== index)
            }));
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-heading text-surface-contrast flex items-center gap-3">
                    <SearchIcon className="w-8 h-8 text-accent" />
                    Create with Semantic Search
                </h1>
                <button onClick={onBack} className="flex items-center gap-2 text-accent hover:text-accent-dark transition">
                    <BackIcon className="w-5 h-5" />
                    Back to Create Options
                </button>
            </div>

            {/* Search Section */}
            <div className="bg-ui-bg border border-accent-border rounded-lg p-6">
                <h2 className="text-xl font-heading text-surface-contrast mb-4">Search for Similar Test Cases</h2>
                <div className="flex gap-4">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Describe the test case you want to create..."
                        className="flex-1 bg-ui-element border border-accent-border rounded-lg p-3 text-body-text placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                    <button
                        onClick={handleSearch}
                        disabled={loading || !searchQuery.trim()}
                        className="flex items-center gap-2 bg-accent text-primary-bg font-bold py-3 px-6 rounded-lg hover:bg-accent-dark transition disabled:bg-gray-500 disabled:cursor-not-allowed"
                    >
                        <SearchIcon className="w-5 h-5" />
                        {loading ? 'Searching...' : 'Search'}
                    </button>
                </div>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
                <div className="bg-ui-bg border border-accent-border rounded-lg p-6">
                    <h2 className="text-xl font-heading text-surface-contrast mb-4">Search Results</h2>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {searchResults.map((result) => (
                            <div
                                key={result.testCase.id}
                                className={`p-4 border rounded-lg cursor-pointer transition ${selectedTestCase?.testCase.id === result.testCase.id
                                        ? 'border-accent bg-accent/10'
                                        : 'border-accent-border bg-ui-element hover:border-accent/50'
                                    }`}
                                onClick={() => handleSelectTestCase(result)}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-surface-contrast">{result.testCase.name}</h3>
                                        <p className="text-body-text text-sm mt-1">{result.testCase.description}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <TypeBadge type={result.testCase.type} />
                                            <PriorityBadge priority={result.testCase.priority} />
                                            <span className="text-accent font-mono text-sm">{(result.similarity * 100).toFixed(0)}% match</span>
                                        </div>
                                    </div>
                                    {selectedTestCase?.testCase.id === result.testCase.id && (
                                        <SaveIcon className="w-6 h-6 text-accent" />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Edit Form */}
            {selectedTestCase && !isEditing && (
                <div className="bg-ui-bg border border-accent-border rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-heading text-surface-contrast">Selected Template</h2>
                        <button
                            onClick={handleEdit}
                            className="flex items-center gap-2 bg-accent text-primary-bg font-bold py-2 px-4 rounded-lg hover:bg-accent-dark transition"
                        >
                            <EditIcon className="w-4 h-4" />
                            Edit & Save
                        </button>
                    </div>
                    <div className="bg-ui-element p-4 rounded-lg">
                        <h3 className="font-semibold text-surface-contrast">{selectedTestCase.testCase.name}</h3>
                        <p className="text-body-text text-sm mt-1">{selectedTestCase.testCase.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                            <TypeBadge type={selectedTestCase.testCase.type} />
                            <PriorityBadge priority={selectedTestCase.testCase.priority} />
                            <span className="text-accent font-mono text-sm">{(selectedTestCase.similarity * 100).toFixed(0)}% match</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Form */}
            {isEditing && (
                <div className="bg-ui-bg border border-accent-border rounded-lg p-6">
                    <h2 className="text-xl font-heading text-surface-contrast mb-4">Edit Test Case</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => updateFormData('name', e.target.value)}
                                className="w-full bg-ui-element border border-accent-border rounded-lg p-2 text-body-text focus:outline-none focus:ring-1 focus:ring-accent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => updateFormData('description', e.target.value)}
                                rows={3}
                                className="w-full bg-ui-element border border-accent-border rounded-lg p-2 text-body-text focus:outline-none focus:ring-1 focus:ring-accent"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Type</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => updateFormData('type', e.target.value as any)}
                                    className="w-full bg-ui-element border border-accent-border rounded-lg p-2 text-body-text focus:outline-none focus:ring-1 focus:ring-accent"
                                >
                                    <option value="positive">Positive</option>
                                    <option value="negative">Negative</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Priority</label>
                                <select
                                    value={formData.priority}
                                    onChange={(e) => updateFormData('priority', e.target.value as any)}
                                    className="w-full bg-ui-element border border-accent-border rounded-lg p-2 text-body-text focus:outline-none focus:ring-1 focus:ring-accent"
                                >
                                    <option value="high">High</option>
                                    <option value="medium">Medium</option>
                                    <option value="low">Low</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Steps</label>
                            {formData.steps.map((step, index) => (
                                <div key={index} className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        placeholder="Step description"
                                        value={step.step}
                                        onChange={(e) => updateStep(index, 'step', e.target.value)}
                                        className="flex-1 bg-ui-element border border-accent-border rounded-lg p-2 text-body-text focus:outline-none focus:ring-1 focus:ring-accent"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Expected result"
                                        value={step.expectedResult}
                                        onChange={(e) => updateStep(index, 'expectedResult', e.target.value)}
                                        className="flex-1 bg-ui-element border border-accent-border rounded-lg p-2 text-body-text focus:outline-none focus:ring-1 focus:ring-accent"
                                    />
                                    {formData.steps.length > 1 && (
                                        <button
                                            onClick={() => removeStep(index)}
                                            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                onClick={addStep}
                                className="mt-2 text-accent hover:text-accent-dark text-sm"
                            >
                                + Add Step
                            </button>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Expected Result</label>
                            <textarea
                                value={formData.expectedResult}
                                onChange={(e) => updateFormData('expectedResult', e.target.value)}
                                rows={2}
                                className="w-full bg-ui-element border border-accent-border rounded-lg p-2 text-body-text focus:outline-none focus:ring-1 focus:ring-accent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Tags (comma separated)</label>
                            <input
                                type="text"
                                value={formData.tags.join(', ')}
                                onChange={(e) => updateFormData('tags', e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag))}
                                className="w-full bg-ui-element border border-accent-border rounded-lg p-2 text-body-text focus:outline-none focus:ring-1 focus:ring-accent"
                            />
                        </div>
                    </div>

                    {error && <p className="text-red-400 text-sm mt-4">{error}</p>}

                    <div className="flex justify-end gap-4 mt-6">
                        <button
                            onClick={() => setIsEditing(false)}
                            className="px-6 py-2 text-gray-300 hover:text-white transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="flex items-center gap-2 bg-accent text-primary-bg font-bold py-2 px-6 rounded-lg hover:bg-accent-dark transition disabled:bg-gray-500 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Saving...' : 'Save Test Case'}
                        </button>
                    </div>
                </div>
            )}

            {error && !isEditing && <p className="text-red-400 text-sm">{error}</p>}
        </div>
    );
};

export default SemanticSearchCreation;