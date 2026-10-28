import Inquiry from '../models/Inquiry.js';
import brevoService from '../services/brevoService.js';

export const submitInquiry = async (req, res) => {
  try {
    const { name, email, phone, category, message } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Please enter your full name (at least 2 characters).' });
    }

    const cleanEmail = email ? email.trim().toLowerCase() : '';
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    const cleanPhone = phone ? phone.trim().replace(/[\s-]/g, '').replace(/^(?:\+?91)/, '') : '';
    if (!cleanPhone || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid 10-digit mobile number.' });
    }

    if (!message || message.trim().length < 5) {
      return res.status(400).json({ success: false, message: 'Please elaborate on your inquiry or assistance needed (minimum 5 characters).' });
    }

    const inquiry = new Inquiry({
      name: name.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      category: category ? category.trim() : 'General Inquiries',
      message: message.trim()
    });

    await inquiry.save();

    // Optional admin notification via Brevo
    try {
      if (brevoService.isConfigured) {
        await brevoService.sendEmail({
          toEmail: brevoService.adminNotificationEmail,
          toName: 'Support Desk Admin',
          subject: `[New Inquiry ${inquiry.inquiryNumber}] ${inquiry.category} - ${inquiry.name}`,
          htmlContent: `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #E2E8F0; border-radius: 6px;">
              <h3 style="color: #4A0F1B; margin-top: 0;">New Devotee Inquiry Received</h3>
              <p><strong>Inquiry #:</strong> ${inquiry.inquiryNumber}</p>
              <p><strong>Name:</strong> ${inquiry.name}</p>
              <p><strong>Phone:</strong> ${inquiry.phone}</p>
              <p><strong>Email:</strong> ${inquiry.email}</p>
              <p><strong>Category:</strong> ${inquiry.category}</p>
              <p><strong>Message:</strong></p>
              <blockquote style="background: #F8FAFC; padding: 12px; border-left: 4px solid #E4B655;">
                ${inquiry.message}
              </blockquote>
            </div>
          `,
          templateType: 'INQUIRY_ALERT'
        });
      }
    } catch (mailErr) {
      console.warn('[InquiryController] Email alert error:', mailErr.message);
    }

    return res.status(201).json({
      success: true,
      message: 'Thank you! Your inquiry has been submitted successfully. Our team will contact you shortly.',
      data: inquiry
    });
  } catch (err) {
    console.error('[InquiryController] Error submitting inquiry:', err);
    return res.status(500).json({ success: false, message: 'Failed to submit inquiry. Please try again.' });
  }
};

export const getInquiries = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, category, search } = req.query;

    const query = {};
    if (status) query.status = status;
    if (category) query.category = category;

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { inquiryNumber: searchRegex },
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { message: searchRegex }
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [inquiries, total, newCount, inProgressCount, resolvedCount] = await Promise.all([
      Inquiry.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Inquiry.countDocuments(query),
      Inquiry.countDocuments({ status: 'NEW' }),
      Inquiry.countDocuments({ status: 'IN_PROGRESS' }),
      Inquiry.countDocuments({ status: 'RESOLVED' })
    ]);

    return res.status(200).json({
      success: true,
      data: {
        inquiries,
        pagination: {
          total,
          page: pageNum,
          pages: Math.ceil(total / limitNum) || 1,
          limit: limitNum
        },
        stats: {
          totalAll: await Inquiry.countDocuments(),
          newCount,
          inProgressCount,
          resolvedCount
        }
      }
    });
  } catch (err) {
    console.error('[InquiryController] Error fetching inquiries:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateInquiryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const inquiry = await Inquiry.findById(id);
    if (!inquiry) {
      return res.status(404).json({ success: false, message: 'Inquiry not found' });
    }

    if (status) {
      inquiry.status = status;
      if (status === 'RESOLVED' || status === 'CLOSED') {
        inquiry.resolvedBy = req.adminUser ? req.adminUser.name : 'Admin';
        inquiry.resolvedAt = new Date();
      }
    }

    if (adminNotes !== undefined) {
      inquiry.adminNotes = adminNotes;
    }

    await inquiry.save();

    return res.status(200).json({
      success: true,
      message: 'Inquiry updated successfully',
      data: inquiry
    });
  } catch (err) {
    console.error('[InquiryController] Error updating inquiry:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteInquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const inquiry = await Inquiry.findByIdAndDelete(id);

    if (!inquiry) {
      return res.status(404).json({ success: false, message: 'Inquiry not found' });
    }

    return res.status(200).json({
      success: true,
      message: `Inquiry ${inquiry.inquiryNumber} deleted successfully`
    });
  } catch (err) {
    console.error('[InquiryController] Error deleting inquiry:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
