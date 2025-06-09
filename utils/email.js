const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.sendDonationConfirmation = async (email, { amount, charityName, donationId }) => {
  const msg = {
    to: email,
    from: process.env.SENDGRID_FROM_EMAIL,
    subject: 'Donation Confirmation',
    html: `
      <h1>Thank you for your donation!</h1>
      <p>Your donation of $${amount} to ${charityName} has been processed successfully.</p>
      <p>Donation ID: ${donationId}</p>
      <p>You can view your donation receipt by logging into your account.</p>
    `
  };

  try {
    await sgMail.send(msg);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

exports.sendCharityApprovalNotification = async (email, { charityName, isApproved }) => {
  const msg = {
    to: email,
    from: process.env.SENDGRID_FROM_EMAIL,
    subject: `Charity Registration ${isApproved ? 'Approved' : 'Rejected'}`,
    html: `
      <h1>Charity Registration Update</h1>
      <p>Your charity "${charityName}" has been ${isApproved ? 'approved' : 'rejected'}.</p>
      ${isApproved 
        ? '<p>You can now start receiving donations through our platform.</p>' 
        : '<p>Please contact our support team for more information.</p>'}
    `
  };

  try {
    await sgMail.send(msg);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

exports.sendDonationReminder = async (email, { userName, lastDonationDate }) => {
  const msg = {
    to: email,
    from: process.env.SENDGRID_FROM_EMAIL,
    subject: 'Continue Supporting Great Causes',
    html: `
      <h1>Hello ${userName}!</h1>
      <p>We noticed your last donation was on ${new Date(lastDonationDate).toLocaleDateString()}.</p>
      <p>There are many charities that could benefit from your support. Visit our platform to explore worthy causes.</p>
    `
  };

  try {
    await sgMail.send(msg);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

exports.sendImpactReportNotification = async (email, { charityName, reportTitle }) => {
  const msg = {
    to: email,
    from: process.env.SENDGRID_FROM_EMAIL,
    subject: 'New Impact Report Available',
    html: `
      <h1>New Impact Report from ${charityName}</h1>
      <p>A new impact report "${reportTitle}" has been published.</p>
      <p>Login to your account to see how your donations are making a difference.</p>
    `
  };

  try {
    await sgMail.send(msg);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};