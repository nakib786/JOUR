# Trash/Bin System Documentation

## Overview

The Kahani Roz application now includes a comprehensive trash/bin system that provides a safety net for deleted posts and comments. Instead of permanently deleting content immediately, items are moved to a trash collection where they can be restored within 12 months.

## Features

### 🗑️ Soft Deletion
- Posts and comments are moved to trash instead of being permanently deleted
- Original data is preserved with metadata about the deletion
- Deletion timestamp and user information is tracked

### 🔄 Restoration
- Items can be restored from trash within 12 months
- Restored posts maintain their original content, tags, and metadata
- Restored comments are linked back to their original posts (if they still exist)

### ⏰ Automatic Cleanup
- Items are automatically deleted after 12 months in trash
- Daily cleanup process runs automatically when the app loads
- Manual cleanup option available in admin interface

### 📊 Trash Management
- Dedicated admin interface for managing trash items
- Search and filter capabilities
- Visual indicators for expired and expiring items
- Bulk cleanup operations

## Technical Implementation

### Database Structure

#### Trash Collection (`trash`)
```typescript
interface TrashItem {
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
    reactions?: ReactionCounts;
  };
}
```

### Key Functions

#### Firestore Functions
- `movePostToTrash(id, deletedBy)` - Move post to trash
- `moveCommentToTrash(id, deletedBy)` - Move comment to trash
- `restorePostFromTrash(trashId)` - Restore post from trash
- `restoreCommentFromTrash(trashId)` - Restore comment from trash
- `getTrashItems()` - Get all trash items
- `permanentlyDeleteTrashItem(trashId)` - Permanently delete item
- `cleanupExpiredTrashItems()` - Remove expired items

#### Utility Functions
- `autoCleanupTrash()` - Automatic cleanup with error handling
- `shouldRunCleanup()` - Check if cleanup should run
- `runAutoCleanupIfNeeded()` - Run cleanup if needed

### Security Rules

```javascript
// Firestore Rules
match /trash/{trashId} {
  allow read, write: if request.auth != null;
}
```

## User Experience

### For Regular Users
- Deletion confirmations now mention trash and restoration
- No visible changes to the main interface
- Content appears deleted but can be restored by admins

### For Administrators
- New "Trash" tab in admin dashboard
- Visual indicators for item status:
  - 🔴 **Expired**: Items past 12 months (red badge)
  - 🟡 **Expiring Soon**: Items expiring within 30 days (yellow badge)
- Search and filter capabilities
- Restore and permanent delete options
- Bulk cleanup for expired items

## Retention Policy

- **Retention Period**: 12 months from deletion date
- **Automatic Cleanup**: Daily check for expired items
- **Manual Cleanup**: Available through admin interface
- **Grace Period**: 30-day warning for items expiring soon

## Error Handling

### Restoration Errors
- **Post Restoration**: Creates new post with original content
- **Comment Restoration**: Checks if original post still exists
- **Missing Dependencies**: Clear error messages for failed restorations

### Cleanup Errors
- Graceful handling of network issues
- Logging for debugging
- Partial success reporting

## Monitoring

### Automatic Cleanup
- Runs once per day maximum
- Uses localStorage to track last cleanup time
- Logs cleanup results to console

### Admin Interface
- Real-time statistics
- Expiration warnings
- Manual refresh capability

## Best Practices

### For Administrators
1. **Regular Monitoring**: Check trash tab weekly
2. **Expired Cleanup**: Run manual cleanup for expired items
3. **Restoration Requests**: Handle user restoration requests promptly
4. **Data Backup**: Consider backing up important items before permanent deletion

### For Developers
1. **Error Handling**: Always wrap trash operations in try-catch
2. **User Feedback**: Provide clear success/error messages
3. **Testing**: Test restoration scenarios thoroughly
4. **Performance**: Monitor trash collection size

## Future Enhancements

### Potential Features
- Email notifications for expiring items
- Bulk restoration capabilities
- Export functionality for trash items
- Advanced filtering options
- Restoration history tracking

### Performance Optimizations
- Pagination for large trash collections
- Background cleanup jobs
- Compressed storage for old items
- Archive system for very old items

## Troubleshooting

### Common Issues

1. **Restoration Fails**
   - Check if original post exists (for comments)
   - Verify user permissions
   - Check network connectivity

2. **Cleanup Not Running**
   - Check localStorage for last cleanup time
   - Verify automatic cleanup component is loaded
   - Check console for error messages

3. **Items Not Appearing in Trash**
   - Verify Firestore security rules
   - Check user authentication
   - Confirm trash collection permissions

### Debug Commands

```javascript
// Check last cleanup time
localStorage.getItem('lastTrashCleanup');

// Force cleanup
import { autoCleanupTrash } from '@/lib/utils/trashCleanup';
autoCleanupTrash();

// Check trash items
import { getTrashItems } from '@/lib/firebase/firestore';
getTrashItems();
```

## Migration Notes

### Existing Data
- No migration needed for existing posts/comments
- New deletions will use trash system
- Old permanent deletions cannot be recovered

### Deployment
1. Deploy Firestore security rules
2. Deploy application code
3. Test trash functionality
4. Monitor automatic cleanup

---

*This trash system provides a robust safety net while maintaining data hygiene through automatic cleanup. It balances user safety with storage efficiency.* 