
import React, { useState, useEffect } from 'react';
import { TestCaseDetail as TestCaseDetailType, TestCaseReference, TestCaseReferencedBy } from '../types';
import * as api from '../services/api';
import { Badge, PriorityBadge, TypeBadge } from './Badge';
import { AiIcon, ManualIcon, RagIcon, BackIcon, ReferenceIcon, ReferencedByIcon, ConfidenceIcon, EditIcon, TrashIcon } from './Icons';

interface TestCaseDetailProps {
  testCaseId: string;
  onBack: () => void;
  onEdit: (testCase: TestCaseDetailType) => void;
  onDelete: (id: string) => void;
}

const ReferenceItem: React.FC<{ reference: TestCaseReference | TestCaseReferencedBy }> = ({ reference }) => {
  const isOutgoing = 'target' in reference;
  const item = isOutgoing ? reference.target : reference.source;

  const getIcon = () => {
    switch (reference.referenceType) {
      case 'manual': return <div title="Manual Reference" className="flex items-center gap-1 text-xs bg-gray-600 text-gray-200 px-2 py-0.5 rounded-full"><ManualIcon className="w-3 h-3" /> Manual</div>;
      case 'rag_retrieval': return <div title="RAG Reference" className="flex items-center gap-1 text-xs bg-green-800 text-green-200 px-2 py-0.5 rounded-full"><RagIcon className="w-3 h-3" /> RAG</div>;
      case 'semantic_search': return <div title="Semantic Search" className="flex items-center gap-1 text-xs bg-purple-800 text-purple-200 px-2 py-0.5 rounded-full"><span className="font-bold">SS</span></div>;
    }
  };

  return (
    <div className="flex justify-between items-center p-3 bg-ui-element rounded-md hover:bg-opacity-80 transition">
      <div>
  <span className="font-semibold text-surface-contrast">{item.name}</span>
        <div className="flex items-center gap-2 mt-1">
          <TypeBadge type={item.type} />
          <PriorityBadge priority={item.priority} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        {reference.similarityScore && (
          <div className="text-xs text-accent font-mono">{(reference.similarityScore * 100).toFixed(0)}%</div>
        )}
        {getIcon()}
      </div>
    </div>
  );
};


