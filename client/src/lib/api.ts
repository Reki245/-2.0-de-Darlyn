import { apiRequest } from './queryClient';

export const api = {
  // Auth
  async login(email: string, password: string) {
    const response = await apiRequest('POST', '/api/auth/login', { email, password });
    return response.json();
  },

  // Profile
  async getProfile() {
    const response = await apiRequest('GET', '/api/protected/profile');
    return response.json();
  },

  async updateProfile(updates: any) {
    const response = await apiRequest('PATCH', '/api/protected/profile', updates);
    return response.json();
  },

  async completeOnboarding(data: any) {
    const response = await apiRequest('POST', '/api/protected/onboarding', data);
    return response.json();
  },

  // Activities
  async getActivities(type?: string) {
    const url = type ? `/api/protected/activities?type=${type}` : '/api/protected/activities';
    const response = await apiRequest('GET', url);
    return response.json();
  },

  async getActivity(id: number) {
    const response = await apiRequest('GET', `/api/protected/activities/${id}`);
    return response.json();
  },

  async participateInActivity(activityId: number) {
    const response = await apiRequest('POST', `/api/protected/activities/${activityId}/participate`);
    return response.json();
  },

  async getMyActivities() {
    const response = await apiRequest('GET', '/api/protected/my-activities');
    return response.json();
  },

  // AI Recommendations
  async getRecommendations() {
    const response = await apiRequest('GET', '/api/protected/recommendations');
    return response.json();
  },

  // Certificates
  async getCertificates() {
    const response = await apiRequest('GET', '/api/protected/certificates');
    return response.json();
  },

  async generateQuarterlyCertificate(quarter: string, year: number) {
    const response = await apiRequest('POST', '/api/protected/certificates/quarterly', { quarter, year });
    return response.json();
  },

  // Training
  async getTrainingModules() {
    const response = await apiRequest('GET', '/api/protected/training/modules');
    return response.json();
  },

  async getTrainingProgress() {
    const response = await apiRequest('GET', '/api/protected/training/progress');
    return response.json();
  },

  // Admin
  async uploadUsers(file: File) {
    const formData = new FormData();
    formData.append('excel', file);
    
    const response = await fetch('/api/protected/admin/upload-users', {
      method: 'POST',
      body: formData,
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Upload failed');
    }
    
    return response.json();
  },

  async getOrganizations() {
    const response = await apiRequest('GET', '/api/protected/admin/organizations');
    return response.json();
  },

  async createOrganization(data: any) {
    const response = await apiRequest('POST', '/api/protected/admin/organizations', data);
    return response.json();
  },

  async createActivity(data: any) {
    const response = await apiRequest('POST', '/api/protected/admin/activities', data);
    return response.json();
  },

  async updateActivity(id: number, data: any) {
    const response = await apiRequest('PATCH', `/api/protected/admin/activities/${id}`, data);
    return response.json();
  },

  async getAnalytics() {
    const response = await apiRequest('GET', '/api/protected/admin/analytics');
    return response.json();
  }
};
