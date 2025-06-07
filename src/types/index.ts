export interface Post {
  id: string;
  title: string;
  content: string;
  date: Date;
  tags: string[];
  reactions: {
    like: number;
    love: number;
    laugh: number;
    wow: number;
    sad: number;
    angry: number;
  };
  mood: string;
  createdAt: Date;
  updatedAt: Date;
  shareCount?: number;
  commentCount?: number;
}

export interface Comment {
  id: string;
  postId: string;
  text: string;
  createdAt: Date;
  ipHash?: string;
  reactions: {
    like: number;
    love: number;
    laugh: number;
    wow: number;
    sad: number;
    angry: number;
  };
}

// Trash/Bin related interfaces
export interface TrashedPost extends Post {
  deletedAt: Date;
  deletedBy?: string;
  originalId: string;
}

export interface TrashedComment extends Comment {
  deletedAt: Date;
  deletedBy?: string;
  originalId: string;
}

export interface TrashItem {
  id: string;
  type: 'post' | 'comment';
  title: string;
  content: string;
  deletedAt: Date;
  deletedBy?: string;
  originalId: string;
  expiresAt: Date;
  metadata?: {
    tags?: string[];
    mood?: string;
    postId?: string; // For comments
    reactions?: {
      like: number;
      love: number;
      laugh: number;
      wow: number;
      sad: number;
      angry: number;
    };
  };
}

export interface Reaction {
  type: 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry';
  count: number;
}

export interface UserReaction {
  postId?: string;
  commentId?: string;
  reactionType: 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry';
  userId: string; // IP hash or user identifier
}

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export interface FilterOptions {
  tags: string[];
  dateRange: DateRange;
  searchQuery: string;
} 