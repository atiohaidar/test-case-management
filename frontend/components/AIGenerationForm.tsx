import React, { useState } from 'react';
import { AIGenerationForm as AIGenerationFormType, AIGeneratedTestCaseResponse, TestCaseDetail } from '../types';
import * as api from '../services/api';
import { BackIcon, RagIcon, AiIcon, SparklesIcon, ChevronDownIcon } from './Icons';

interface AIGenerationFormProps {
  onBack: () => void;
  onTestCaseCreated: (testCase: TestCaseDetail) => void;
}

const AIGenerationForm: React.FC<AIGenerationFormProps> = ({ onBack, onTestCaseCreated }) => {
  const [formState, setFormState] = useState<AIGenerationFormType>({
    prompt: '',
    useRAG: true,
    ragSimilarityThreshold: 0.7,
    maxRAGReferences: 3,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<AIGeneratedTestCaseResponse | null>(null);
  const [editedTestCase, setEditedTestCase] = useState<Partial<AIGeneratedTestCaseResponse> | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // FIX: Refactored the `handleChange` function to correctly perform type narrowing.
  // Destructuring `type` from `e.target` previously broke TypeScript's control flow analysis,
  // preventing it from knowing that `e.target` was an HTMLInputElement within the `if` block.
  // This version checks the properties on the target directly, which allows for correct type inference.
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target;
    const { name, value } = target;

    if (target instanceof HTMLInputElement && target.type === 'checkbox') {
        setFormState(prev => ({ ...prev, [name]: target.checked }));
    } else {
        setFormState(prev => ({ ...prev, [name]: target.type === 'number' ? parseFloat(value) : value }));
    }
  };

  const handlePreview = async () => {
    if (formState.prompt.length < 10) {
        setError("Please provide a more detailed prompt (at least 10 characters).");
        return;
    }
    setLoading(true);
    setError(null);
    try {
        const result = await api.generateWithAI(formState);
        setPreview(result);
        // Initialize editedTestCase with preview data for editing
        setEditedTestCase({
            name: result.name,
            description: result.description,
            type: result.type,
            priority: result.priority,
            steps: result.steps,
            expectedResult: result.expectedResult,
            tags: result.tags,
        });
    } catch (err) {
        setError("Failed to generate preview. The AI service might be unavailable.");
        console.error(err);
    } finally {
        setLoading(false);
    }
  };

  const handleGenerateAndSave = async () => {
    if (formState.prompt.length < 10) {
        setError("Please provide a more detailed prompt (at least 10 characters).");
        return;
    }
    setLoading(true);
    setError(null);
    try {
        const result = await api.generateAndSaveWithAI(formState);
        onTestCaseCreated(result);
    } catch (err) {
        setError("Failed to generate and save test case. The AI service might be unavailable.");
        console.error(err);
    } finally {
        setLoading(false);
    }
  };

  const handleSaveEdited = async () => {
    if (!preview || !editedTestCase) return;

    setLoading(true);
    setError(null);
    try {
        // Filter RAG references to only include testCaseId and similarity
        const filteredRagReferences = preview.ragReferences?.map(ref => ({
            testCaseId: ref.testCaseId,
            similarity: ref.similarity
        }));

        // Merge preview with edits and preserve AI metadata
        const testCaseToSave: any = {
            name: editedTestCase.name || preview.name,
            description: editedTestCase.description || preview.description,
            type: editedTestCase.type || preview.type,
            priority: editedTestCase.priority || preview.priority,
            steps: editedTestCase.steps || preview.steps,
            expectedResult: editedTestCase.expectedResult || preview.expectedResult,
            tags: editedTestCase.tags || preview.tags,
            aiGenerated: true,
            originalPrompt: formState.prompt,
            aiGenerationMethod: formState.useRAG ? 'rag' as const : 'pure_ai' as const,
        };

        // Only add optional AI fields if they exist
        if (preview.confidence !== undefined) {
            testCaseToSave.aiConfidence = preview.confidence;
        }
        if (preview.tokenUsage) {
            testCaseToSave.tokenUsage = preview.tokenUsage;
        }
        if (filteredRagReferences && filteredRagReferences.length > 0) {
            testCaseToSave.ragReferences = filteredRagReferences;
        }

        console.log('Saving edited test case:', testCaseToSave);
        const result = await api.createTestCase(testCaseToSave);
        onTestCaseCreated(result);
    } catch (err) {
        setError("Failed to save edited test case.");
        console.error(err);
    } finally {
        setLoading(false);
    }
  };

  const handleEditChange = (field: string, value: any) => {
    setEditedTestCase(prev => ({ ...prev, [field]: value }));
  };

  const handleAddStep = () => {
    const currentSteps = editedTestCase?.steps ?? preview?.steps ?? [];
    const newSteps = [...currentSteps, { step: '', expectedResult: '' }];
    handleEditChange('steps', newSteps);
  };

  const handleRemoveStep = (index: number) => {
    const currentSteps = editedTestCase?.steps ?? preview?.steps ?? [];
    const newSteps = currentSteps.filter((_, i) => i !== index);
    handleEditChange('steps', newSteps);
  };


  return (
    <div className="max-w-4xl mx-auto bg-ui-bg border border-accent-border rounded-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading text-white flex items-center gap-3">
          <SparklesIcon className="w-7 h-7 text-accent" />
          Generate Test Case with AI
        </h1>
        <button onClick={onBack} className="flex items-center gap-2 text-accent hover:text-accent-dark transition">
          <BackIcon className="w-5 h-5" />
          Back to Create Options
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-1">
            Prompt
          </label>
          <textarea
            id="prompt"
            name="prompt"
            rows={4}
            value={formState.prompt}
            onChange={handleChange}
            placeholder="e.g., 'Create a test case for a user trying to reset their password with an expired token...'"
            className="w-full bg-ui-element border border-accent-border rounded-lg p-2 text-body-text placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <div className="flex items-center justify-between bg-ui-element p-3 rounded-lg">
          <div className="flex items-center gap-2">
            <RagIcon className="w-5 h-5 text-green-400" />
            <label htmlFor="useRAG" className="font-semibold text-white">
              Enable RAG (Retrieval-Augmented Generation)
            </label>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" id="useRAG" name="useRAG" checked={formState.useRAG} onChange={handleChange} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
          </label>
        </div>

        <div>
            <button onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center justify-between w-full text-left text-gray-300 hover:text-white">
                <span>Advanced RAG Settings</span>
                <ChevronDownIcon className={`w-5 h-5 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
            </button>
            {showAdvanced && (
                <div className="mt-3 p-4 bg-ui-element/50 rounded-lg space-y-4 border border-accent-border">
                    <div>
                        <label htmlFor="ragSimilarityThreshold" className="block text-sm text-gray-300">Similarity Threshold: <span className="font-mono text-accent">{formState.ragSimilarityThreshold.toFixed(2)}</span></label>
                        <input
                            type="range"
                            id="ragSimilarityThreshold"
                            name="ragSimilarityThreshold"
                            min="0"
                            max="1"
                            step="0.05"
                            value={formState.ragSimilarityThreshold}
                            onChange={handleChange}
                            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-accent"
                            disabled={!formState.useRAG}
                        />
                    </div>
                    <div>
                        <label htmlFor="maxRAGReferences" className="block text-sm text-gray-300">Max RAG References: <span className="font-mono text-accent">{formState.maxRAGReferences}</span></label>
                        <input
                            type="number"
                            id="maxRAGReferences"
                            name="maxRAGReferences"
                            min="1"
                            max="10"
                            value={formState.maxRAGReferences}
                            onChange={handleChange}
                            className="w-full mt-1 bg-ui-element border border-accent-border rounded-lg p-2 text-body-text focus:outline-none focus:ring-1 focus:ring-accent"
                             disabled={!formState.useRAG}
                        />
                    </div>
                </div>
            )}
        </div>
      </div>

      {preview && (
        <div className="border-t border-accent-border pt-6">
          <h2 className="text-xl font-heading text-white mb-4 flex items-center gap-2">
            <SparklesIcon className="w-6 h-6 text-accent" />
            AI Generated Preview
          </h2>

          <div className="space-y-4 bg-ui-element/30 p-4 rounded-lg border border-accent-border">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
              <input
                type="text"
                value={editedTestCase?.name ?? preview.name}
                onChange={(e) => handleEditChange('name', e.target.value)}
                className="w-full bg-ui-element border border-accent-border rounded-lg p-2 text-body-text focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
              <textarea
                rows={3}
                value={editedTestCase?.description ?? preview.description}
                onChange={(e) => handleEditChange('description', e.target.value)}
                className="w-full bg-ui-element border border-accent-border rounded-lg p-2 text-body-text focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Type</label>
                <select
                  value={editedTestCase?.type ?? preview.type}
                  onChange={(e) => handleEditChange('type', e.target.value as 'positive' | 'negative')}
                  className="w-full bg-ui-element border border-accent-border rounded-lg p-2 text-body-text focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="positive">Positive</option>
                  <option value="negative">Negative</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Priority</label>
                <select
                  value={editedTestCase?.priority ?? preview.priority}
                  onChange={(e) => handleEditChange('priority', e.target.value as 'high' | 'medium' | 'low')}
                  className="w-full bg-ui-element border border-accent-border rounded-lg p-2 text-body-text focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Expected Result</label>
              <textarea
                rows={2}
                value={editedTestCase?.expectedResult ?? preview.expectedResult}
                onChange={(e) => handleEditChange('expectedResult', e.target.value)}
                className="w-full bg-ui-element border border-accent-border rounded-lg p-2 text-body-text focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-300">Test Steps</label>
                <button
                  onClick={handleAddStep}
                  className="text-accent hover:text-accent-dark text-sm font-medium"
                >
                  + Add Step
                </button>
              </div>
              <div className="space-y-2">
                {(editedTestCase?.steps ?? preview.steps)?.map((step, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Step description"
                        value={step.step}
                        onChange={(e) => {
                          const newSteps = [...(editedTestCase?.steps ?? preview.steps)];
                          newSteps[index] = { ...newSteps[index], step: e.target.value };
                          handleEditChange('steps', newSteps);
                        }}
                        className="w-full bg-ui-element border border-accent-border rounded-lg p-2 text-body-text focus:outline-none focus:ring-2 focus:ring-accent text-sm"
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Expected result for this step"
                        value={step.expectedResult}
                        onChange={(e) => {
                          const newSteps = [...(editedTestCase?.steps ?? preview.steps)];
                          newSteps[index] = { ...newSteps[index], expectedResult: e.target.value };
                          handleEditChange('steps', newSteps);
                        }}
                        className="w-full bg-ui-element border border-accent-border rounded-lg p-2 text-body-text focus:outline-none focus:ring-2 focus:ring-accent text-sm"
                      />
                    </div>
                    <button
                      onClick={() => handleRemoveStep(index)}
                      className="text-red-400 hover:text-red-300 mt-2"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Tags (comma-separated)</label>
              <input
                type="text"
                value={editedTestCase?.tags?.join(', ') ?? preview.tags?.join(', ')}
                onChange={(e) => handleEditChange('tags', e.target.value.split(',').map(tag => tag.trim()))}
                className="w-full bg-ui-element border border-accent-border rounded-lg p-2 text-body-text focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            {preview.ragReferences && preview.ragReferences.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">RAG References Used</label>
                <div className="space-y-2">
                  {preview.ragReferences.map((ref, index) => (
                    <div key={index} className="flex items-center justify-between bg-ui-element p-2 rounded border border-accent-border">
                      <div className="flex items-center gap-2">
                        <RagIcon className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-body-text">{ref.testCase.name}</span>
                      </div>
                      <span className="text-xs text-accent font-mono">{(ref.similarity * 100).toFixed(0)}% match</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {preview.confidence && (
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <AiIcon className="w-4 h-4 text-accent" />
                AI Confidence: <span className="font-mono text-accent">{(preview.confidence * 100).toFixed(0)}%</span>
              </div>
            )}
          </div>
        </div>
      )}
      
      {error && <p className="text-red-400 text-sm">{error}</p>}

      <div className="flex justify-end gap-3">
        {!preview ? (
          <button
            onClick={handlePreview}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <AiIcon className="w-5 h-5 animate-spin" />
                Generating Preview...
              </>
            ) : (
              <>
                <AiIcon className="w-5 h-5" />
                Preview
              </>
            )}
          </button>
        ) : (
          <>
            <button
              onClick={() => {
                setPreview(null);
                setEditedTestCase(null);
              }}
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-gray-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-gray-700 transition disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
              Back to Edit
            </button>
            <button
              onClick={handleSaveEdited}
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-accent text-primary-bg font-bold py-2 px-6 rounded-lg hover:bg-accent-dark transition disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <AiIcon className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <AiIcon className="w-5 h-5" />
                  Save Edited Test Case
                </>
              )}
            </button>
          </>
        )}
        <button
          onClick={handleGenerateAndSave}
          disabled={loading}
          className="flex items-center justify-center gap-2 bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition disabled:bg-gray-500 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <AiIcon className="w-5 h-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <AiIcon className="w-5 h-5" />
              Generate and Save
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AIGenerationForm;
