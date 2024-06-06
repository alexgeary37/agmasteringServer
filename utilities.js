const nodemailer = require("nodemailer");
const websiteEmailAddress = process.env.EMAIL_ADDRESS;
const websiteUrl = process.env.WEBSITE_URL;
const emailPassword = process.env.EMAIL_PW;

const getServicePrice = (service) => {
  let servicePrice = 0;
  if (service === "Mixing") {
    servicePrice = process.env.MIX_PRICE;
  } else if (service === "Mastering") {
    servicePrice = process.env.MASTER_PRICE;
  } else {
    servicePrice = process.env.MIX_MASTER_PRICE;
  }
  return servicePrice;
};

const sendEmail = async (toEmail, subject, htmlContent) => {
  // Nodemailer transporter
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    auth: {
      user: websiteEmailAddress,
      pass: emailPassword,
    },
    tls: {
      rejectUnauthorized: false, // Accept self-signed certificates
    },
  });

  // Email message options
  const mailOptions = {
    from: websiteEmailAddress, // Sender address
    to: toEmail, // Enquiree email address
    subject: subject, // Subject line
    html: htmlContent,
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
  } catch (error) {
    console.error("Error occurred while sending email:", error);
  }
};

const getUserEmailHtml = (firstName, service, formData) => {
  const altMixesPrice = formData.alternateMixes ? 10 : 0;
  const servicePrice = getServicePrice(service);
  const quote = servicePrice * formData.numberSongs + altMixesPrice;

  // Generated with ChatGPT
  return `
  <table role="presentation" align="center" cellpadding="0" cellspacing="0" width="600" style="margin: auto; border-collapse: collapse; font-family: Arial, sans-serif; font-size: 16px;">
    <tr>
        <td style="padding: 20px 0; text-align: center;">
            <h1 style="margin: 0; color: #007bff;">Payment Confirmation</h1>
        </td>
    </tr>
    <tr>
        <td style="padding: 20px 0;">
            <p>Hi ${firstName},</p>
            <p>Your payment has been successfully processed. Below are the details of your purchase:</p>
            <table width="100%" cellpadding="5" cellspacing="0" style="border: 1px solid #ddd; border-collapse: collapse;">
                <tr style="background-color: #f7f7f7;">
                    <th style="text-align: left; padding: 10px; border: 1px solid #ddd;">Description</th>
                    <th style="text-align: right; padding: 10px; border: 1px solid #ddd; width: 20%;">&nbsp;</th>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd;">${service}</td>
                    <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">$${servicePrice} / song</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd;">Number of songs</td>
                    <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">${formData.numberSongs}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd;">Alternate mixes</td>
                    <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">$${altMixesPrice}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd;"></td>
                    <td style="padding: 10px; padding-top: 20px; text-align: right; border: 1px solid #ddd;"><strong>Total: $${quote}</strong></td>
                </tr>
            </table>
            <p>Below are the details of your form submission:</p>
            <table role="presentation" align="center" cellpadding="0" cellspacing="0" width="600" style="margin: auto;  border-collapse: collapse; font-family: Arial, sans-serif; font-size: 16px;">
                <tr>
                    <td style="padding-top: 10px;">
                        <table width="100%" cellpadding="5" cellspacing="0" style="border: 1px solid #ddd;">
                            <tr style="background-color: #f7f7f7;">
                                <th style="text-align: left; padding: 10px;">Form Submission Details</th>
                            </tr>
                            <tr>
                                <td style="padding: 10px; border-top: 1px solid #ddd;"><strong>Artist name:</strong> ${formData.artistName}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; border-top: 1px solid #ddd;"><strong>Where can I find out more about you?</strong> ${formData.moreAboutYou}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; border-top: 1px solid #ddd;"><strong>Project title:</strong> ${formData.projectTitle}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; border-top: 1px solid #ddd;"><strong>Project type:</strong> ${formData.projectType}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; border-top: 1px solid #ddd;"><strong>How many songs do you want mixed/mastered:</strong> ${formData.numberSongs}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; border-top: 1px solid #ddd;"><strong>Yes I want alternate mixes:</strong> ${formData.alternateMixes}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; border-top: 1px solid #ddd;"><strong>List songs in title order:</strong> ${formData.songTitles}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; border-top: 1px solid #ddd;"><strong>Link to a reference track:</strong> ${formData.referenceTrack}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; border-top: 1px solid #ddd;"><strong>What do you like about this reference track?</strong> ${formData.referenceReason}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; border-top: 1px solid #ddd;"><strong>Additional notes:</strong> ${formData.additionalNotes}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; border-top: 1px solid #ddd;"><strong>How did you find me?</strong> ${formData.foundMe}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; border-top: 1px solid #ddd;"><strong>How you found me (Other):</strong> ${formData.foundMeOther}</td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
            <p>Thank you for your purchase. I look forward to working on your music! If you have any questions or need further assistance, please don't hesitate to contact me at ${websiteEmailAddress}.</p>
            <p style="padding-top:20px">Best regards,<br>AG Mastering</p>
        </td>
    </tr>
    <tr>
        <td style="padding: 20px 0; text-align: center;">
            <a href="${websiteUrl}" style="background-color: #14A098; border: none; color: white; padding: 15px 32px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px;">Back to Website</a>
        </td>
    </tr>
</table>
  `;
};

const getAGMasteringEmailHtml = (
  firstName,
  lastName,
  userEmail,
  service,
  formData
) => {
  const altMixesPrice = formData.alternateMixes ? 10 : 0;
  const servicePrice = getServicePrice(service);
  const quote = servicePrice * formData.numberSongs + altMixesPrice;

  // Generated with ChatGPT
  return `
    <h1>AG Mastering New Purchase Notification</h1>
    <p>A new purchase has been made for <i>${service}</i>. Below are the details of the transaction:</p>
    <ul>
      <li><strong>Client Name:</strong> ${firstName} ${lastName}</li>
      <li><strong>Email:</strong> ${userEmail}</li>
      <li><strong>Description:</strong> ${service}</li>
      <ul>
        <li><strong>Number of Songs:</strong> ${formData.numberSongs}</li>
        <li><strong>Alternate Mixes:</strong> ${formData.alternateMixes}</li>
      </ul>
      <li><strong>Total:</strong> $${quote}</li>
    </ul>
  `;
};

module.exports = {
  sendEmail,
  getUserEmailHtml,
  getAGMasteringEmailHtml,
};
