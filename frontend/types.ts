
export type TestCaseType = 'positive' | 'negative';
export type Priority = 'high' | 'medium' | 'low';
export type ReferenceType = 'manual' | 'rag_retrieval' | 'derived';
export type AIGenerationMethod = 'pure_ai' | 'rag';

export interface TestStep {
  step: string;
  expectedResult: string;
}

export interface TestCaseListItem {
  id: string;
  name: string;
  description: string;
  type: TestCaseType;
  priority: Priority;
  tags: string[];
  aiGenerated: boolean;
  aiGenerationMethod?: AIGenerationMethod;
  referencesCount: number;
  referencedByCount: number;
  ragReferencesCount: number;
  manualReferencesCount: number;
  derivedFromCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TestCaseReference {
  id: string;
  targetId: string;
  similarityScore?: number;
  referenceType: ReferenceType;
  target: {
    id: string;
    name: string;
    type: TestCaseType;
    priority: Priority;
  };
}

export interface TestCaseReferencedBy {
    id: string;
    sourceId: string;
    similarityScore?: number;
    referenceType: ReferenceType;
    source: {
      id: string;
      name: string;
      type: TestCaseType;
      priority: Priority;
    };
}


export interface TestCaseDetail {
  id: string;
  name: string;
  description: string;
  type: TestCaseType;
  priority: Priority;
  steps: TestStep[];
  expectedResult: string;
  tags: string[];
  aiGenerated: boolean;
  originalPrompt?: string;
  aiConfidence?: number;
  aiSuggestions?: string;
  aiGenerationMethod?: AIGenerationMethod;
  references?: TestCaseReference[];
  referencedBy?: TestCaseReferencedBy[];
  createdAt: string;
  updatedAt: string;
}

export interface AIGenerationForm {
  prompt: string;
  context?: string;
  preferredType?: TestCaseType;
  preferredPriority?: Priority;
  useRAG: boolean;
  ragSimilarityThreshold: number;
  maxRAGReferences: number;
}

export interface RAGReference {
  testCaseId: string;
  similarity: number;
  testCase: {
    id: string;
    name: string;
    type: TestCaseType;
    priority: Priority;
    tags: string[];
  };
}

export interface AIGeneratedTestCaseResponse extends Omit<TestCaseDetail, 'id' | 'createdAt' | 'updatedAt' | 'references' | 'referencedBy'> {
    confidence?: number;
    ragReferences: RAGReference[];
}

export interface CreateTestCaseDto {
    name: string;
    description: string;
    type: TestCaseType;
    priority: Priority;
    steps: TestStep[];
    expectedResult: string;
    tags: string[];
}

export type UpdateTestCaseDto = Partial<CreateTestCaseDto>;

export interface SearchResult {
    testCase: TestCaseListItem;
    similarity: number;
}
