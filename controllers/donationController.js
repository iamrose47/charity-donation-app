const Razorpay = require('razorpay');
const crypto = require('crypto');
const Donation = require('../models/Donation');
const Charity = require('../models/Charity');
require('dotenv').config();
const sequelize = require('../config/db')
const { sendDonationConfirmation } = require('../utils/email'); // study
const PDFDocument = require('pdfkit');


const razorpay = new Razorpay({
  key_id: process.env.RZP_KEY_ID,
  key_secret: process.env.RZP_KEY_SECRET,
});

// 1. Create Razorpay order
exports.createDonationOrder = async (req, res) => {
  try {
    const { amount, charityId } = req.body;

    const options = {
      amount: amount * 100, // amount in paise
      currency: "INR",
      receipt: `donation_rcpt_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({ orderId: order.id, amount: order.amount, currency: order.currency });
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({ message: 'Failed to create Razorpay order' });
  }
};

// 2. Verify Razorpay payment and save donation
exports.verifyDonation = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      charityId
    } = req.body;

    // Verify payment signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    // Get payment details from Razorpay
    const payment = await razorpay.payments.fetch(razorpay_payment_id);
    const amount = payment.amount / 100; // Convert paise to rupees

    // Start a transaction
    const result = await sequelize.transaction(async (t) => {
      // Create donation record
      const donation = await Donation.create({
        amount,
        UserId: req.user.id, // Changed from req.userId
        CharityId: charityId,
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        status: 'completed'
      }, { transaction: t });

      // Update charity's current amount
      const charity = await Charity.findByPk(charityId, { transaction: t });
      if (!charity) {
        throw new Error('Charity not found');
      }

      // Update charity's current amount using raw SQL to ensure atomic update
      await Charity.update(
        {
          currentAmount: sequelize.literal(`currentAmount + ${amount}`)
        },
        {
          where: { id: charityId },
          transaction: t
        }
      );

      // Send confirmation email
      const user = await User.findByPk(req.user.id);
      await sendDonationConfirmation(user.email, {
        amount,
        charityName: charity.name,
        donationId: donation.id
      });

      return { donation, charity };
    });

    res.json({
      message: "Donation successful",
      donation: result.donation,
      updatedAmount: result.charity.currentAmount + amount
    });

  } catch (err) {
    console.error('Error verifying donation:', err);
    res.status(500).json({ message: err.message });
  }
};

// 3. Fetch user donation history
exports.getDonationHistory = async (req, res) => {
  try {
    const donations = await Donation.findAll({
      where: { UserId: req.user.id }, 
      include: [{
        model: Charity,
        attributes: ['name']
      }],
      order: [['createdAt', 'DESC']]
    });
    res.json(donations);
  } catch (err) {
    console.error('Error fetching donation history:', err);
    res.status(500).json({ message: err.message });
  }
};


// 4. Get receipt for a specific donation
exports.getDonationReceipt = async (req, res) => {
  try {
    const donation = await Donation.findOne({
      where: { 
        id: req.params.id,
        UserId: req.user.id
      },
      include: [
        { model: Charity, attributes: ['name'] },
        { model: User, attributes: ['name', 'email'] }
      ]
    });

    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    // Create PDF receipt
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=donation_receipt_${donation.id}.pdf`);
    doc.pipe(res);

    // Add content to PDF
    doc.fontSize(20).text('Donation Receipt', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12);
    doc.text(`Receipt Number: ${donation.id}`);
    doc.text(`Date: ${donation.createdAt.toLocaleDateString()}`);
    doc.text(`Donor: ${donation.User.name}`);
    doc.text(`Email: ${donation.User.email}`);
    doc.moveDown();
    doc.text(`Charity: ${donation.Charity.name}`);
    doc.text(`Amount: ₹${donation.amount}`);
    doc.text(`Payment ID: ${donation.paymentId}`);
    doc.text(`Order ID: ${donation.orderId}`);
    doc.moveDown();
    doc.text('Thank you for your generous donation!');

    doc.end();
  } catch (err) {
    console.error('Error generating donation receipt:', err);
    res.status(500).json({ message: err.message });
  }
};
