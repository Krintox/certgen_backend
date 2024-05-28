const nodemailer = require('nodemailer');

const sendEmails = async (req, res) => {
  try {
    const { subject, content, recipients, attachments } = req.body;

    // Check if recipients and attachments are provided
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0 || !attachments || !Array.isArray(attachments) || attachments.length === 0) {
      return res.status(400).json({ message: 'Recipients and attachments must be provided as arrays' });
    }

    // Log attachments array received
    console.log('Attachments received:', attachments);

    // Set up transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Iterate over recipients and send email to each one
    for (let i = 0; i < recipients.length; i++) {
      const mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: recipients[i],
        subject: subject || 'No Subject',
        text: content || 'No Content',
        attachments: attachments.map((attachment, index) => ({
          filename: `image_${index + 1}.png`,
          content: attachment.content,
          encoding: 'base64'
        }))
      };

      // Send email
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent:', info.response);
    }

    res.status(200).json({ message: 'Emails sent successfully' });
  } catch (error) {
    console.error('Error sending emails:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { sendEmails };
