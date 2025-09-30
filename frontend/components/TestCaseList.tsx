
import React, { useState, useEffect } from 'react';
import { TestCaseListItem as TestCaseListItemType, SearchResult } from '../types';
import * as api from '../services/api';
import TestCaseListItem from './TestCaseListItem';
import { SearchIcon } from './Icons';

interface TestCaseListProps {
  testCases: TestCaseListItemType[];
  onSelectTestCase: (id: string) => void;
}

const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
};

const TestCaseList: React.FC<TestCaseListProps> = ({ testCases, onSelectTestCase }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (debouncedSearchTerm) {
        setIsSearching(true);
        setSearchResults(null);
        api.semanticSearch(debouncedSearchTerm)
            .then(results => {
                setSearchResults(results);
            })
            .catch(err => console.error("Search failed:", err))
            .finally(() => {
                setIsSearching(false);
            });
    } else {
        setSearchResults(null);
        setIsSearching(false);
    }
  }, [debouncedSearchTerm]);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (term) {
      setIsSearching(true); // Show loading immediately
    }
  };

  const displayedCases = searchResults ? searchResults : testCases.map(tc => ({ testCase: tc, similarity: 0 }));
  const hasSearchResults = searchResults !== null;

  return (
    <div className="space-y-6">
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <SearchIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Semantic search for test cases..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full bg-ui-element border border-accent-border rounded-lg py-2 pl-10 pr-4 text-body-text placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition"
        />
        {isSearching && <div className="absolute inset-y-0 right-0 flex items-center pr-3"><div className="w-5 h-5 border-2 border-body-text border-t-accent rounded-full animate-spin"></div></div>}
      </div>

      {displayedCases.length > 0 ? (
        <div className="space-y-4">
          {hasSearchResults && <p className="text-sm text-body-text">Showing {searchResults?.length} semantic search results for "{debouncedSearchTerm}"</p>}
          {displayedCases.map((result) => (
            <TestCaseListItem 
              key={result.testCase.id} 
              testCase={result.testCase} 
              onSelect={onSelectTestCase} 
              similarity={hasSearchResults ? result.similarity : undefined}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 px-6 bg-ui-bg rounded-lg">
          <h3 className="text-xl font-semibold text-surface-contrast">No Test Cases Found</h3>
          <p className="mt-2 text-body-text">
            {hasSearchResults ? `No results for "${debouncedSearchTerm}". Try a different search term.` : 'There are no test cases. Why not create one?'}
          </p>
        </div>
      )}
    </div>
  );
};

export default TestCaseList;
