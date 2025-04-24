import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
});

export const signUp = (data) => api.post('/auth/sign-up', data);
export const signIn = (data) => api.post('/auth/sign-in', data);
export const signOut = () => api.post('/auth/sign-out');
export const getUser = () => api.get('/users/me');
export const updateUser = (data) => api.put('/users/me', data);
export const getUserSubscriptions = () => api.get('/users/me/subscriptions');
export const getSubscriptions = () => api.get('/subscriptions');
export const createSubscription = (data) => api.post('/subscriptions', data);
// Add more API functions as needed

export default api;
