import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import Customer from '../models/Customer.js';
import AuditLog from '../models/AuditLog.js';
import razorpayService from './razorpayService.js';
import brevoService from './brevoService.js';
import { ORDER_STATUS, PAYMENT_STATUS, DEFAULT_PRODUCT } from '../config/constants.js';

class OrderService {
  generateOrderNumber() {
    const randomPart = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `SSK-2026-${randomPart}`;
  }

  normalizePhone(phone) {
    return phone.replace(/[\s-]/g, '').replace(/^\+91/, '');
  }

  validatePhone(phone) {
    const cleaned = this.normalizePhone(phone);
    return /^[6-9]\d{9}$/.test(cleaned);
  }

  validatePincode(pin) {
    return /^\d{6}$/.test(pin.trim());
  }

  async getActiveProduct(slug = DEFAULT_PRODUCT.slug) {
    let product = await Product.findOne({ slug, isActive: true });
    if (!product) {
      product = await Product.findOne({ isActive: true });
    }
    return product;
  }

  async createOrder({ productSlug, quantity, customer, sankalpamDetails = [], customerUser = null }) {
    // 1. Validate quantity
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 1 || qty > 20) {
      throw new Error('Quantity must be an integer between 1 and 20.');
    }

    // 2. Validate customer details
    if (!customer || !customer.name || customer.name.trim().length < 2) {
      throw new Error('Enter your full name (minimum 2 characters).');
    }
    if (!customer.phone || !this.validatePhone(customer.phone)) {
      throw new Error('Enter a valid 10-digit Indian mobile number.');
    }
    if (!customer.address || customer.address.trim().length < 8) {
      throw new Error('Enter your full delivery address (minimum 8 characters).');
    }
    if (!customer.city || customer.city.trim().length < 2) {
      throw new Error('Enter your city.');
    }
    if (!customer.state || customer.state.trim().length < 2) {
      throw new Error('Enter your state.');
    }
    if (!customer.pincode || !this.validatePincode(customer.pincode)) {
      throw new Error('Enter a valid 6-digit PIN code.');
    }

    // 2b. Sanitize Sankalpam / Archana details (up to 4 family members)
    let cleanSankalpamDetails = [];
    if (Array.isArray(sankalpamDetails)) {
      cleanSankalpamDetails = sankalpamDetails
        .slice(0, 4)
        .map(person => ({
          name: typeof person?.name === 'string' ? person.name.trim() : '',
          natchathiram: typeof person?.natchathiram === 'string' ? person.natchathiram.trim() : ''
        }))
        .filter(person => person.name.length > 0 || person.natchathiram.length > 0);
    }

    // 3. Retrieve active product price from MongoDB (NEVER trust browser pricing)
    const product = await this.getActiveProduct(productSlug);
    if (!product) {
      throw new Error('Product is currently unavailable.');
    }

    // 4. Calculate total amount in integer paise
    const unitPriceInPaise = product.priceInPaise;
    const subtotalInPaise = qty * unitPriceInPaise;
    const deliveryChargeInPaise = 0; // Free delivery
    const discountInPaise = 0;
    const totalAmountInPaise = subtotalInPaise + deliveryChargeInPaise - discountInPaise;

    // 5. Generate human-readable order number & clean contact
    const orderNumber = this.generateOrderNumber();
    const cleanPhone = this.normalizePhone(customer.phone);

    // 6. Create Razorpay gateway order (DO NOT store in MongoDB until payment succeeds)
    const razorpayOrder = await razorpayService.createOrder({
      orderNumber,
      amountInPaise: totalAmountInPaise,
      currency: product.currency || 'INR',
      notes: {
        orderNumber,
        productName: product.name,
        quantity: String(qty),
        customerName: customer.name.trim(),
        customerPhone: cleanPhone,
        customerEmail: customer.email ? customer.email.trim().toLowerCase() : '',
        city: customer.city.trim(),
        state: customer.state.trim() || 'Tamil Nadu',
        pincode: customer.pincode.trim(),
        sankalpamCount: String(cleanSankalpamDetails.length)
      }
    });

