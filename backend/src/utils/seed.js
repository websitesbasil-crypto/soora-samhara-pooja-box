import dotenv from 'dotenv';
dotenv.config();

import { connectDB, closeDB } from '../config/db.js';
import Product from '../models/Product.js';
import AdminUser from '../models/AdminUser.js';
import Setting from '../models/Setting.js';
import bcrypt from 'bcryptjs';
import { DEFAULT_PRODUCT, ADMIN_ROLES } from '../config/constants.js';

export const seedDatabase = async () => {
  console.log('[Seed] Seeding database...');

  // 1. Seed or update Product
  let product = await Product.findOne({ slug: DEFAULT_PRODUCT.slug });
  if (!product) {
    product = await Product.findOne({ isActive: true });
  }
  const productData = {
    name: 'Maha Sudarshana Yaagam',
    slug: DEFAULT_PRODUCT.slug,
    tamilTitle: 'மஹா சுதர்சன யாகம்',
    description: 'Register your Sankalpam for the Maha Sudarshana Yaagam, a sacred Vedic fire ritual to Lord Sudarshana, the divine discus of Lord Maha Vishnu, performed by Sri Sankara TV in Tirupathi on the holy day of Vaikunta Ekadesi. Every registered devotee receives a special Sankalpam box of eight sacred items, dispatched by post to the registered address after the Yaagam.',
    priceInPaise: 250000, // ₹2,500.00
    currency: 'INR',
    minQuantity: 1,
    maxQuantity: 20,
    isActive: true,
    eventDate: new Date('2026-12-20T00:00:00+05:30'),
    eventLocation: 'Tirupathi',
    imageUrl: '/Luxury Maroon Murugan Pooja Kit.png',
    contents: [
      { qty: '1×', title: 'Lord Sudarshana & Maha Vishnu Keepsake Idol', description: 'Sacred keepsake idol for your home pooja altar.' },
      { qty: '3×', title: 'Sanctified Brass Prasadam Containers', description: 'Containers with holy offerings blessed during the Yaagam.' },
      { qty: '1×', title: 'Sacred Raksha Thread', description: 'Infused with the protective vibrations of the Sudarshana Maha Mantra.' },
      { qty: '1×', title: 'Sacred Vaikunta Angavastram / Pattu Vastram', description: 'Blessed silk vastram sanctified at the altar.' },
      { qty: '1×', title: 'Authentication Certificate', description: 'Issued by Sri Sankara TV packed inside your box.' }
    ],
    temples: [
      { ta: 'திருப்பதி', en: 'Tirupathi', where: 'Andhra Pradesh', isFinal: true, flag: 'Maha Yaagam · 20 December' }
    ],
    certificateConfig: {
      authority: 'Sri Sankara TV',
      title: 'Authentication Certificate',
      subtitle: 'Maha Sudarshana Yaagam 2026',
      sealText: 'ஓம்',
      caption: 'Illustration of the certificate. Final design may differ.',
      verificationPoints: [
        'Sanctified items blessed at Tirupathi',
        'Box sanctified at the grand Maha Sudarshana Yaagam at Tirupathi on 20 December',
        'Certificate issued by Sri Sankara TV, packed inside your box'
      ]
    },
    insideBoxConfig: {
      eyebrow: 'Inside the box',
      title: '',
      description: 'Everything is packed as one box and sanctified for the divine Maha Sudarshana Yaagam in Tirupathi on 20 December 2026.'
    },
    contactConfig: {
      title: 'Contact Sri Sankara TV',
      tamilTitle: 'தொடர்புக்கு / உதவிக்கு',
      description: 'For any queries regarding the sacred Maha Sudarshana Yaagam Pooja Box, booking assistance, temple travels, or delivery inquiries, our devotional care team is available to assist you.',
      phone1: '95917 47001',
      phone2: '95917 47002',
      email: 'Srisankaratvshop@gmail.com',
      whatsapp: '95917 47001',
      timings: 'Monday – Saturday: 9:00 AM – 8:00 PM IST',
      address: 'Sri Sankara TV Devotional Support Desk'
    }
  };

  if (!product) {
    product = new Product(productData);
    await product.save();
    console.log('[Seed] Created default Maha Sudarshana Yaagam product.');
  } else {
    product.name = productData.name;
    product.tamilTitle = productData.tamilTitle;
    product.description = productData.description;
    product.eventDate = productData.eventDate;
    product.eventLocation = productData.eventLocation;
    if (product.certificateConfig) {
      product.certificateConfig.subtitle = productData.certificateConfig.subtitle;
      product.certificateConfig.verificationPoints = productData.certificateConfig.verificationPoints;
    }
    if (product.insideBoxConfig) {
      product.insideBoxConfig.description = productData.insideBoxConfig.description;
    }
    if (product.contactConfig) {
      product.contactConfig.description = productData.contactConfig.description;
    }
    await product.save();
    console.log('[Seed] Updated existing product to Maha Sudarshana Yaagam.');
  }

  // 2. Seed initial Super Admin
  const adminEmail = (process.env.INITIAL_ADMIN_EMAIL || 'admin@srisankaratv.com').toLowerCase().trim();
  const adminPassword = process.env.INITIAL_ADMIN_PASSWORD || 'SankaraAdmin2026!';
  const adminName = process.env.INITIAL_ADMIN_NAME || 'Super Admin';

  let adminUser = await AdminUser.findOne({ email: adminEmail });
  if (!adminUser) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(adminPassword, salt);

    adminUser = new AdminUser({
      name: adminName,
      email: adminEmail,
      passwordHash,
      role: ADMIN_ROLES.SUPER_ADMIN,
      isActive: true
    });
    await adminUser.save();
    console.log(`[Seed] Created initial Super Admin: ${adminEmail}`);
  } else {
    console.log(`[Seed] Super Admin user ${adminEmail} already exists.`);
  }

  // 3. Seed default Settings
  const defaultSettings = [
    { key: 'countdown_target_date', value: '2026-12-20T00:00:00+05:30', category: 'EVENT', description: 'Countdown target date in ISO format', isPublic: true },
    { key: 'order_desk_whatsapp', value: '919840000000', category: 'CONTACT', description: 'WhatsApp order desk number with country code', isPublic: true },
    { key: 'support_phone', value: '+91 44 2498 0000', category: 'CONTACT', description: 'Support helpline phone number', isPublic: true },
    { key: 'support_email', value: 'orders@srisankaratv.com', category: 'CONTACT', description: 'Customer support email address', isPublic: true }
  ];

  for (const s of defaultSettings) {
    const exists = await Setting.findOne({ key: s.key });
    if (!exists) {
      await Setting.create(s);
      console.log(`[Seed] Created setting: ${s.key}`);
    } else if (s.key === 'countdown_target_date' && exists.value === '2026-11-15T00:00:00+05:30') {
      exists.value = s.value;
      await exists.save();
      console.log(`[Seed] Updated setting: ${s.key} to ${s.value}`);
    }
  }

  console.log('[Seed] Database seeding completed successfully.');
};

// If run directly via command line
if (process.argv[1]?.endsWith('seed.js')) {
  (async () => {
    try {
      await connectDB();
      await seedDatabase();
      await closeDB();
      process.exit(0);
    } catch (err) {
      console.error('[Seed] Error during seeding:', err);
      process.exit(1);
    }
  })();
}