const TestCaseDetail: React.FC<TestCaseDetailProps> = ({ testCaseId, onBack, onEdit, onDelete }) => {
  const [testCase, setTestCase] = useState<TestCaseDetailType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTestCase = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.fetchTestCaseDetail(testCaseId);
        setTestCase(data);
      } catch (err) {
        setError('Failed to load test case details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadTestCase();
  }, [testCaseId]);

  if (loading) return <div className="text-center p-10">Loading details...</div>;
  if (error) return <div className="text-center p-10 text-red-400">{error}</div>;
  if (!testCase) return null;

  const confidenceColor = testCase.aiConfidence && testCase.aiConfidence > 0.8 ? 'text-green-400' : testCase.aiConfidence && testCase.aiConfidence > 0.6 ? 'text-yellow-400' : 'text-orange-400';


  return (
    <div className="bg-ui-bg border border-accent-border rounded-lg p-6 space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-accent hover:text-accent-dark transition">
          <BackIcon className="w-5 h-5" />
          Back to List
        </button>
        <div className="flex items-center gap-2">
          <button onClick={() => onEdit(testCase)} className="flex items-center gap-2 bg-ui-element hover:bg-opacity-80 text-body-text font-semibold py-2 px-4 rounded-lg transition">
            <EditIcon className="w-4 h-4" />
            Edit
          </button>
          <button onClick={() => onDelete(testCase.id)} className="flex items-center gap-2 bg-red-800/80 hover:bg-red-800 text-red-200 font-semibold py-2 px-4 rounded-lg transition">
            <TrashIcon className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      {/* Header */}
      <div>
        <div className="flex flex-wrap items-center gap-4 mb-2">
          <h1 className="text-3xl font-heading text-surface-contrast">{testCase.name}</h1>
          <TypeBadge type={testCase.type} large />
          <PriorityBadge priority={testCase.priority} large />
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {testCase.tags.map((tag) => <Badge key={tag} text={tag} />)}
        </div>
      </div>

      <p className="text-body-text">{testCase.description}</p>

      {/* AI Metadata */}
      {testCase.aiGenerated && (
        <div className="bg-ui-element/50 border border-accent-border rounded-lg p-4 space-y-3">
          <h2 className="text-lg font-heading text-surface-contrast flex items-center gap-2">
            <AiIcon className="w-5 h-5 text-accent" /> AI Generation Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-300">Method:</span>
              <span className={testCase.aiGenerationMethod === 'rag' ? 'text-green-400' : 'text-blue-400'}>{testCase.aiGenerationMethod?.replace('_', ' ')}</span>
            </div>
            {testCase.aiConfidence && (
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-300">Confidence:</span>
                <span className={`flex items-center gap-1 ${confidenceColor}`}><ConfidenceIcon className="w-4 h-4" /> {(testCase.aiConfidence * 100).toFixed(0)}%</span>
              </div>
            )}
            {testCase.tokenUsage && (
              <>
                {/* Handle both token usage formats */}
                {(testCase.tokenUsage.inputTokens !== undefined || testCase.tokenUsage.prompt_token_count !== undefined) && (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-300">Input Tokens:</span>
                    <span className="text-accent font-mono">{testCase.tokenUsage.inputTokens || testCase.tokenUsage.prompt_token_count || 0}</span>
                  </div>
                )}
                {(testCase.tokenUsage.outputTokens !== undefined || testCase.tokenUsage.candidates_token_count !== undefined) && (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-300">Output Tokens:</span>
                    <span className="text-accent font-mono">{testCase.tokenUsage.outputTokens || testCase.tokenUsage.candidates_token_count || 0}</span>
                  </div>
                )}
                {(testCase.tokenUsage.totalTokens !== undefined || testCase.tokenUsage.total_token_count !== undefined) && (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-300">Total Tokens:</span>
                    <span className="text-accent font-mono">{testCase.tokenUsage.totalTokens || testCase.tokenUsage.total_token_count || 0}</span>
                  </div>
                )}
                {testCase.tokenUsage.estimatedCost && (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-300">Est. Cost:</span>
                    <span className="text-green-400 font-mono">${testCase.tokenUsage.estimatedCost.toFixed(4)}</span>
                  </div>
                )}
              </>
            )}
          </div>
          {testCase.originalPrompt && (
            <div>
              <h4 className="font-semibold text-gray-300 mb-1">Original Prompt:</h4>
              <p className="font-mono text-xs bg-primary-bg p-3 rounded-md text-body-text">{testCase.originalPrompt}</p>
            </div>
          )}
          {testCase.aiSuggestions && (
            <div>
              <h4 className="font-semibold text-gray-300 mb-1">AI Suggestions:</h4>
              <p className="text-body-text text-sm italic">"{testCase.aiSuggestions}"</p>
            </div>
          )}
        </div>
      )}

      {/* Steps */}
      <div className="space-y-4">
  <h2 className="text-xl font-heading text-surface-contrast">Test Steps</h2>
        <ol className="list-decimal list-inside space-y-3 border border-accent-border rounded-lg p-4">
          {testCase.steps.map((step, index) => (
            <li key={index} className="text-body-text pl-2 border-l-2 border-accent-border ml-2">
              <span className="font-semibold text-gray-300">{step.step}</span>
              <p className="text-sm pl-4 mt-1 text-gray-400"><strong>Expected:</strong> {step.expectedResult}</p>
            </li>
          ))}
        </ol>
      </div>

      {/* References */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-heading text-surface-contrast flex items-center gap-2 mb-3">
            <ReferenceIcon className="w-5 h-5 text-accent" /> References ({testCase.referencesCount || 0})
          </h2>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {testCase.references && testCase.references.length > 0 ? (
              testCase.references.map(ref => <ReferenceItem key={ref.id} reference={ref} />)
            ) : <p className="text-body-text text-sm">This test case does not reference any others.</p>}
          </div>
        </div>
        <div>
          <h2 className="text-xl font-heading text-surface-contrast flex items-center gap-2 mb-3">
            <ReferencedByIcon className="w-5 h-5 text-accent" /> Referenced By ({(testCase.referencedBy?.length || 0) + (testCase.derivedTestCases?.length || 0)})
          </h2>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {((testCase.referencedBy || []).concat(
              (testCase.derivedTestCases || []).map(derived => ({
                id: derived.referenceInfo.id,
                sourceId: derived.id,
                similarityScore: derived.referenceInfo.similarityScore,
                referenceType: derived.referenceInfo.referenceType as any,
                source: {
                  id: derived.id,
                  name: derived.name,
                  type: derived.type,
                  priority: derived.priority,
                  createdAt: derived.createdAt
                }
              }))
            )).length > 0 ? (
              ((testCase.referencedBy || []).concat(
                (testCase.derivedTestCases || []).map(derived => ({
                  id: derived.referenceInfo.id,
                  sourceId: derived.id,
                  similarityScore: derived.referenceInfo.similarityScore,
                  referenceType: derived.referenceInfo.referenceType as any,
                  source: {
                    id: derived.id,
                    name: derived.name,
                    type: derived.type,
                    priority: derived.priority,
                    createdAt: derived.createdAt
                  }
                }))
              )).map(ref => <ReferenceItem key={ref.id} reference={ref} />)
            ) : <p className="text-body-text text-sm">No other test cases reference this one.</p>}
          </div>
        </div>
      </div>

    </div>
  );
};

export default TestCaseDetail;