    // 7. Sign a secure draft order token so order details are verified upon payment return
    const draftPayload = {
      orderNumber,
      razorpayOrderId: razorpayOrder.id,
      productId: product._id,
      productName: product.name,
      productSlug: product.slug,
      quantity: qty,
      unitPriceInPaise,
      totalAmountInPaise,
      currency: product.currency || 'INR',
      customer: {
        name: customer.name.trim(),
        phone: cleanPhone,
        email: customer.email ? customer.email.trim().toLowerCase() : '',
        address: customer.address.trim(),
        city: customer.city.trim(),
        state: customer.state.trim() || 'Tamil Nadu',
        pincode: customer.pincode.trim()
      },
      sankalpamDetails: cleanSankalpamDetails,
      customerId: customerUser?._id || null
    };

    const orderToken = jwt.sign(
      draftPayload,
      process.env.ADMIN_JWT_SECRET || 'super_secret_jwt_key_sri_sankara_tv_2026_dev_mode',
      { expiresIn: '24h' }
    );

    // Return session details to frontend. NOTE: No record is created in MongoDB until payment completes.
    return {
      orderNumber,
      razorpayOrderId: razorpayOrder.id,
      amountInPaise: totalAmountInPaise,
      amountInRupees: totalAmountInPaise / 100,
      currency: product.currency || 'INR',
      keyId: razorpayService.getKeyId(),
      productName: product.name,
      quantity: qty,
      customer: draftPayload.customer,
      sankalpamDetails: cleanSankalpamDetails,
      orderToken
    };
  }

  async verifyAndConfirmPayment({ orderNumber, razorpayOrderId, razorpayPaymentId, razorpaySignature, orderToken, customer, quantity, sankalpamDetails }) {
    // 1. Verify HMAC-SHA256 signature
    const isValidSignature = razorpayService.verifyPaymentSignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    });

    if (!isValidSignature) {
      throw new Error('Payment signature verification failed. The transaction could not be verified.');
    }

    // 2. Fetch authoritative gateway payment record
    const gatewayPayment = await razorpayService.fetchPayment(razorpayPaymentId);

    // 3. Check if order is already saved and paid (idempotency)
    let order = await Order.findOne({
      $or: [
        { razorpayOrderId },
        { razorpayPaymentId },
        ...(orderNumber ? [{ orderNumber }] : [])
      ]
    });

    if (order && (order.paymentStatus === PAYMENT_STATUS.CAPTURED || order.paymentStatus === PAYMENT_STATUS.PAID)) {
      console.log(`[OrderService] Order ${order.orderNumber} is already confirmed.`);
      return order;
    }

    // 4. Resolve verified order & customer payload from token or request
    let orderData = null;
    if (orderToken) {
      try {
        orderData = jwt.verify(orderToken, process.env.ADMIN_JWT_SECRET || 'super_secret_jwt_key_sri_sankara_tv_2026_dev_mode');
      } catch (tokErr) {
        console.warn(`[OrderService] Token verification note: ${tokErr.message}`);
      }
    }

    const resolvedOrderNumber = orderData?.orderNumber || orderNumber || `SSK-2026-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const cleanPhone = this.normalizePhone(orderData?.customer?.phone || customer?.phone || gatewayPayment?.contact || '9999999999');
    const resolvedCustomer = {
      name: (orderData?.customer?.name || customer?.name || gatewayPayment?.notes?.customerName || 'Devotee').trim(),
      phone: cleanPhone,
      email: (orderData?.customer?.email || customer?.email || gatewayPayment?.notes?.customerEmail || gatewayPayment?.email || '').trim().toLowerCase(),
      address: (orderData?.customer?.address || customer?.address || 'Provided at checkout').trim(),
      city: (orderData?.customer?.city || customer?.city || gatewayPayment?.notes?.city || 'Chennai').trim(),
      state: (orderData?.customer?.state || customer?.state || gatewayPayment?.notes?.state || 'Tamil Nadu').trim(),
      pincode: (orderData?.customer?.pincode || customer?.pincode || gatewayPayment?.notes?.pincode || '600001').trim()
    };
    const resolvedQty = parseInt(orderData?.quantity || quantity || gatewayPayment?.notes?.quantity || 1, 10);
    const resolvedSankalpam = (Array.isArray(orderData?.sankalpamDetails) && orderData.sankalpamDetails.length > 0)
      ? orderData.sankalpamDetails
      : (Array.isArray(sankalpamDetails) ? sankalpamDetails : []);
    const product = await this.getActiveProduct(orderData?.productSlug);
    const unitPriceInPaise = product.priceInPaise;
    const totalAmountInPaise = resolvedQty * unitPriceInPaise;

    // 5. STORE IN DATABASE ONLY NOW (WHEN PAYMENT IS CONFIRMED AND DONE)
    if (!order) {
      order = new Order({
        orderNumber: resolvedOrderNumber,
        customer: resolvedCustomer,
        sankalpamDetails: resolvedSankalpam,
        customerId: orderData?.customerId || null,
        productId: product._id,
        productName: product.name,
        quantity: resolvedQty,
        unitPriceInPaise,
        subtotalInPaise: totalAmountInPaise,
        deliveryChargeInPaise: 0,
        discountInPaise: 0,
        totalAmountInPaise,
        currency: product.currency || 'INR',
        paymentStatus: PAYMENT_STATUS.PAID,
        orderStatus: ORDER_STATUS.PAID,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        timeline: [
          {
            status: ORDER_STATUS.CREATED,
            note: `Order initiated for ${resolvedQty} box(es).`,
            timestamp: new Date(),
            updatedBy: 'Customer'
          },
          {
            status: ORDER_STATUS.PAID,
            note: `Payment verified successfully via Razorpay (Payment ID: ${razorpayPaymentId}, Method: ${gatewayPayment.method || 'online'}).`,
            timestamp: new Date(),
            updatedBy: 'RazorpayGateway'
          }
        ]
      });
      await order.save();
    } else {
      order.paymentStatus = PAYMENT_STATUS.PAID;
      order.orderStatus = ORDER_STATUS.PAID;
      order.razorpayPaymentId = razorpayPaymentId;
      order.razorpaySignature = razorpaySignature;
      if (resolvedSankalpam.length > 0 && (!order.sankalpamDetails || order.sankalpamDetails.length === 0)) {
        order.sankalpamDetails = resolvedSankalpam;
      }
      order.timeline.push({
        status: ORDER_STATUS.PAID,
        note: `Payment verified successfully via Razorpay (Payment ID: ${razorpayPaymentId}).`,
        timestamp: new Date(),
        updatedBy: 'RazorpayGateway'
      });
      await order.save();
    }

    // 6. Create internal Payment record
    const internalPaymentId = `PAY-${order.orderNumber}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
    const payment = new Payment({
      internalPaymentId,
      orderId: order._id,
      orderNumber: order.orderNumber,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      amountInPaise: order.totalAmountInPaise,
      currency: order.currency,
      status: PAYMENT_STATUS.CAPTURED,
      method: gatewayPayment.method || 'upi',
      bank: gatewayPayment.bank || null,
      wallet: gatewayPayment.wallet || null,
      vpa: gatewayPayment.vpa || null,
      email: gatewayPayment.email || order.customer.email || null,
      contact: gatewayPayment.contact || order.customer.phone || null,
      rawGatewayResponse: gatewayPayment,
      verifiedAt: new Date()
    });
    await payment.save();

    // 7. Upsert Customer profile
    try {
      let customerRecord = await Customer.findOne({ phone: order.customer.phone });
      if (!customerRecord) {
        customerRecord = new Customer({
          name: order.customer.name,
          phone: order.customer.phone,
          email: order.customer.email,
          addresses: [{
            address: order.customer.address,
            city: order.customer.city,
            state: order.customer.state,
            pincode: order.customer.pincode
          }],
          totalOrders: 1,
          totalSpentInPaise: order.totalAmountInPaise,
          lastOrderAt: new Date()
        });
      } else {
        customerRecord.totalOrders += 1;
        customerRecord.totalSpentInPaise += order.totalAmountInPaise;
        customerRecord.lastOrderAt = new Date();
        if (order.customer.email && !customerRecord.email) {
          customerRecord.email = order.customer.email;
        }
      }
      await customerRecord.save();
      order.customerId = customerRecord._id;
      await order.save();
    } catch (custErr) {
      console.warn(`[OrderService] Error upserting customer: ${custErr.message}`);
    }

    // 8. Trigger transactional notifications via Brevo
    try {
      await brevoService.sendOrderConfirmation(order);
      await brevoService.sendAdminNewOrderAlert(order);
      order.notificationStatus.customerEmailSent = Boolean(order.customer.email);
      order.notificationStatus.adminAlertSent = true;
      order.notificationStatus.lastEmailSentAt = new Date();
      await order.save();
    } catch (emailErr) {
      console.error(`[OrderService] Error triggering Brevo emails: ${emailErr.message}`);
      order.notificationStatus.failureReason = emailErr.message;
      await order.save();
    }

    return order;
  }

  async handleRazorpayWebhook({ rawBody, signature, event }) {
    // 1. Verify signature
    const isValid = razorpayService.verifyWebhookSignature({
      rawBody,
      signature
    });

    if (!isValid) {
      console.error('[OrderService] Webhook signature verification failed');
      throw new Error('Invalid webhook signature');
    }

    const eventId = event.id;
    const eventType = event.event;
    console.log(`[OrderService] Processing webhook event: ${eventType} (ID: ${eventId})`);

    const paymentEntity = event.payload?.payment?.entity;
    if (!paymentEntity) {
      return { received: true, ignored: true, reason: 'No payment entity in payload' };
    }

    const razorpayOrderId = paymentEntity.order_id;
    const razorpayPaymentId = paymentEntity.id;

    // Check idempotency on payment record
    let payment = await Payment.findOne({ razorpayOrderId });
    if (payment && payment.webhookEventIds.includes(eventId)) {
      console.log(`[OrderService] Webhook event ${eventId} already processed (idempotent).`);
      return { received: true, duplicate: true };
    }

    let order = await Order.findOne({ razorpayOrderId });
    
    if (eventType === 'payment.captured' || eventType === 'order.paid') {
      if (!order) {
        // Devotee paid but browser closed before verify endpoint finished.
        // Construct and save order as PAID from Razorpay verified notes
        const notes = paymentEntity.notes || {};
        const product = await this.getActiveProduct();
        const quantity = parseInt(notes.quantity || 1, 10);
        const totalAmountInPaise = paymentEntity.amount || (quantity * product.priceInPaise);

        order = new Order({
          orderNumber: notes.orderNumber || `SSK-2026-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
          customer: {
            name: (notes.customerName || 'Devotee').trim(),
            phone: this.normalizePhone(notes.customerPhone || paymentEntity.contact || '9999999999'),
            email: (notes.customerEmail || paymentEntity.email || '').trim().toLowerCase(),
            address: 'Verified via checkout',
            city: (notes.city || 'Chennai').trim(),
            state: (notes.state || 'Tamil Nadu').trim(),
            pincode: (notes.pincode || '600001').trim()
          },
          productId: product._id,
          productName: product.name,
          quantity,
          unitPriceInPaise: product.priceInPaise,
          subtotalInPaise: totalAmountInPaise,
          deliveryChargeInPaise: 0,
          discountInPaise: 0,
          totalAmountInPaise,
          currency: paymentEntity.currency || 'INR',
          paymentStatus: PAYMENT_STATUS.PAID,
          orderStatus: ORDER_STATUS.PAID,
          razorpayOrderId,
          razorpayPaymentId,
          timeline: [
            {
              status: ORDER_STATUS.PAID,
              note: `Payment confirmed via webhook event ${eventType} (${eventId})`,
              timestamp: new Date(),
              updatedBy: 'RazorpayWebhook'
            }
          ]
        });
        await order.save();
      }

      if (!payment) {
        payment = new Payment({
          internalPaymentId: `PAY-${order.orderNumber}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`,
          orderId: order._id,
          orderNumber: order.orderNumber,
          razorpayOrderId
        });
      }

      payment.razorpayPaymentId = razorpayPaymentId;
      payment.amountInPaise = paymentEntity.amount || order.totalAmountInPaise;
      payment.status = PAYMENT_STATUS.CAPTURED;
      payment.method = paymentEntity.method;
      payment.bank = paymentEntity.bank;
      payment.vpa = paymentEntity.vpa;
      payment.webhookEventIds.push(eventId);
      payment.verifiedAt = new Date();
      await payment.save();

      if (order.paymentStatus !== PAYMENT_STATUS.PAID) {
        order.paymentStatus = PAYMENT_STATUS.PAID;
        order.orderStatus = ORDER_STATUS.PAID;
        order.razorpayPaymentId = razorpayPaymentId;
        order.timeline.push({
          status: ORDER_STATUS.PAID,
          note: `Payment confirmed via webhook event ${eventType} (${eventId})`,
          timestamp: new Date(),
          updatedBy: 'RazorpayWebhook'
        });
        await order.save();

        // Brevo email
        await brevoService.sendOrderConfirmation(order);
        await brevoService.sendAdminNewOrderAlert(order);
      }
    } else if (eventType === 'payment.failed') {
      // Do not store abandoned or failed orders in the database
      if (order) {
        order.paymentStatus = PAYMENT_STATUS.FAILED;
        order.timeline.push({
          status: PAYMENT_STATUS.FAILED,
          note: `Payment failed: ${paymentEntity.error_description || 'Unknown error'}`,
          timestamp: new Date(),
          updatedBy: 'RazorpayWebhook'
        });
        await order.save();
      }
    }

    return { received: true, eventType };
  }

  async createManualOrder({
    customerName,
    customerPhone,
    customerEmail,
    password,
    address,
    city,
    state = 'Tamil Nadu',
    pincode,
    quantity = 1,
    amountInRupees = 2500,
    paymentReference = '',
    paymentMethod = 'manual_admin',
    sankalpamDetails = [],
    adminUser
  }) {
    // 1. Validation
    if (!customerName || customerName.trim().length < 2) {
      throw new Error('Enter devotee full name (minimum 2 characters).');
    }
    if (!customerPhone || !this.validatePhone(customerPhone)) {
      throw new Error('Enter a valid 10-digit Indian mobile number.');
    }
    if (!address || address.trim().length < 5) {
      throw new Error('Enter delivery street address (minimum 5 characters).');
    }
    if (!city || city.trim().length < 2) {
      throw new Error('Enter city.');
    }
    if (!pincode || !this.validatePincode(pincode)) {
      throw new Error('Enter a valid 6-digit PIN code.');
    }

    const cleanPhone = this.normalizePhone(customerPhone);
    const cleanEmail = customerEmail ? customerEmail.trim().toLowerCase() : `${cleanPhone}@srisankara.shop`;
    const qty = parseInt(quantity, 10) || 1;
    const totalAmountInPaise = Math.round((parseFloat(amountInRupees) || 2500) * 100);
    const unitPriceInPaise = Math.round(totalAmountInPaise / qty);

    // 2. Resolve Active Product
    const product = await this.getActiveProduct();
    if (!product) {
      throw new Error('Active product not found in database.');
    }

    // 3. Upsert Customer with Password
    let customer = await Customer.findOne({
      $or: [
        { phone: cleanPhone },
        ...(customerEmail ? [{ email: cleanEmail }] : [])
      ]
    });

    if (customer) {
      if (password && password.trim().length >= 6) {
        customer.passwordHash = await bcrypt.hash(password.trim(), 10);
      }
      if (customerEmail && (!customer.email || customer.email.includes('@srisankara.shop'))) {
        customer.email = cleanEmail;
      }
      customer.name = customerName.trim();
      customer.totalOrders += 1;
      customer.totalSpentInPaise += totalAmountInPaise;
      customer.lastOrderAt = new Date();
      await customer.save();
    } else {
      const passwordHash = password && password.trim().length >= 6
        ? await bcrypt.hash(password.trim(), 10)
        : await bcrypt.hash('Sankara2026', 10);

      customer = new Customer({
        name: customerName.trim(),
        phone: cleanPhone,
        email: cleanEmail,
        passwordHash,
        addresses: [{
          address: address.trim(),
          city: city.trim(),
          state: (state || 'Tamil Nadu').trim(),
          pincode: pincode.trim()
        }],
        totalOrders: 1,
        totalSpentInPaise: totalAmountInPaise,
        lastOrderAt: new Date()
      });
      await customer.save();
    }

    // 4. Sanitize Sankalpam Details
    let cleanSankalpamDetails = [];
    if (Array.isArray(sankalpamDetails)) {
      cleanSankalpamDetails = sankalpamDetails
        .slice(0, 4)
        .map(person => ({
          name: typeof person?.name === 'string' ? person.name.trim() : '',
          natchathiram: typeof person?.natchathiram === 'string' ? person.natchathiram.trim() : ''
        }))
        .filter(person => person.name.length > 0 || person.natchathiram.length > 0);
    }

    // 5. Generate Order and Payment IDs
    const orderNumber = this.generateOrderNumber();
    const manualPaymentId = paymentReference?.trim() || `pay_manual_${crypto.randomBytes(5).toString('hex')}`;
    const manualOrderId = `order_manual_${crypto.randomBytes(5).toString('hex')}`;

    // 6. Create Order document
    const order = new Order({
      orderNumber,
      customer: {
        name: customerName.trim(),
        phone: cleanPhone,
        email: customer.email,
        address: address.trim(),
        city: city.trim(),
        state: (state || 'Tamil Nadu').trim(),
        pincode: pincode.trim()
      },
      sankalpamDetails: cleanSankalpamDetails,
      customerId: customer._id,
      productId: product._id,
      productName: product.name,
      quantity: qty,
      unitPriceInPaise,
      subtotalInPaise: totalAmountInPaise,
      deliveryChargeInPaise: 0,
      discountInPaise: 0,
      totalAmountInPaise,
      currency: 'INR',
      paymentStatus: PAYMENT_STATUS.PAID,
      orderStatus: ORDER_STATUS.PAID,
      razorpayOrderId: manualOrderId,
      razorpayPaymentId: manualPaymentId,
      timeline: [
        {
          status: ORDER_STATUS.CREATED,
          note: `Manual booking created by Admin (${adminUser?.name || 'Super Admin'}).`,
          timestamp: new Date(),
          updatedBy: adminUser?.name || 'Super Admin'
        },
        {
          status: ORDER_STATUS.PAID,
          note: `Payment confirmed directly via Admin (Amount: ₹${totalAmountInPaise / 100}, Ref: ${paymentReference || 'Manual/Offline'}).`,
          timestamp: new Date(),
          updatedBy: adminUser?.name || 'Super Admin'
        }
      ]
    });
    await order.save();

    // 7. Create Payment document
    const internalPaymentId = `PAY-${order.orderNumber}-MANUAL`;
    const payment = new Payment({
      internalPaymentId,
      orderId: order._id,
      orderNumber: order.orderNumber,
      razorpayOrderId: manualOrderId,
      razorpayPaymentId: manualPaymentId,
      amountInPaise: totalAmountInPaise,
      currency: 'INR',
      status: PAYMENT_STATUS.CAPTURED,
      method: paymentMethod || 'manual_admin',
      email: customer.email,
      contact: cleanPhone,
      verifiedAt: new Date(),
      isReconciled: true,
      reconciledAt: new Date(),
      rawGatewayResponse: {
        manualBooking: true,
        createdBy: adminUser?.name || 'Super Admin',
        reference: paymentReference || null
      }
    });
    await payment.save();

    // 8. Brevo Transactional Email Alert
    try {
      if (customer.email && !customer.email.includes('@srisankara.shop')) {
        await brevoService.sendOrderConfirmation(order);
      }
    } catch (emailErr) {
      console.warn('[OrderService] Email error on manual order creation:', emailErr.message);
    }

    // 9. Audit Log
    try {
      if (adminUser) {
        await AuditLog.create({
          adminUserId: adminUser._id,
          adminEmail: adminUser.email,
          action: 'CREATE_MANUAL_ORDER',
          targetModel: 'Order',
          targetId: order._id,
          details: {
            orderNumber: order.orderNumber,
            customerName: customer.name,
            customerPhone: customer.phone,
            amountInRupees: totalAmountInPaise / 100,
            paymentReference
          }
        });
      }
    } catch (auditErr) {
      console.warn('[OrderService] Audit log error:', auditErr.message);
    }

    return order;
  }
}

export default new OrderService();
