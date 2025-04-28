// src/utils/emailService.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();
// Create a transporter using environment variables
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

/**
 * Send an email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text email content
 * @param {string} options.html - HTML email content (optional)
 * @returns {Promise} - Nodemailer response
 */
export const sendEmail = async (options) => {
  const mailOptions = {
    from: `"ExploreMates" <${process.env.EMAIL_USER}>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html || undefined
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

/**
 * Send a connection request email to trip creator
 * @param {Object} data - Connection data
 * @param {Object} data.sender - User sending the request
 * @param {Object} data.recipient - Trip creator
 * @param {Object} data.trip - Trip details
 * @param {string} data.message - Connection message
 * @returns {Promise} - Nodemailer response
 */
export const sendConnectionRequestEmail = async (data) => {
  const { sender, recipient, trip, message } = data;
  
  const subject = `New connection request from ${sender.name} about your trip to ${trip.destination}`;
  
  // Create HTML content with styling
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <div style="background: linear-gradient(to right, #4f46e5, #3b82f6); padding: 15px; border-radius: 5px 5px 0 0;">
        <h2 style="color: white; margin: 0;">Trip Connection Request</h2>
      </div>
      
      <div style="padding: 20px;">
        <p>Hello ${recipient.name},</p>
        
        <p><strong>${sender.name}</strong> is interested in connecting with you about your trip:</p>
        
        <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <h3 style="margin-top: 0; color: #4f46e5;">${trip.title}</h3>
          <p><strong>Destination:</strong> ${trip.destination}</p>
          <p><strong>Duration:</strong> ${trip.duration}</p>
        </div>
        
        <div style="background-color: #f0f9ff; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #3b82f6;">
          <h4 style="margin-top: 0;">Message from ${sender.name}:</h4>
          <p style="margin-bottom: 0;">${message}</p>
        </div>
        
        <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <h4 style="margin-top: 0;">Contact Information:</h4>
          <p><strong>Name:</strong> ${sender.name}</p>
          ${sender.phone ? `<p><strong>Phone:</strong> ${sender.phone}</p>` : ''}
          ${sender.age ? `<p><strong>Age:</strong> ${sender.age}</p>` : ''}
          <p><strong>Email:</strong> ${sender.email}</p>
        </div>
        
        <p>You can reply directly to this email to get in touch with ${sender.name}.</p>
        
        <p>Happy travels!</p>
        <p>The ExploreMates Team</p>
      </div>
      
      <div style="background-color: #f9fafb; padding: 10px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 5px 5px;">
        <p>&copy; ${new Date().getFullYear()} ExploreMates. All rights reserved.</p>
      </div>
    </div>
  `;
  
  // Plain text alternative
  const text = `
    Trip Connection Request
    
    Hello ${recipient.name},
    
    ${sender.name} is interested in connecting with you about your trip:
    
    ${trip.title}
    Destination: ${trip.destination}
    Duration: ${trip.duration}
    
    Message from ${sender.name}:
    ${message}
    
    Contact Information:
    Name: ${sender.name}
    ${sender.phone ? `Phone: ${sender.phone}\n` : ''}
    ${sender.age ? `Age: ${sender.age}\n` : ''}
    Email: ${sender.email}
    
    You can reply directly to this email to get in touch with ${sender.name}.
    
    Happy travels!
    The Travel Buddy Team
  `;
  
  return sendEmail({
    to: recipient.email,
    subject,
    text,
    html
  });
};