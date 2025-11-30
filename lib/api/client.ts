// API Client for PHP/MySQL Backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://school.rf.gd/api';

interface RequestOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
}

async function apiRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {} } = options;
  
  // Get authentication token from localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  
  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'X-Auth-Token': token }),
      ...headers,
    },
  };

  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, config);
    
    // Get response text first to check if it's JSON
    const text = await response.text();
    
    if (!response.ok) {
      // Try to parse as JSON, if fails, use text as error
      try {
        const error = JSON.parse(text);
        throw new Error(error.error || `HTTP error! status: ${response.status}`);
      } catch {
        // If not JSON, it might be HTML error page
        throw new Error(`HTTP error! status: ${response.status}. Response: ${text.substring(0, 100)}`);
      }
    }

    // Try to parse as JSON
    try {
      return JSON.parse(text);
    } catch (e) {
      // If response is not JSON, it might be an error
      throw new Error(`Invalid JSON response: ${text.substring(0, 100)}`);
    }
  } catch (error: any) {
    throw new Error(error.message || 'API request failed');
  }
}

// File Upload
export async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  // Get authentication token from localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  
  const headers: HeadersInit = {};
  if (token) {
    headers['X-Auth-Token'] = token;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/upload.php`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(error.error || 'File upload failed');
    }

    const data = await response.json();
    return data.url;
  } catch (error: any) {
    throw new Error(error.message || 'File upload failed');
  }
}

export async function uploadMultipleFiles(files: File[]): Promise<string[]> {
  const uploadPromises = files.map(file => uploadFile(file));
  return Promise.all(uploadPromises);
}

export async function deleteFile(url: string): Promise<void> {
  // Extract file path from URL
  const pathMatch = url.match(/uploads\/(.+)$/);
  if (!pathMatch) {
    throw new Error('Invalid file URL');
  }
  
  // File deletion can be handled server-side if needed
  // For now, we'll just return success
  return Promise.resolve();
}

// CRUD Operations
export async function createDocument(collectionName: string, data: any): Promise<string> {
  // Map collection names to API table names
  const tableMap: Record<string, string> = {
    'settings': 'settings',
    'settings_head': 'settings_head',
    'settings_homepage': 'settings_homepage',
  };
  
  const tableName = tableMap[collectionName] || collectionName;
  const response = await apiRequest<{ id: string | number }>('crud.php?table=' + tableName, {
    method: 'POST',
    body: data,
  });
  return response.id.toString();
}

export async function updateDocument(collectionName: string, id: string, data: any): Promise<void> {
  const tableMap: Record<string, string> = {
    'settings': 'settings',
    'settings_head': 'settings_head',
    'settings_homepage': 'settings_homepage',
  };
  
  const tableName = tableMap[collectionName] || collectionName;
  await apiRequest('crud.php?table=' + tableName + '&id=' + id, {
    method: 'PUT',
    body: data,
  });
}

export async function setDocument(collectionName: string, id: string, data: any): Promise<void> {
  // Check if exists, then update or create
  try {
    await getDocument(collectionName, id);
    await updateDocument(collectionName, id, data);
  } catch {
    await createDocument(collectionName, { ...data, id });
  }
}

export async function deleteDocument(collectionName: string, id: string): Promise<void> {
  await apiRequest('crud.php?table=' + collectionName + '&id=' + id, {
    method: 'DELETE',
  });
}

export async function getDocument(collectionName: string, id: string): Promise<any> {
  const tableMap: Record<string, string> = {
    'settings': 'settings',
    'settings_head': 'settings_head',
    'settings_homepage': 'settings_homepage',
  };
  
  const tableName = tableMap[collectionName] || collectionName;
  return apiRequest('crud.php?table=' + tableName + '&id=' + id);
}

export async function getDocuments(
  collectionName: string,
  filters?: { field: string; operator: any; value: any }[],
  orderByField?: string,
  orderDirection: 'asc' | 'desc' = 'desc',
  limitCount?: number
): Promise<any[]> {
  const tableMap: Record<string, string> = {
    'settings': 'settings',
    'settings_head': 'settings_head',
    'settings_homepage': 'settings_homepage',
  };
  
  const tableName = tableMap[collectionName] || collectionName;
  const params = new URLSearchParams();
  if (filters && filters.length > 0) {
    params.append('filters', JSON.stringify(filters));
  }
  if (orderByField) {
    params.append('orderBy', orderByField);
    params.append('orderDir', orderDirection.toUpperCase());
  }
  if (limitCount) {
    params.append('limit', limitCount.toString());
  }

  const response = await apiRequest<any[]>('crud.php?table=' + tableName + '&' + params.toString());
  
  // Convert timestamps
  return response.map(item => ({
    ...item,
    createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
    updatedAt: item.updatedAt ? new Date(item.updatedAt) : new Date(),
    publishedAt: item.publishedAt ? new Date(item.publishedAt) : undefined,
  }));
}

// Real-time subscription simulation (polling)
export function subscribeToCollection(
  collectionName: string,
  callback: (docs: any[]) => void,
  filters?: { field: string; operator: any; value: any }[],
  orderByField?: string,
  orderDirection: 'asc' | 'desc' = 'desc'
): () => void {
  let isActive = true;
  
  const poll = async () => {
    if (!isActive) return;
    
    try {
      const docs = await getDocuments(collectionName, filters, orderByField, orderDirection);
      callback(docs);
    } catch (error) {
      console.error('Subscription error:', error);
    }
    
    if (isActive) {
      setTimeout(poll, 2000); // Poll every 2 seconds
    }
  };
  
  poll();
  
  return () => {
    isActive = false;
  };
}

export function subscribeToDocument(
  collectionName: string,
  id: string,
  callback: (doc: any | null) => void
): () => void {
  let isActive = true;
  
  const poll = async () => {
    if (!isActive) return;
    
    try {
      const doc = await getDocument(collectionName, id);
      callback(doc);
    } catch (error) {
      callback(null);
    }
    
    if (isActive) {
      setTimeout(poll, 2000);
    }
  };
  
  poll();
  
  return () => {
    isActive = false;
  };
}

// Helper functions for timestamp conversion
export function convertTimestamp(timestamp: any): Date {
  if (timestamp instanceof Date) {
    return timestamp;
  }
  if (typeof timestamp === 'string') {
    return new Date(timestamp);
  }
  return new Date();
}

export function toFirestoreTimestamp(date: Date | string): Date {
  if (typeof date === 'string') {
    return new Date(date);
  }
  return date;
}

