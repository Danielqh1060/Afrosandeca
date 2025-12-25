import api from './axios';
import { Post, CreatePostDto, Section } from '../types';

export const postsApi = {
  getAll: async () => {
    const response = await api.get<Post[]>('/posts');
    return response.data;
  },

  create: async (data: CreatePostDto) => {
    const response = await api.post<Post>('/posts', data);
    return response.data;
  },
};