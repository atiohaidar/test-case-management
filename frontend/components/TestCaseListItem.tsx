
import React from 'react';
import { TestCaseListItem as TestCaseListItemType } from '../types';
import { Badge, PriorityBadge, TypeBadge } from './Badge';
import { AiIcon, ManualIcon, RagIcon, ReferenceIcon, ReferencedByIcon } from './Icons';

interface TestCaseListItemProps {
  testCase: TestCaseListItemType;
  onSelect: (id: string) => void;
  similarity?: number;
}

const AIGenerationIndicator: React.FC<{ testCase: TestCaseListItemType }> = ({ testCase }) => {
  if (!testCase.aiGenerated) {
    return <div className="flex items-center gap-2 text-sm text-body-text"><ManualIcon className="w-4 h-4" /> Manual</div>;
  }
  if (testCase.aiGenerationMethod === 'rag') {
    return <div className="flex items-center gap-2 text-sm text-green-400"><RagIcon className="w-4 h-4" /> RAG</div>;
  }
  return <div className="flex items-center gap-2 text-sm text-blue-400"><AiIcon className="w-4 h-4" /> Pure AI</div>;
};


const TestCaseListItem: React.FC<TestCaseListItemProps> = ({ testCase, onSelect, similarity }) => {
  return (
    <div
      onClick={() => onSelect(testCase.id)}
      className="bg-ui-bg border border-accent-border rounded-lg p-4 shadow-lg hover:border-accent hover:shadow-xl transition-all duration-300 cursor-pointer"
    >
      <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
        {/* Left Side: Main Info */}
        <div className="flex-grow">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-heading font-semibold text-surface-contrast truncate">{testCase.name}</h3>
            <TypeBadge type={testCase.type} />
            <PriorityBadge priority={testCase.priority} />
          </div>
          <p className="text-body-text text-sm mb-3 line-clamp-2">{testCase.description}</p>
          <div className="flex flex-wrap gap-2">
            {testCase.tags.map((tag) => (
              <Badge key={tag} text={tag} />
            ))}
          </div>
        </div>

        {/* Right Side: Metadata */}
        <div className="flex-shrink-0 flex flex-col items-start md:items-end gap-3 w-full md:w-auto">
          <div className="flex items-center gap-4">
            {similarity !== undefined && (
              <div className="text-sm font-mono text-accent" title="Similarity Score">
                ~{(similarity * 100).toFixed(0)}%
              </div>
            )}
            <AIGenerationIndicator testCase={testCase} />
          </div>
          <div className="flex items-center space-x-4 text-sm">
            {testCase.referencesCount > 0 && (
               <div title="Outgoing References" className="flex items-center gap-1.5 text-body-text">
                <ReferenceIcon className="w-4 h-4" />
                <span>{testCase.referencesCount}</span>
              </div>
            )}
            {testCase.referencedByCount > 0 && (
              <div title="Incoming References" className="flex items-center gap-1.5 text-body-text">
                <ReferencedByIcon className="w-4 h-4" />
                <span>{testCase.referencedByCount}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestCaseListItem;
