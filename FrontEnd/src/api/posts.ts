import api from './axios';
import type { Post, CreatePostDto } from '../types';

export const postsApi = {
  getAll: async () => {
    const response = await api.get<Post[]>('/posts');
    return response.data;
  },

  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<{ url: string }>('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.url;
  },

  create: async (data: CreatePostDto) => {
    const response = await api.post<Post>('/posts', data);
    return response.data;
  },

  addComment: async (postId: string, content: string, parentId?: string) => {
    const response = await api.post('/comments', { postId, content, parentId });
    return response.data;
  },

  toggleLike: async (postId: string) => {
    return api.post(`/posts/${postId}/react`);
  },
  
  deletePost: async (postId: string) => {
    return api.delete(`/posts/${postId}`);
  },

  deleteComment: async (commentId: string) => {
    return api.delete(`/comments/${commentId}`);
  },

  toggleCommentLike: async (commentId: string) => {
    return api.post(`/comments/${commentId}/react`);
  },

  
};