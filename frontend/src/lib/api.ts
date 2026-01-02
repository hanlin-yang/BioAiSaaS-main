/**
 * API configuration and client setup for frontend
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * Make API request with error handling
 */
export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || `API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Agent API endpoints
 */
export const agentAPI = {
  execute: async (task: string, context?: Record<string, any>, parameters?: Record<string, any>) => {
    return apiRequest('/api/agent/execute', {
      method: 'POST',
      body: JSON.stringify({ task, context, parameters }),
    });
  },
};

/**
 * Tools API endpoints
 */
export const toolsAPI = {
  list: async () => {
    return apiRequest('/api/tools/list');
  },
  
  get: async (toolId: string) => {
    return apiRequest(`/api/tools/${toolId}`);
  },
};

/**
 * Projects API endpoints
 */
export const projectsAPI = {
  list: async () => {
    return apiRequest('/api/projects');
  },
  
  create: async (name: string, description?: string, tags?: string[]) => {
    return apiRequest('/api/projects', {
      method: 'POST',
      body: JSON.stringify({ name, description, tags }),
    });
  },
  
  get: async (projectId: string) => {
    return apiRequest(`/api/projects/${projectId}`);
  },
};

/**
 * Knowledge API endpoints
 */
export const knowledgeAPI = {
  search: async (query: string) => {
    return apiRequest(`/api/knowledge/search?query=${encodeURIComponent(query)}`);
  },
  
  getResources: async () => {
    return apiRequest('/api/knowledge/resources');
  },
};

/**
 * Health check endpoint
 */
export const healthAPI = {
  check: async () => {
    return apiRequest('/health');
  },
};
