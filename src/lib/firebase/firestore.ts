import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  QueryConstraint,
  FirestoreError,
  setDoc,
  FieldValue,
  increment
} from 'firebase/firestore';
import { db } from '../firebase';
import { Post, Comment, TrashItem } from '@/types';

// Posts Collection - Updated to match your existing collection
const POSTS_COLLECTION = 'journal_entries';
const COMMENTS_COLLECTION = 'comments';
const TRASH_COLLECTION = 'trash';
const USER_REACTIONS_COLLECTION = 'user_reactions';

// Trash retention period (12 months in milliseconds)
const TRASH_RETENTION_PERIOD = 12 * 30 * 24 * 60 * 60 * 1000; // 12 months

// Post operations
export async function createPost(postData: Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'reactions'>): Promise<string> {
  try {
    console.log('Creating post:', postData.title);
    const docRef = await addDoc(collection(db, POSTS_COLLECTION), {
      ...postData,
      reactions: {
        like: 0,
        love: 0,
        laugh: 0,
        wow: 0,
        sad: 0,
        angry: 0,
      },
      shareCount: 0,
      commentCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log('Post created successfully with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    const firestoreError = error as FirestoreError;
    console.error('Error creating post:', {
      code: firestoreError.code,
      message: firestoreError.message
    });
    
    if (firestoreError.code === 'permission-denied') {
      throw new Error('You do not have permission to create posts. Please check your authentication.');
    } else if (firestoreError.code === 'unavailable') {
      throw new Error('Firestore is currently unavailable. Please try again later.');
    }
    
    throw error;
  }
}

export async function getPosts(filters?: {
  tags?: string[];
  searchQuery?: string;
  limitCount?: number;
}): Promise<Post[]> {
  try {
    console.log('Fetching posts with filters:', filters);
    console.log('Using collection:', POSTS_COLLECTION);
    
    // Try to get posts without ordering first to avoid index issues
    let q;
    try {
      const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')];
      
      if (filters?.limitCount) {
        constraints.push(limit(filters.limitCount));
      }
      
      q = query(collection(db, POSTS_COLLECTION), ...constraints);
    } catch (indexError) {
      console.warn('Ordered query failed, trying simple query:', indexError);
      // Fallback to simple query without ordering
      q = query(collection(db, POSTS_COLLECTION), ...(filters?.limitCount ? [limit(filters.limitCount)] : []));
    }
    
    console.log('Executing Firestore query...');
    const querySnapshot = await getDocs(q);
    
    console.log(`Found ${querySnapshot.docs.length} posts in Firestore`);
    
    let posts = querySnapshot.docs.map(doc => {
      const data = doc.data();
      console.log('Processing post:', doc.id, data.title || 'No title');
      return {
        id: doc.id,
        ...data,
        // Handle different date field formats
        date: data.date?.toDate?.() || data.date || new Date(),
        createdAt: data.createdAt?.toDate?.() || data.createdAt || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt || new Date(),
        // Ensure required fields exist
        title: data.title || 'Untitled',
        content: data.content || '',
        tags: data.tags || [],
        reactions: data.reactions || { like: 0, love: 0, laugh: 0, wow: 0, sad: 0, angry: 0 },
        mood: data.mood || 'neutral',
        shareCount: data.shareCount || 0,
        commentCount: data.commentCount || 0
      };
    }) as Post[];

    // Sort manually if we couldn't use orderBy
    posts.sort((a, b) => {
      const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
      const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime();
    });

    // Client-side filtering for complex queries
    if (filters?.tags && filters.tags.length > 0) {
      const originalCount = posts.length;
      posts = posts.filter(post => 
        filters.tags!.some(tag => post.tags.includes(tag))
      );
      console.log(`Filtered by tags: ${originalCount} -> ${posts.length} posts`);
    }

    if (filters?.searchQuery) {
      const originalCount = posts.length;
      const searchLower = filters.searchQuery.toLowerCase();
      posts = posts.filter(post =>
        post.title.toLowerCase().includes(searchLower) ||
        post.content.toLowerCase().includes(searchLower) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
      console.log(`Filtered by search: ${originalCount} -> ${posts.length} posts`);
    }

    console.log(`Returning ${posts.length} posts`);
    return posts;
  } catch (error) {
    const firestoreError = error as FirestoreError;
    console.error('Error getting posts:', {
      code: firestoreError.code,
      message: firestoreError.message
    });
    
    if (firestoreError.code === 'permission-denied') {
      console.warn('Permission denied for reading posts. This might be due to Firestore security rules.');
      throw new Error('Unable to fetch posts. Please check your permissions.');
    } else if (firestoreError.code === 'unavailable') {
      throw new Error('Firestore is currently unavailable. Please try again later.');
    }
    
    throw error;
  }
}

export async function getPost(id: string): Promise<Post | null> {
  try {
    console.log('Fetching post with ID:', id);
    const docRef = doc(db, POSTS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log('Post found:', data.title);
      return {
        id: docSnap.id,
        ...data,
        date: data.date?.toDate?.() || data.date || new Date(),
        createdAt: data.createdAt?.toDate?.() || data.createdAt || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt || new Date(),
      } as Post;
    }
    
    console.log('Post not found');
    return null;
  } catch (error) {
    const firestoreError = error as FirestoreError;
    console.error('Error getting post:', {
      code: firestoreError.code,
      message: firestoreError.message
    });
    throw error;
  }
}

export async function updatePost(id: string, updates: Partial<Post>): Promise<void> {
  try {
    console.log('Updating post:', id);
    const docRef = doc(db, POSTS_COLLECTION, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    console.log('Post updated successfully');
  } catch (error) {
    const firestoreError = error as FirestoreError;
    console.error('Error updating post:', {
      code: firestoreError.code,
      message: firestoreError.message
    });
    throw error;
  }
}

export async function deletePost(id: string): Promise<void> {
  try {
    console.log('Deleting post:', id);
    const docRef = doc(db, POSTS_COLLECTION, id);
    await deleteDoc(docRef);
    console.log('Post deleted successfully');
  } catch (error) {
    const firestoreError = error as FirestoreError;
    console.error('Error deleting post:', {
      code: firestoreError.code,
      message: firestoreError.message
    });
    throw error;
  }
}

// Trash/Bin functionality
export async function movePostToTrash(id: string, deletedBy?: string): Promise<void> {
  try {
    console.log('Moving post to trash:', id);
    
    // Get the post data first
    const postDoc = await getDoc(doc(db, POSTS_COLLECTION, id));
    if (!postDoc.exists()) {
      throw new Error('Post not found');
    }
    
    const postData = { id: postDoc.id, ...postDoc.data() } as Post;
    
    // Create trash item
    const trashItem: Omit<TrashItem, 'id'> = {
      type: 'post',
      title: postData.title,
      content: postData.content,
      deletedAt: new Date(),
      deletedBy,
      originalId: id,
      expiresAt: new Date(Date.now() + TRASH_RETENTION_PERIOD),
      metadata: {
        tags: postData.tags,
        mood: postData.mood,
        reactions: postData.reactions
      }
    };
    
    // Add to trash collection
    await addDoc(collection(db, TRASH_COLLECTION), {
      ...trashItem,
      deletedAt: serverTimestamp(),
      expiresAt: new Date(Date.now() + TRASH_RETENTION_PERIOD)
    });
    
    // Delete from original collection
    await deleteDoc(doc(db, POSTS_COLLECTION, id));
    
    console.log('Post moved to trash successfully');
  } catch (error) {
    const firestoreError = error as FirestoreError;
    console.error('Error moving post to trash:', {
      code: firestoreError.code,
      message: firestoreError.message
    });
    throw error;
  }
}

export async function moveCommentToTrash(id: string, deletedBy?: string): Promise<void> {
  try {
    console.log('Moving comment to trash:', id);
    
    // Get the comment data first
    const commentDoc = await getDoc(doc(db, COMMENTS_COLLECTION, id));
    if (!commentDoc.exists()) {
      throw new Error('Comment not found');
    }
    
    const commentData = { id: commentDoc.id, ...commentDoc.data() } as Comment;
    
    // Create trash item
    const trashItem: Omit<TrashItem, 'id'> = {
      type: 'comment',
      title: `Comment on post ${commentData.postId}`,
      content: commentData.text,
      deletedAt: new Date(),
      deletedBy,
      originalId: id,
      expiresAt: new Date(Date.now() + TRASH_RETENTION_PERIOD),
      metadata: {
        postId: commentData.postId,
        isAuthorReply: commentData.isAuthorReply || false,
        reactions: commentData.reactions
      }
    };
    
    // Add to trash collection
    await addDoc(collection(db, TRASH_COLLECTION), {
      ...trashItem,
      deletedAt: serverTimestamp(),
      expiresAt: new Date(Date.now() + TRASH_RETENTION_PERIOD)
    });
    
    // Delete from original collection
    await deleteDoc(doc(db, COMMENTS_COLLECTION, id));
    
    // Decrement the comment count in the post
    if (commentData.postId) {
      await decrementCommentCount(commentData.postId);
    }
    
    console.log('Comment moved to trash successfully');
  } catch (error) {
    const firestoreError = error as FirestoreError;
    console.error('Error moving comment to trash:', {
      code: firestoreError.code,
      message: firestoreError.message
    });
    throw error;
  }
}

export async function restorePostFromTrash(trashId: string): Promise<void> {
  try {
    console.log('Restoring post from trash:', trashId);
    
    // Get the trash item
    const trashDoc = await getDoc(doc(db, TRASH_COLLECTION, trashId));
    if (!trashDoc.exists()) {
      throw new Error('Trash item not found');
    }
    
    const trashData = { id: trashDoc.id, ...trashDoc.data() } as TrashItem;
    
    if (trashData.type !== 'post') {
      throw new Error('Invalid trash item type for post restoration');
    }
    
    // Recreate the post
    const postData: Omit<Post, 'id'> = {
      title: trashData.title,
      content: trashData.content,
      date: new Date(), // Use current date for restored posts
      tags: trashData.metadata?.tags || [],
      mood: trashData.metadata?.mood || '',
      reactions: trashData.metadata?.reactions || {
        like: 0, love: 0, laugh: 0, wow: 0, sad: 0, angry: 0
      },
      shareCount: 0,
      commentCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Add back to posts collection
    await addDoc(collection(db, POSTS_COLLECTION), {
      ...postData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // Remove from trash
    await deleteDoc(doc(db, TRASH_COLLECTION, trashId));
    
    console.log('Post restored successfully');
  } catch (error) {
    const firestoreError = error as FirestoreError;
    console.error('Error restoring post from trash:', {
      code: firestoreError.code,
      message: firestoreError.message
    });
    throw error;
  }
}

export async function restoreCommentFromTrash(trashId: string): Promise<void> {
  try {
    console.log('Restoring comment from trash:', trashId);
    
    // Get the trash item
    const trashDoc = await getDoc(doc(db, TRASH_COLLECTION, trashId));
    if (!trashDoc.exists()) {
      throw new Error('Trash item not found');
    }
    
    const trashData = { id: trashDoc.id, ...trashDoc.data() } as TrashItem;
    
    if (trashData.type !== 'comment') {
      throw new Error('Invalid trash item type for comment restoration');
    }
    
    // Check if the original post still exists
    if (trashData.metadata?.postId) {
      const postDoc = await getDoc(doc(db, POSTS_COLLECTION, trashData.metadata.postId));
      if (!postDoc.exists()) {
        throw new Error('Cannot restore comment: original post no longer exists');
      }
    }
    
    // Recreate the comment
    const commentData: Omit<Comment, 'id'> = {
      postId: trashData.metadata?.postId || '',
      text: trashData.content,
      createdAt: new Date(),
      ipHash: 'restored',
      isAuthorReply: trashData.metadata?.isAuthorReply || false,
      reactions: trashData.metadata?.reactions || {
        like: 0, love: 0, laugh: 0, wow: 0, sad: 0, angry: 0
      }
    };
    
    // Add back to comments collection
    await addDoc(collection(db, COMMENTS_COLLECTION), {
      ...commentData,
      createdAt: serverTimestamp()
    });
    
    // Increment the comment count in the post
    if (trashData.metadata?.postId) {
      await incrementCommentCount(trashData.metadata.postId);
    }
    
    // Remove from trash
    await deleteDoc(doc(db, TRASH_COLLECTION, trashId));
    
    console.log('Comment restored successfully');
  } catch (error) {
    const firestoreError = error as FirestoreError;
    console.error('Error restoring comment from trash:', {
      code: firestoreError.code,
      message: firestoreError.message
    });
    throw error;
  }
}

export async function getTrashItems(): Promise<TrashItem[]> {
  try {
    console.log('Fetching trash items');
    const q = query(
      collection(db, TRASH_COLLECTION),
      orderBy('deletedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const trashItems: TrashItem[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      trashItems.push({
        id: doc.id,
        ...data,
        deletedAt: data.deletedAt?.toDate() || new Date(),
        expiresAt: data.expiresAt?.toDate() || new Date()
      } as TrashItem);
    });
    
    console.log(`Fetched ${trashItems.length} trash items`);
    return trashItems;
  } catch (error) {
    const firestoreError = error as FirestoreError;
    console.error('Error fetching trash items:', {
      code: firestoreError.code,
      message: firestoreError.message
    });
    throw error;
  }
}

export async function permanentlyDeleteTrashItem(trashId: string): Promise<void> {
  try {
    console.log('Permanently deleting trash item:', trashId);
    await deleteDoc(doc(db, TRASH_COLLECTION, trashId));
    console.log('Trash item permanently deleted');
  } catch (error) {
    const firestoreError = error as FirestoreError;
    console.error('Error permanently deleting trash item:', {
      code: firestoreError.code,
      message: firestoreError.message
    });
    throw error;
  }
}

export async function cleanupExpiredTrashItems(): Promise<number> {
  try {
    console.log('Cleaning up expired trash items');
    const now = new Date();
    const q = query(
      collection(db, TRASH_COLLECTION),
      where('expiresAt', '<=', now)
    );
    
    const querySnapshot = await getDocs(q);
    let deletedCount = 0;
    
    const deletePromises = querySnapshot.docs.map(async (doc) => {
      await deleteDoc(doc.ref);
      deletedCount++;
    });
    
    await Promise.all(deletePromises);
    
    console.log(`Cleaned up ${deletedCount} expired trash items`);
    return deletedCount;
  } catch (error) {
    const firestoreError = error as FirestoreError;
    console.error('Error cleaning up expired trash items:', {
      code: firestoreError.code,
      message: firestoreError.message
    });
    throw error;
  }
}

// Test database connection
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    console.log('Testing database connection...');
    // Just test that we can create a collection reference
    collection(db, 'test');
    console.log('Database connection test successful');
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}

// Comment operations
export async function createComment(commentData: Omit<Comment, 'id' | 'createdAt' | 'reactions'>): Promise<string> {
  try {
    console.log('Creating comment for post:', commentData.postId);
    
    // Get location data if not provided
    let locationData = {};
    if (!commentData.ipAddress) {
      try {
        // Get visitor info for location tracking
        const { getVisitorInfo } = await import('../analytics');
        const visitorInfo = await getVisitorInfo();
        locationData = {
          ipAddress: visitorInfo.ipAddress,
          city: visitorInfo.location.city,
          country: visitorInfo.location.country,
          isp: visitorInfo.location.isp,
          timezone: visitorInfo.location.timezone,
        };
      } catch (locationError) {
        console.warn('Could not get location data for comment:', locationError);
        // Continue without location data
      }
    }
    
    const docRef = await addDoc(collection(db, COMMENTS_COLLECTION), {
      ...commentData,
      ...locationData,
      reactions: {
        like: 0,
        love: 0,
        laugh: 0,
        wow: 0,
        sad: 0,
        angry: 0,
      },
      createdAt: serverTimestamp(),
    });
    
    // Increment the comment count in the post
    await incrementCommentCount(commentData.postId);
    
    console.log('Comment created successfully');
    return docRef.id;
  } catch (error) {
    const firestoreError = error as FirestoreError;
    console.error('Error creating comment:', {
      code: firestoreError.code,
      message: firestoreError.message
    });
    throw error;
  }
}

export async function createAuthorReply(commentData: Omit<Comment, 'id' | 'createdAt' | 'reactions' | 'isAuthorReply'>): Promise<string> {
  try {
    console.log('Creating author reply for post:', commentData.postId);
    const authorReplyData = {
      ...commentData,
      isAuthorReply: true,
      reactions: {
        like: 0,
        love: 0,
        laugh: 0,
        wow: 0,
        sad: 0,
        angry: 0,
      },
      createdAt: serverTimestamp(),
    };
    console.log('Author reply data:', authorReplyData);
    const docRef = await addDoc(collection(db, COMMENTS_COLLECTION), authorReplyData);
    
    // Increment the comment count in the post
    await incrementCommentCount(commentData.postId);
    
    console.log('Author reply created successfully');
    return docRef.id;
  } catch (error) {
    const firestoreError = error as FirestoreError;
    console.error('Error creating author reply:', {
      code: firestoreError.code,
      message: firestoreError.message
    });
    throw error;
  }
}

export async function getCommentsByPostId(postId: string): Promise<Comment[]> {
  try {
    console.log('Fetching comments for post:', postId);
    console.log('Using comments collection:', COMMENTS_COLLECTION);
    console.log('Database instance:', db);
    
    // Start with the simplest possible query
    console.log('Creating simple query without ordering...');
    const q = query(
      collection(db, COMMENTS_COLLECTION),
      where('postId', '==', postId)
    );
    
    console.log('Executing query...');
    const querySnapshot = await getDocs(q);
    console.log('Query executed successfully, processing results...');
    
    const comments = querySnapshot.docs.map(doc => {
      const data = doc.data();
      console.log('Processing comment doc:', doc.id, data);
      return {
        id: doc.id,
        postId: data.postId,
        text: data.text,
        ipHash: data.ipHash,
        isAuthorReply: data.isAuthorReply || false,
        createdAt: data.createdAt?.toDate?.() || data.createdAt || new Date(),
        reactions: data.reactions || {
          like: 0,
          love: 0,
          laugh: 0,
          wow: 0,
          sad: 0,
          angry: 0,
        },
        // Include location data
        ipAddress: data.ipAddress,
        city: data.city,
        country: data.country,
        isp: data.isp,
        timezone: data.timezone,
      };
    }) as Comment[];
    
    // Sort manually by creation date
    comments.sort((a, b) => {
      const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
      const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime();
    });
    
    console.log(`Found ${comments.length} comments for post ${postId}`);
    return comments;
  } catch (error) {
    console.error('Error getting comments:', error);
    
    // Check if it's a FirestoreError
    if (error && typeof error === 'object' && 'code' in error) {
      const firestoreError = error as FirestoreError;
      console.error('Firestore error details:', {
        code: firestoreError.code,
        message: firestoreError.message
      });
      
      if (firestoreError.code === 'permission-denied') {
        console.warn('Permission denied for reading comments. Check Firestore security rules.');
        throw new Error('Unable to fetch comments. Please check your permissions.');
      } else if (firestoreError.code === 'failed-precondition') {
        console.warn('Missing index for comments query. Creating simple query fallback.');
        // Return empty array for now
        return [];
      }
    }
    
    // For any other error, return empty array to prevent UI crashes
    console.warn('Returning empty comments array due to error');
    return [];
  }
}

export async function updateComment(id: string, updates: Partial<Comment>): Promise<void> {
  try {
    console.log('Updating comment:', id);
    const docRef = doc(db, COMMENTS_COLLECTION, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    console.log('Comment updated successfully');
  } catch (error) {
    const firestoreError = error as FirestoreError;
    console.error('Error updating comment:', {
      code: firestoreError.code,
      message: firestoreError.message
    });
    throw error;
  }
}

export async function deleteComment(id: string): Promise<void> {
  try {
    console.log('Deleting comment:', id);
    
    // Get the comment first to know which post to decrement
    const commentDocRef = doc(db, COMMENTS_COLLECTION, id);
    const commentDoc = await getDoc(commentDocRef);
    
    if (commentDoc.exists()) {
      const commentData = commentDoc.data();
      const postId = commentData.postId;
      
      // Delete the comment
      await deleteDoc(commentDocRef);
      
      // Decrement the comment count in the post
      if (postId) {
        await decrementCommentCount(postId);
      }
    }
    
    console.log('Comment deleted successfully');
  } catch (error) {
    const firestoreError = error as FirestoreError;
    console.error('Error deleting comment:', {
      code: firestoreError.code,
      message: firestoreError.message
    });
    throw error;
  }
}

// Reaction operations
export async function updatePostReactions(postId: string, reactions: { like: number; love: number; laugh: number; wow: number; sad: number; angry: number }): Promise<void> {
  try {
    console.log('Updating reactions for post:', postId);
    const docRef = doc(db, POSTS_COLLECTION, postId);
    await updateDoc(docRef, { reactions });
    console.log('Reactions updated successfully');
  } catch (error) {
    const firestoreError = error as FirestoreError;
    console.error('Error updating reactions:', {
      code: firestoreError.code,
      message: firestoreError.message
    });
    throw error;
  }
}

// Comment reaction operations
export async function updateCommentReactions(commentId: string, reactions: { like: number; love: number; laugh: number; wow: number; sad: number; angry: number }): Promise<void> {
  try {
    console.log('Updating reactions for comment:', commentId);
    const docRef = doc(db, COMMENTS_COLLECTION, commentId);
    await updateDoc(docRef, { reactions });
    console.log('Comment reactions updated successfully');
  } catch (error) {
    const firestoreError = error as FirestoreError;
    console.error('Error updating comment reactions:', {
      code: firestoreError.code,
      message: firestoreError.message
    });
    throw error;
  }
}

// User reaction tracking (to prevent multiple reactions from same user)
export async function getUserReaction(userId: string, postId?: string, commentId?: string): Promise<string | null> {
  try {
    const identifier = postId ? `post_${postId}` : `comment_${commentId}`;
    const docRef = doc(db, USER_REACTIONS_COLLECTION, `${userId}_${identifier}`);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data().reactionType;
    }
    return null;
  } catch (error) {
    console.error('Error getting user reaction:', error);
    return null;
  }
}

export async function setUserReaction(userId: string, reactionType: string, postId?: string, commentId?: string): Promise<void> {
  try {
    const identifier = postId ? `post_${postId}` : `comment_${commentId}`;
    const docRef = doc(db, USER_REACTIONS_COLLECTION, `${userId}_${identifier}`);
    
    // Only include fields that have values to avoid undefined values in Firestore
    const reactionData: {
      userId: string;
      reactionType: string;
      createdAt: FieldValue;
      postId?: string;
      commentId?: string;
    } = {
      userId,
      reactionType,
      createdAt: serverTimestamp(),
    };
    
    if (postId) {
      reactionData.postId = postId;
    }
    
    if (commentId) {
      reactionData.commentId = commentId;
    }
    
    await setDoc(docRef, reactionData);
  } catch (error) {
    console.error('Error setting user reaction:', error);
    throw error;
  }
}

export async function removeUserReaction(userId: string, postId?: string, commentId?: string): Promise<void> {
  try {
    const identifier = postId ? `post_${postId}` : `comment_${commentId}`;
    const docRef = doc(db, USER_REACTIONS_COLLECTION, `${userId}_${identifier}`);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error removing user reaction:', error);
    throw error;
  }
}

// Share count operations
export async function incrementShareCount(postId: string): Promise<void> {
  try {
    console.log('Incrementing share count for post:', postId);
    const docRef = doc(db, POSTS_COLLECTION, postId);
    await updateDoc(docRef, {
      shareCount: increment(1)
    });
    console.log('Share count incremented successfully');
  } catch (error) {
    const firestoreError = error as FirestoreError;
    console.error('Error incrementing share count:', {
      code: firestoreError.code,
      message: firestoreError.message
    });
    throw error;
  }
}

// Comment count operations
export async function incrementCommentCount(postId: string): Promise<void> {
  try {
    console.log('Incrementing comment count for post:', postId);
    const docRef = doc(db, POSTS_COLLECTION, postId);
    await updateDoc(docRef, {
      commentCount: increment(1)
    });
    console.log('Comment count incremented successfully');
  } catch (error) {
    const firestoreError = error as FirestoreError;
    console.error('Error incrementing comment count:', {
      code: firestoreError.code,
      message: firestoreError.message
    });
    throw error;
  }
}

export async function decrementCommentCount(postId: string): Promise<void> {
  try {
    console.log('Decrementing comment count for post:', postId);
    const docRef = doc(db, POSTS_COLLECTION, postId);
    await updateDoc(docRef, {
      commentCount: increment(-1)
    });
    console.log('Comment count decremented successfully');
  } catch (error) {
    const firestoreError = error as FirestoreError;
    console.error('Error decrementing comment count:', {
      code: firestoreError.code,
      message: firestoreError.message
    });
    throw error;
  }
}

// Sync comment count with actual number of comments
export async function syncCommentCount(postId: string): Promise<number> {
  try {
    console.log('Syncing comment count for post:', postId);
    
    // Get actual comment count
    const q = query(
      collection(db, COMMENTS_COLLECTION),
      where('postId', '==', postId)
    );
    const querySnapshot = await getDocs(q);
    const actualCount = querySnapshot.size;
    
    // Update the post's comment count
    const postDocRef = doc(db, POSTS_COLLECTION, postId);
    await updateDoc(postDocRef, {
      commentCount: actualCount
    });
    
    console.log(`Comment count synced for post ${postId}: ${actualCount}`);
    return actualCount;
  } catch (error) {
    const firestoreError = error as FirestoreError;
    console.error('Error syncing comment count:', {
      code: firestoreError.code,
      message: firestoreError.message
    });
    throw error;
  }
}

// Sync all posts' comment counts
export async function syncAllCommentCounts(): Promise<{ synced: number; errors: number }> {
  try {
    console.log('Syncing comment counts for all posts...');
    
    // Get all posts
    const postsQuery = query(collection(db, POSTS_COLLECTION));
    const postsSnapshot = await getDocs(postsQuery);
    
    let synced = 0;
    let errors = 0;
    
    // Process each post
    for (const postDoc of postsSnapshot.docs) {
      try {
        await syncCommentCount(postDoc.id);
        synced++;
      } catch (error) {
        console.error(`Error syncing comment count for post ${postDoc.id}:`, error);
        errors++;
      }
    }
    
    console.log(`Comment count sync completed: ${synced} synced, ${errors} errors`);
    return { synced, errors };
  } catch (error) {
    const firestoreError = error as FirestoreError;
    console.error('Error syncing all comment counts:', {
      code: firestoreError.code,
      message: firestoreError.message
    });
    throw error;
  }
}

// Sync reaction counts with actual user reactions
export async function syncReactionCounts(postId: string): Promise<{ like: number; love: number; laugh: number; wow: number; sad: number; angry: number }> {
  try {
    console.log('Syncing reaction counts for post:', postId);
    
    // Get all user reactions for this post
    const q = query(
      collection(db, USER_REACTIONS_COLLECTION),
      where('postId', '==', postId)
    );
    const querySnapshot = await getDocs(q);
    
    // Count reactions by type
    const reactionCounts = {
      like: 0,
      love: 0,
      laugh: 0,
      wow: 0,
      sad: 0,
      angry: 0,
    };
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const reactionType = data.reactionType as keyof typeof reactionCounts;
      if (reactionCounts.hasOwnProperty(reactionType)) {
        reactionCounts[reactionType]++;
      }
    });
    
    // Update the post's reaction counts
    const postDocRef = doc(db, POSTS_COLLECTION, postId);
    await updateDoc(postDocRef, {
      reactions: reactionCounts
    });
    
    console.log(`Reaction counts synced for post ${postId}:`, reactionCounts);
    return reactionCounts;
  } catch (error) {
    const firestoreError = error as FirestoreError;
    console.error('Error syncing reaction counts:', {
      code: firestoreError.code,
      message: firestoreError.message
    });
    throw error;
  }
}

// Sync all posts' reaction counts
export async function syncAllReactionCounts(): Promise<{ synced: number; errors: number }> {
  try {
    console.log('Syncing reaction counts for all posts...');
    
    // Get all posts
    const postsQuery = query(collection(db, POSTS_COLLECTION));
    const postsSnapshot = await getDocs(postsQuery);
    
    let synced = 0;
    let errors = 0;
    
    // Process each post
    for (const postDoc of postsSnapshot.docs) {
      try {
        await syncReactionCounts(postDoc.id);
        synced++;
      } catch (error) {
        console.error(`Error syncing reaction counts for post ${postDoc.id}:`, error);
        errors++;
      }
    }
    
    console.log(`Reaction count sync completed: ${synced} synced, ${errors} errors`);
    return { synced, errors };
  } catch (error) {
    const firestoreError = error as FirestoreError;
    console.error('Error syncing all reaction counts:', {
      code: firestoreError.code,
      message: firestoreError.message
    });
    throw error;
  }
} 