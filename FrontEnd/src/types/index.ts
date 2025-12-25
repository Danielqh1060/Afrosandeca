export interface User {
  email: string;
  fullName: string;
}

export interface Section {
  id: number;
  name: string;
  slug: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  author: User;
  sections: Section[];
}

export interface CreatePostDto {
  title: string;
  content: string;
  sectionIds: number[];
}