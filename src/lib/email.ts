import { db } from './firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export interface EmailTemplate {
  subject: string;
  htmlContent: string;
  textContent: string;
}

export interface NewPostNotification {
  postTitle: string;
  postExcerpt: string;
  postUrl: string;
  authorName?: string;
  publishedDate: string;
}

/**
 * Get all active subscribers from the database
 */
export async function getActiveSubscribers(): Promise<string[]> {
  try {
    const subscribersRef = collection(db, 'subscribers');
    const activeSubscribersQuery = query(
      subscribersRef, 
      where('isActive', '==', true)
    );
    
    const querySnapshot = await getDocs(activeSubscribersQuery);
    const emails: string[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.email) {
        emails.push(data.email);
      }
    });
    
    return emails;
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    throw new Error('Failed to fetch subscribers');
  }
}

/**
 * Generate email template for new post notification
 */
export function generateNewPostEmailTemplate(notification: NewPostNotification): EmailTemplate {
  const { postTitle, postExcerpt, postUrl, authorName, publishedDate } = notification;
  
  const subject = `New Story: ${postTitle} - Kahani Roz`;
  
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f9fafb; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #f43f5e, #ec4899); padding: 40px 20px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 600; }
        .header p { color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px; }
        .content { padding: 40px 20px; }
        .post-title { font-size: 24px; font-weight: 600; color: #1f2937; margin: 0 0 16px 0; line-height: 1.3; }
        .post-meta { color: #6b7280; font-size: 14px; margin-bottom: 20px; }
        .post-excerpt { color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 30px; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #f43f5e, #ec4899); color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px; }
        .cta-button:hover { opacity: 0.9; }
        .footer { background-color: #f9fafb; padding: 30px 20px; text-align: center; border-top: 1px solid #e5e7eb; }
        .footer p { color: #6b7280; font-size: 14px; margin: 0; }
        .footer a { color: #f43f5e; text-decoration: none; }
        .unsubscribe { margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Kahani Roz</h1>
          <p>A Story Every Day</p>
        </div>
        
        <div class="content">
          <h2 class="post-title">${postTitle}</h2>
          
          <div class="post-meta">
            ${authorName ? `By ${authorName} • ` : ''}Published on ${publishedDate}
          </div>
          
          <div class="post-excerpt">
            ${postExcerpt}
          </div>
          
          <a href="${postUrl}" class="cta-button">Read Full Story</a>
        </div>
        
        <div class="footer">
          <p>Thank you for being part of our storytelling community!</p>
          <div class="unsubscribe">
            <p>
              <a href="{{unsubscribe_url}}">Unsubscribe</a> from these notifications
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const textContent = `
Kahani Roz - A Story Every Day

New Story: ${postTitle}

${authorName ? `By ${authorName}` : ''}
Published on ${publishedDate}

${postExcerpt}

Read the full story: ${postUrl}

---
Thank you for being part of our storytelling community!

To unsubscribe from these notifications, visit: {{unsubscribe_url}}
  `.trim();
  
  return {
    subject,
    htmlContent,
    textContent
  };
}

/**
 * Send email to subscribers (placeholder function)
 * You'll need to implement this with your preferred email service
 */
export async function sendEmailToSubscribers(
  emails: string[], 
  template: EmailTemplate
): Promise<{ success: boolean; message: string }> {
  // This is a placeholder function. You'll need to implement this with your email service.
  // Popular options include:
  // - SendGrid
  // - Mailgun  
  // - AWS SES
  // - Resend
  // - Nodemailer with SMTP
  
  console.log('Email sending not implemented yet');
  console.log('Recipients:', emails.length);
  console.log('Subject:', template.subject);
  
  // Example implementation with SendGrid:
  /*
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  
  const msg = {
    to: emails,
    from: 'noreply@yourdomain.com',
    subject: template.subject,
    text: template.textContent,
    html: template.htmlContent,
  };
  
  try {
    await sgMail.sendMultiple(msg);
    return { success: true, message: `Email sent to ${emails.length} subscribers` };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, message: 'Failed to send emails' };
  }
  */
  
  return { 
    success: false, 
    message: 'Email sending not configured. Please implement sendEmailToSubscribers function.' 
  };
}

/**
 * Notify all subscribers about a new post
 */
export async function notifySubscribersOfNewPost(
  notification: NewPostNotification
): Promise<{ success: boolean; message: string; emailsSent?: number }> {
  try {
    // Get all active subscribers
    const subscribers = await getActiveSubscribers();
    
    if (subscribers.length === 0) {
      return { success: true, message: 'No active subscribers to notify', emailsSent: 0 };
    }
    
    // Generate email template
    const template = generateNewPostEmailTemplate(notification);
    
    // Send emails
    const result = await sendEmailToSubscribers(subscribers, template);
    
    return {
      ...result,
      emailsSent: result.success ? subscribers.length : 0
    };
    
  } catch (error) {
    console.error('Error notifying subscribers:', error);
    return { 
      success: false, 
      message: 'Failed to notify subscribers of new post' 
    };
  }
}

// Example usage:
/*
// When a new post is published, call this function:
await notifySubscribersOfNewPost({
  postTitle: "My Amazing Story",
  postExcerpt: "This is a brief excerpt of the story...",
  postUrl: "https://yourdomain.com/stories/my-amazing-story",
  authorName: "John Doe",
  publishedDate: "December 15, 2024"
});
*/ 