import { create } from 'zustand';
import { request } from '../api/client';

export const useAuth = create((set) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token'),
  login: async (email, password) => {
    const data = await request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    localStorage.setItem('token', data.token); localStorage.setItem('user', JSON.stringify(data.user)); set(data);
  },
  register: async (name, email, password) => {
    const data = await request('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) });
    localStorage.setItem('token', data.token); localStorage.setItem('user', JSON.stringify(data.user)); set(data);
  },
  logout: () => { localStorage.clear(); set({ user: null, token: null }); }
}));
