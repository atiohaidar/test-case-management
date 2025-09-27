import { TestCaseListItem, TestCaseDetail, AIGenerationForm, AIGeneratedTestCaseResponse, CreateTestCaseDto, UpdateTestCaseDto, SearchResult } from '../types';

const BASE_URL = 'http://127.0.0.1:3000';

// --- LIVE API IMPLEMENTATION ---

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`API Error: ${response.status} ${response.statusText}`, errorBody);
    throw new Error(`Request failed: ${response.statusText}`);
  }
  // For 204 No Content, there's no body to parse
  if (response.status === 204) {
    return;
  }
  return response.json();
};

export const fetchTestCases = async (): Promise<TestCaseListItem[]> => {
  console.log('Fetching all test cases from API...');
  const response = await fetch(`${BASE_URL}/testcases`);
  return handleResponse(response);
};

export const fetchTestCaseDetail = async (id: string): Promise<TestCaseDetail> => {
  console.log(`Fetching full detail with complete references for test case ${id} from API...`);
  // Using the /full endpoint to get complete reference information including derived test cases
  const response = await fetch(`${BASE_URL}/testcases/${id}/full`);
  return handleResponse(response);
};

export const generateWithAI = async (formData: AIGenerationForm): Promise<AIGeneratedTestCaseResponse> => {
  console.log('Generating test case with AI (preview) via API...', formData);
  const response = await fetch(`${BASE_URL}/testcases/generate-with-ai`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });
  return handleResponse(response);
};

export const generateAndSaveWithAI = async (formData: AIGenerationForm): Promise<TestCaseDetail> => {
  console.log('Generating and saving test case with AI via API...', formData);
  const response = await fetch(`${BASE_URL}/testcases/generate-and-save-with-ai`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });
  return handleResponse(response);
}

// Manual CRUD
export const createTestCase = async (data: CreateTestCaseDto): Promise<TestCaseDetail> => {
  console.log('Creating manual test case via API...', data);
  const response = await fetch(`${BASE_URL}/testcases`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const deriveTestCase = async (referenceId: string, data: CreateTestCaseDto): Promise<TestCaseDetail> => {
  console.log(`Deriving test case from ${referenceId} via API...`, data);
  const response = await fetch(`${BASE_URL}/testcases/derive/${referenceId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export const updateTestCase = async (id: string, data: UpdateTestCaseDto): Promise<TestCaseDetail> => {
  console.log(`Updating test case ${id} via API...`, data);
  const response = await fetch(`${BASE_URL}/testcases/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const deleteTestCase = async (id: string): Promise<void> => {
  console.log(`Deleting test case ${id} via API...`);
  const response = await fetch(`${BASE_URL}/testcases/${id}`, {
    method: 'DELETE',
  });
  await handleResponse(response);
};

// Search
export const semanticSearch = async (query: string, minSimilarity = 0.1, limit = 10): Promise<SearchResult[]> => {
  console.log(`Semantic searching for "${query}" via API...`);
  if (!query) return Promise.resolve([]);

  const params = new URLSearchParams({
    query,
    minSimilarity: minSimilarity.toString(),
    limit: limit.toString(),
  });

  const response = await fetch(`${BASE_URL}/testcases/search?${params}`);
  return handleResponse(response);
};