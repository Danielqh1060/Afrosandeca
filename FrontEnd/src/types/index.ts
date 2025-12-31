export interface User {
  id: string;
  email: string;
  role: string;
  fullName: string;
}

export interface Section {
  id: number;
  name: string;
  slug: string;
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  parentId: string | null;
  author: {
    id: string;
    fullName: string;
    role: string;
  };
  reactions: { userId: string }[];
  _count?: { reactions: number };
}

export interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  author: User;
  sections: Section[];
  attachments: {
    id: string;
    url: string;
    type: string;
  }[];
  comments: Comment[];
  reactions: {
    userId: string;
    createdAt: string;
  }[];
}

export interface CreatePostDto {
  title: string;
  content: string;
  sectionIds: number[];
  imageUrls?: string[];
}