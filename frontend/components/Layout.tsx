import React from 'react';
import { SparklesIcon } from './Icons';

// FIX: Aligned this View type with the one in App.tsx to resolve type conflicts.
// The previous definition was too narrow ('list' | 'detail' | 'create').
type View = 'list' | 'detail' | 'create-choice' | 'create-manual' | 'create-ai' | 'edit-manual';

interface HeaderProps {
    onShowCreateForm: () => void;
    onViewChange: (view: View) => void;
    currentView: View;
}

export const Header: React.FC<HeaderProps> = ({ onShowCreateForm, onViewChange, currentView }) => {
    return (
        <header className="bg-ui-bg/80 backdrop-blur-sm sticky top-0 z-10 border-b border-accent-border">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-4 cursor-pointer" onClick={() => onViewChange('list')}>
                        <div className="bg-accent text-primary-bg p-2 rounded-lg">
                            <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <line x1="16" y1="13" x2="8" y2="13"></line>
                                <line x1="16" y1="17" x2="8" y2="17"></line>
                                <polyline points="10 9 9 9 8 9"></polyline>
                            </svg>
                        </div>
                        <h1 className="text-xl font-heading text-white">AI Test Case Manager</h1>
                    </div>
                    {currentView === 'list' && (
                         <button
                            onClick={onShowCreateForm}
                            className="flex items-center gap-2 bg-accent text-primary-bg font-bold py-2 px-4 rounded-lg hover:bg-accent-dark transition duration-300"
                        >
                            <SparklesIcon className="w-5 h-5"/>
                            <span>Create New</span>
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
};
