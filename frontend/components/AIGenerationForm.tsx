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
      
      {error && <p className="text-red-400 text-sm">{error}</p>}

      <div className="flex justify-end">
        <button
          onClick={handleGenerateAndSave}
          disabled={loading}
          className="flex items-center justify-center gap-2 bg-accent text-primary-bg font-bold py-2 px-6 rounded-lg hover:bg-accent-dark transition disabled:bg-gray-500 disabled:cursor-not-allowed"
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
