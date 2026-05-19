import api from './axios';

export const getReceivedCollabs = () => api.get('/collab/received');
export const getSentCollabs = () => api.get('/collab/sent');
export const acceptCollab = (id) => api.patch(`/collab/${id}/accept`);
export const rejectCollab = (id) => api.patch(`/collab/${id}/reject`);
export const withdrawCollab = (id) => api.delete(`/collab/${id}`);
export const cancelCollab = (id) => api.patch(`/collab/${id}/cancel`);
