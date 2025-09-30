
import React from 'react';
import { BackIcon, ManualIcon, SparklesIcon, SearchIcon } from './Icons';

interface CreateChoiceProps {
  onSelectMode: (mode: 'manual' | 'semantic_search' | 'ai') => void;
  onBack: () => void;
}

const CreateChoice: React.FC<CreateChoiceProps> = ({ onSelectMode, onBack }) => {
  return (
    <div className="max-w-2xl mx-auto text-center animate-fade-in">
      <div className="flex justify-start mb-8">
        <button onClick={onBack} className="flex items-center gap-2 text-accent hover:text-accent-dark transition">
          <BackIcon className="w-5 h-5" />
          Back to List
        </button>
      </div>
  <h1 className="text-3xl font-heading text-surface-contrast mb-4">How would you like to create a test case?</h1>
      <p className="text-body-text mb-10">Choose a creation method below.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={() => onSelectMode('manual')}
          className="group bg-ui-bg border border-accent-border rounded-lg p-8 hover:border-accent hover:shadow-xl transition-all duration-300 text-left"
        >
          <ManualIcon className="w-12 h-12 text-body-text group-hover:text-accent transition-colors" />
          <h2 className="text-xl font-heading text-surface-contrast mt-4">Create Manually</h2>
          <p className="text-body-text mt-2 text-sm">Full control to define every detail of your test case from scratch.</p>
        </button>
        <button
          onClick={() => onSelectMode('semantic_search')}
          className="group bg-ui-bg border border-accent-border rounded-lg p-8 hover:border-accent hover:shadow-xl transition-all duration-300 text-left"
        >
          <SearchIcon className="w-12 h-12 text-body-text group-hover:text-accent transition-colors" />
          <h2 className="text-xl font-heading text-surface-contrast mt-4">Semantic Search</h2>
          <p className="text-body-text mt-2 text-sm">Search for similar test cases and use them as templates for your new test case.</p>
        </button>
        <button
          onClick={() => onSelectMode('ai')}
          className="group bg-ui-bg border border-accent-border rounded-lg p-8 hover:border-accent hover:shadow-xl transition-all duration-300 text-left"
        >
          <SparklesIcon className="w-12 h-12 text-body-text group-hover:text-accent transition-colors" />
          <h2 className="text-xl font-heading text-surface-contrast mt-4">AI Generation</h2>
          <p className="text-body-text mt-2 text-sm">Describe your test case in plain language and let AI do the heavy lifting.</p>
        </button>
      </div>
    </div>
  );
};

export default CreateChoice;
