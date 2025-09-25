
import React, { useState, useEffect, useCallback } from 'react';
import { TestCaseListItem as TestCaseListItemType, TestCaseDetail as TestCaseDetailType } from './types';
import * as api from './services/api';
import TestCaseList from './components/TestCaseList';
import TestCaseDetail from './components/TestCaseDetail';
import AIGenerationForm from './components/AIGenerationForm';
import ManualTestCaseForm from './components/ManualTestCaseForm';
import CreateChoice from './components/CreateChoice';
import { Header } from './components/Layout';

type View = 'list' | 'detail' | 'create-choice' | 'create-manual' | 'create-ai' | 'edit-manual';

const App: React.FC = () => {
  const [view, setView] = useState<View>('list');
  const [testCases, setTestCases] = useState<TestCaseListItemType[]>([]);
  const [selectedTestCaseId, setSelectedTestCaseId] = useState<string | null>(null);
  const [editingTestCase, setEditingTestCase] = useState<TestCaseDetailType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTestCases = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.fetchTestCases();
      setTestCases(data);
    } catch (err) {
      setError('Failed to fetch test cases. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTestCases();
  }, [fetchTestCases]);

  const handleSelectTestCase = (id: string) => {
    setSelectedTestCaseId(id);
    setView('detail');
  };

  const handleShowCreateChoice = () => {
    setSelectedTestCaseId(null);
    setEditingTestCase(null);
    setView('create-choice');
  };
  
  const handleSelectCreateMode = (mode: 'ai' | 'manual') => {
      setView(mode === 'ai' ? 'create-ai' : 'create-manual');
  };

  const handleBackToList = () => {
    setSelectedTestCaseId(null);
    setEditingTestCase(null);
    setView('list');
  };

  const handleTestCaseSaved = () => {
    fetchTestCases();
    handleBackToList();
  }

  const handleEdit = (testCase: TestCaseDetailType) => {
    setEditingTestCase(testCase);
    setView('edit-manual');
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this test case? This action cannot be undone.')) {
        try {
            setLoading(true);
            await api.deleteTestCase(id);
            await fetchTestCases();
            handleBackToList();
        } catch (err) {
            setError('Failed to delete test case.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }
  };


  const renderContent = () => {
    if (loading && view === 'list') {
      return <div className="text-center p-10 text-body-text">Loading test cases...</div>;
    }
    if (error) {
      return <div className="text-center p-10 text-red-400">{error}</div>;
    }

    switch (view) {
      case 'detail':
        return selectedTestCaseId ? <TestCaseDetail testCaseId={selectedTestCaseId} onBack={handleBackToList} onEdit={handleEdit} onDelete={handleDelete} /> : null;
      case 'create-choice':
        return <CreateChoice onSelectMode={handleSelectCreateMode} onBack={handleBackToList} />;
      case 'create-ai':
        return <AIGenerationForm onBack={handleShowCreateChoice} onTestCaseCreated={handleTestCaseSaved} />;
      case 'create-manual':
        return <ManualTestCaseForm onSave={handleTestCaseSaved} onCancel={handleShowCreateChoice} />;
      case 'edit-manual':
        return editingTestCase ? <ManualTestCaseForm onSave={handleTestCaseSaved} onCancel={handleBackToList} initialData={editingTestCase} /> : null;
      case 'list':
      default:
        return <TestCaseList testCases={testCases} onSelectTestCase={handleSelectTestCase} />;
    }
  };

  return (
    <div className="min-h-screen bg-primary-bg font-sans">
      {/* FIX: Wrapped `setView` in a lambda to resolve type incompatibility between `React.Dispatch` and a simple function signature. */}
      <Header onShowCreateForm={handleShowCreateChoice} onViewChange={(v) => setView(v)} currentView={view} />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;