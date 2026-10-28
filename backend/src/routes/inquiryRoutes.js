import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  submitInquiry,
  getInquiries,
  updateInquiryStatus,
  deleteInquiry
} from '../controllers/inquiryController.js';
import { verifyAdminToken, requireRole } from '../middleware/auth.js';
import { ADMIN_ROLES } from '../config/constants.js';

const router = express.Router();

const inquirySubmitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 10, // max 10 submissions per 15 min per IP
  message: { success: false, message: 'Too many inquiries submitted. Please try again later.' }
});

// Public submission
router.post('/', inquirySubmitLimiter, submitInquiry);

// Admin protected endpoints
router.get('/admin/list', verifyAdminToken, getInquiries);
router.patch('/admin/:id/status', verifyAdminToken, requireRole([ADMIN_ROLES.SUPER_ADMIN, ADMIN_ROLES.ORDER_MANAGER, ADMIN_ROLES.SUPPORT_ADMIN]), updateInquiryStatus);
router.delete('/admin/:id', verifyAdminToken, requireRole([ADMIN_ROLES.SUPER_ADMIN, ADMIN_ROLES.ORDER_MANAGER]), deleteInquiry);

export default router;
