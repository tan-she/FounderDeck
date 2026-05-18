import api from './axios';

export const getPosts = (params) => api.get('/posts', { params });
export const getMyPosts = (params) => api.get('/posts/mine', { params });
export const getPost = (id) => api.get(`/posts/${id}`);
export const createPost = (data, config = {}) => api.post('/posts', data, config);
export const updatePost = (id, data, config = {}) => api.post(`/posts/${id}`, data, config); // changed to post for FormData with _method=PATCH
export const deletePost = (id) => api.delete(`/posts/${id}`);
export const enhancePitch = (data) => api.post('/ai/enhance-pitch', data);

