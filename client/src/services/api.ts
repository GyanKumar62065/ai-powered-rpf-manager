import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Vendors
export const getVendors = () => api.get('/vendors');
export const createVendor = (data: any) => api.post('/vendors', data);
export const updateVendor = (id: string, data: any) => api.put(`/vendors/${id}`, data);
export const deleteVendor = (id: string) => api.delete(`/vendors/${id}`);

// RFPs
export const getRFPs = () => api.get('/rfps');
export const getRFP = (id: string) => api.get(`/rfps/${id}`);
export const createRFP = (data: any) => api.post('/rfps', data);
export const sendRFP = (id: string, vendorIds: string[]) => api.post(`/rfps/${id}/send`, { vendorIds });
export const updateRFPStatus = (id: string, status: string) => api.patch(`/rfps/${id}/status`, { status });
export const deleteRFP = (id: string) => api.delete(`/rfps/${id}`);

// Proposals
export const getProposals = (rfpId?: string) => api.get('/proposals', { params: { rfpId } });
export const compareProposals = (rfpId: string) => api.get(`/proposals/compare/${rfpId}`);

// Email
export const syncEmails = () => api.post('/emails/sync');
export const checkEmailHealth = () => api.get('/emails/health');

export default api;
