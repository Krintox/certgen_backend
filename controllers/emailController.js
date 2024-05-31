const nodemailer = require('nodemailer');

const sendEmails = async (req, res) => {
  try {
    const { subject, content, recipients } = req.body;

    // Check if recipients are provided
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ message: 'Recipients must be provided as an array' });
    }

    // Log recipients array received
    console.log('Recipients received:', recipients);

    // Set up transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'fullmovies9205@gmail.com',
        pass: 'yybu djqi koef tynx',
      },
    });

    // Iterate over recipients and send email to each one
    for (let recipient of recipients) {
      const { email, attachment } = recipient;

      const mailOptions = {
        from: 'fullmovies9205@gmail.com',
        to: email,
        subject: subject || 'No Subject',
        text: content || 'No Content',
        attachments: [
          {
            filename: attachment.filename,
            content: attachment.content,
            encoding: 'base64'
          }
        ],
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
