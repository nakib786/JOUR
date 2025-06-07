# Author Reply Feature Testing Guide

## Overview
The author reply feature allows administrators to reply to user comments from the admin dashboard, with these replies being clearly marked as "Author" responses.

## How to Test

### 1. Access Admin Dashboard
1. Navigate to `/admin`
2. Sign in with admin credentials
3. Go to the "Comments" tab

### 2. Test Author Reply Creation

#### Method 1: Use Test Button (Development Only)
- In development mode, there's a "Create Test Author Reply" button in the comments section
- Click this button to create a test author reply
- The reply should appear with an "Author" badge

#### Method 2: Reply to Existing Comments
1. Find any regular comment (without "Author" badge)
2. Click the Reply button (📤 icon) next to the comment
3. Enter your reply text in the form that appears
4. Click "Post Reply"
5. The new reply should appear with an "Author" badge

### 3. Visual Verification
Author replies should display:
- **Admin Dashboard**: Blue "Author" badge next to the comment text
- **Public Comments**: 
  - Different avatar icon (✍️ instead of 👤)
  - Blue "Author" badge
  - Slightly different styling

### 4. Expected Behavior
- ✅ Author replies show "Author" badge
- ✅ Regular comments show Reply button
- ✅ Author replies do NOT show Reply button (can't reply to author replies)
- ✅ Author replies are properly stored in database with `isAuthorReply: true`
- ✅ Author replies can be deleted/restored like regular comments

## Troubleshooting

### If "Author" Label Not Showing
1. Check browser console for errors
2. Verify the comment has `isAuthorReply: true` in the database
3. Ensure you're using the latest code with the updated `getCommentsByPostId` function
4. Try creating a new author reply using the test button

### Database Structure
Author replies should have this structure in Firestore:
```json
{
  "id": "comment_id",
  "postId": "post_id", 
  "text": "Reply text",
  "isAuthorReply": true,
  "ipHash": "admin_email",
  "createdAt": "timestamp",
  "reactions": {
    "like": 0,
    "love": 0,
    // ... other reactions
  }
}
```

## Implementation Details
- Author replies are created using `createAuthorReply()` function
- They automatically set `isAuthorReply: true`
- Visual distinction is handled in both `CommentCard` component and admin dashboard
- Proper trash/restore functionality is maintained 