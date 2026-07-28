import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

export const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'noreply@emporva.com';
export { sgMail };
