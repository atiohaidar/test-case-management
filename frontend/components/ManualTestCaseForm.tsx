import React, { useState, useEffect, useCallback } from 'react';
import { CreateTestCaseDto, TestCaseDetail, TestStep, SearchResult } from '../types';
import * as api from '../services/api';
import { BackIcon, PlusIcon, TrashIcon, SaveIcon, ManualIcon, SearchIcon, DerivedIcon } from './Icons';
import { PriorityBadge, TypeBadge } from './Badge';

interface ManualTestCaseFormProps {
  onSave: (testCase: TestCaseDetail) => void;
  onCancel: () => void;
  initialData?: TestCaseDetail;
}

const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
};


const ManualTestCaseForm: React.FC<ManualTestCaseFormProps> = ({ onSave, onCancel, initialData }) => {
  const isEditing = !!initialData;
  const [formData, setFormData] = useState<CreateTestCaseDto>({
    name: '',
    description: '',
    type: 'positive',
    priority: 'medium',
    steps: [{ step: '', expectedResult: '' }],
    expectedResult: '',
    tags: [],
  });
  const [tagsInput, setTagsInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for semantic search derivation
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [derivedFrom, setDerivedFrom] = useState<{ id: string; name: string } | null>(null);


  useEffect(() => {
    if (isEditing && initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description,
        type: initialData.type,
        priority: initialData.priority,
        steps: initialData.steps,
        expectedResult: initialData.expectedResult,
        tags: initialData.tags,
      });
      setTagsInput(initialData.tags.join(', '));
    }
  }, [isEditing, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'name') {
        setSearchQuery(value);
        if (value) setIsSearching(true);
        setDerivedFrom(null); // Clear derivation if user types a new name
    }
  };

   useEffect(() => {
    if (debouncedSearchQuery && !isEditing) {
        setIsSearching(true);
        api.semanticSearch(debouncedSearchQuery)
            .then(setSearchResults)
            .catch(err => console.error("Search failed:", err))
            .finally(() => setIsSearching(false));
    } else {
        setSearchResults([]);
    }
  }, [debouncedSearchQuery, isEditing]);

  const handleSelectTemplate = async (testCaseItem: SearchResult['testCase']) => {
      setLoading(true);
      try {
          const fullDetail = await api.fetchTestCaseDetail(testCaseItem.id);
          setFormData({
              name: `${fullDetail.name} (Copy)`,
              description: fullDetail.description,
              type: fullDetail.type,
              priority: fullDetail.priority,
              steps: fullDetail.steps.length > 0 ? fullDetail.steps : [{ step: '', expectedResult: '' }],
              expectedResult: fullDetail.expectedResult,
              tags: fullDetail.tags,
          });
          setTagsInput(fullDetail.tags.join(', '));
          setDerivedFrom({ id: fullDetail.id, name: fullDetail.name });
          setSearchQuery('');
          setSearchResults([]);
      } catch (err) {
          setError("Failed to fetch template details.");
      } finally {
          setLoading(false);
      }
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagsInput(e.target.value);
    setFormData(prev => ({ ...prev, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }));
  };
  
  const handleStepChange = (index: number, field: keyof TestStep, value: string) => {
    const newSteps = [...formData.steps];
    newSteps[index][field] = value;
    setFormData(prev => ({ ...prev, steps: newSteps }));
  };

  const addStep = () => {
    setFormData(prev => ({ ...prev, steps: [...prev.steps, { step: '', expectedResult: '' }] }));
  };
  
  const removeStep = (index: number) => {
    if (formData.steps.length > 1) {
      const newSteps = formData.steps.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, steps: newSteps }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.description) {
      setError("Name and description are required.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      let result;
      if (isEditing) {
          result = await api.updateTestCase(initialData.id, formData);
      } else if (derivedFrom) {
          result = await api.deriveTestCase(derivedFrom.id, formData);
      } else {
          result = await api.createTestCase(formData);
      }
      onSave(result);
    } catch (err) {
      setError(`Failed to ${isEditing ? 'update' : 'create'} test case.`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-ui-bg border border-accent-border rounded-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
  <h1 className="text-2xl font-heading text-surface-contrast flex items-center gap-3">
          <ManualIcon className="w-7 h-7 text-accent" />
          {isEditing ? 'Edit Test Case' : 'Create Manual Test Case'}
        </h1>
        <button onClick={onCancel} className="flex items-center gap-2 text-accent hover:text-accent-dark transition">
          <BackIcon className="w-5 h-5" />
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Name</label>
            <div className="relative">
                <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="w-full bg-ui-element border border-accent-border rounded-lg p-2 text-body-text placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent" required autoComplete="off" />
                {isSearching && <div className="absolute inset-y-0 right-0 flex items-center pr-3"><div className="w-5 h-5 border-2 border-body-text border-t-accent rounded-full animate-spin"></div></div>}
            </div>
            {searchResults.length > 0 && !derivedFrom && (
                <div className="mt-2 bg-ui-element border border-accent-border rounded-lg p-2 max-h-48 overflow-y-auto space-y-1">
                    <p className="text-xs text-body-text px-2">Similar existing test cases:</p>
                    {searchResults.map(result => (
                        <div key={result.testCase.id} className="flex justify-between items-center p-2 rounded-md hover:bg-ui-bg">
                            <div>
                                <p className="text-sm text-surface-contrast">{result.testCase.name}</p>
                                <div className="flex items-center gap-2 text-xs">
                                  <TypeBadge type={result.testCase.type} />
                                  <PriorityBadge priority={result.testCase.priority} />
                                  <span className="font-mono text-accent" title="Similarity">~{(result.similarity * 100).toFixed(0)}%</span>
                                </div>
                            </div>
                            <button type="button" onClick={() => handleSelectTemplate(result.testCase)} className="bg-accent text-primary-bg text-xs font-bold py-1 px-3 rounded-md hover:bg-accent-dark">
                                Use
                            </button>
                        </div>
                    ))}
                </div>
            )}
             {derivedFrom && (
                <div className="mt-2 flex items-center gap-2 text-sm text-purple-300 bg-purple-900/50 px-3 py-1 rounded-full">
                    <DerivedIcon className="w-4 h-4" />
                    <span>Derived from: <strong>{derivedFrom.name}</strong></span>
                </div>
            )}
          </div>
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-300 mb-1">Tags (comma-separated)</label>
            <input type="text" name="tags" id="tags" value={tagsInput} onChange={handleTagsChange} className="w-full bg-ui-element border border-accent-border rounded-lg p-2 text-body-text placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-300 mb-1">Type</label>
            <select name="type" id="type" value={formData.type} onChange={handleChange} className="w-full bg-ui-element border border-accent-border rounded-lg p-2 text-body-text focus:outline-none focus:ring-2 focus:ring-accent">
              <option value="positive">Positive</option>
              <option value="negative">Negative</option>
            </select>
          </div>
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-300 mb-1">Priority</label>
            <select name="priority" id="priority" value={formData.priority} onChange={handleChange} className="w-full bg-ui-element border border-accent-border rounded-lg p-2 text-body-text focus:outline-none focus:ring-2 focus:ring-accent">
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">Description</label>
          <textarea name="description" id="description" rows={3} value={formData.description} onChange={handleChange} className="w-full bg-ui-element border border-accent-border rounded-lg p-2 text-body-text placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent" required></textarea>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-surface-contrast mb-2">Test Steps</h3>
          <div className="space-y-3">
            {formData.steps.map((step, index) => (
              <div key={index} className="flex items-start gap-2 p-3 bg-ui-element/50 border border-accent-border rounded-lg">
                <span className="text-accent font-bold mt-2">{index + 1}</span>
                <div className="flex-grow space-y-2">
                  <textarea placeholder="Step action..." value={step.step} onChange={e => handleStepChange(index, 'step', e.target.value)} rows={2} className="w-full bg-ui-element border border-accent-border rounded-lg p-2 text-body-text placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-accent" required />
                  <textarea placeholder="Expected result for this step..." value={step.expectedResult} onChange={e => handleStepChange(index, 'expectedResult', e.target.value)} rows={2} className="w-full bg-ui-element border border-accent-border rounded-lg p-2 text-body-text placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-accent" required />
                </div>
                <button type="button" onClick={() => removeStep(index)} disabled={formData.steps.length <= 1} className="p-2 text-red-400 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed">
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={addStep} className="mt-3 flex items-center gap-2 text-accent hover:text-accent-dark transition">
            <PlusIcon className="w-5 h-5" /> Add Step
          </button>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}
        
        <div className="flex justify-end">
            <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-accent text-primary-bg font-bold py-2 px-6 rounded-lg hover:bg-accent-dark transition disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
            {loading ? (
                <>
                <div className="w-5 h-5 border-2 border-primary-bg border-t-accent-dark rounded-full animate-spin"></div>
                Saving...
                </>
            ) : (
                <>
                <SaveIcon className="w-5 h-5" />
                {isEditing ? 'Save Changes' : 'Create Test Case'}
                </>
            )}
            </button>
        </div>
      </form>
    </div>
  );
};

export default ManualTestCaseForm;