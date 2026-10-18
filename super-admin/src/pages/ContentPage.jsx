import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import Button from '../components/atoms/Button';
import FormField from '../components/molecules/FormField';
import { Save, Plus, Trash2, CheckCircle2 } from 'lucide-react';

export const ContentPage = () => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const fetchContent = async () => {
    try {
      setLoading(true);
      const res = await adminService.getContent();
      if (res.success && res.data) {
        setContent(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!content?.product) return;

    setSaving(true);
    setMessage('');
    try {
      const res = await adminService.updateContent({
        productUpdates: {
          name: content.product.name,
          tamilTitle: content.product.tamilTitle,
          description: content.product.description,
          eventLocation: content.product.eventLocation,
          insideBoxConfig: content.product.insideBoxConfig,
          contents: content.product.contents,
          temples: content.product.temples,
          certificateConfig: content.product.certificateConfig,
          contactConfig: content.product.contactConfig
        }
      });

      if (res.success) {
        setMessage('Website content updated successfully! Public storefront is now live with your changes.');
        setTimeout(() => setMessage(''), 6000);
      }
    } catch (err) {
      alert('Error updating content: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Blessed Contents Handlers
  const updateContentItem = (index, field, value) => {
    const newItems = [...(content.product.contents || [])];
    newItems[index] = { ...newItems[index], [field]: value };
    setContent({
      ...content,
      product: { ...content.product, contents: newItems }
    });
  };

  const addContentItem = () => {
    const current = content.product.contents || [];
    setContent({
      ...content,
      product: {
        ...content.product,
        contents: [...current, { qty: '1×', title: '', description: '' }]
      }
    });
  };

  const removeContentItem = (index) => {
    const newItems = (content.product.contents || []).filter((_, i) => i !== index);
    setContent({
      ...content,
      product: { ...content.product, contents: newItems }
    });
  };

  // Pilgrimage Temples Handlers
  const updateTempleItem = (index, field, value) => {
    const newTemples = [...(content.product.temples || [])];
    newTemples[index] = { ...newTemples[index], [field]: value };
    setContent({
      ...content,
      product: { ...content.product, temples: newTemples }
    });
  };

  const addTempleItem = () => {
    const current = content.product.temples || [];
    setContent({
      ...content,
      product: {
        ...content.product,
        temples: [...current, { ta: '', en: '', where: '', flag: '', isFinal: false }]
      }
    });
  };

  const removeTempleItem = (index) => {
    const newTemples = (content.product.temples || []).filter((_, i) => i !== index);
    setContent({
      ...content,
      product: { ...content.product, temples: newTemples }
    });
  };

  // Certificate Verification Points Handlers
  const updateVerificationPoint = (index, value) => {
    const newPoints = [...(content.product.certificateConfig?.verificationPoints || [])];
    newPoints[index] = value;
    setContent({
      ...content,
      product: {
        ...content.product,
        certificateConfig: {
          ...content.product.certificateConfig,
          verificationPoints: newPoints
        }
      }
    });
  };

  const addVerificationPoint = () => {
    const current = content.product.certificateConfig?.verificationPoints || [];
    setContent({
      ...content,
      product: {
        ...content.product,
        certificateConfig: {
          ...content.product.certificateConfig,
          verificationPoints: [...current, '']
        }
      }
    });
  };

  const removeVerificationPoint = (index) => {
    const newPoints = (content.product.certificateConfig?.verificationPoints || []).filter((_, i) => i !== index);
    setContent({
      ...content,
      product: {
        ...content.product,
        certificateConfig: {
          ...content.product.certificateConfig,
          verificationPoints: newPoints
        }
      }
    });
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading content editor...</div>;

  const product = content?.product;

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', color: '#4A0F1B', fontSize: '1.85rem' }}>
          Website Content & Section Editor
        </h1>
        <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: 4 }}>
          Live configuration for Hero headings, Tamil titles, blessed contents, temples, and certificate details.
        </p>
      </div>

      {message && (
        <div style={{ padding: '12px 16px', background: '#DCFCE7', border: '1px solid #86EFAC', color: '#166534', borderRadius: 6, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500 }}>
          <CheckCircle2 size={18} />
          <span>{message}</span>
        </div>
      )}

      {product && (
        <form onSubmit={handleSave} style={{ display: 'grid', gap: 24, maxWidth: 900 }}>
          {/* Hero Section Content */}
          <div className="admin-card">
            <h3>Hero Section Headings</h3>
            <div style={{ display: 'grid', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <FormField
                  id="tamil-title"
                  label="Tamil Title (lang='ta')"
                  value={product.tamilTitle || ''}
                  onChange={(e) => setContent({ ...content, product: { ...product, tamilTitle: e.target.value } })}
                  required
                />
                <FormField
                  id="main-title"
                  label="Main Heading"
                  value={product.name || ''}
                  onChange={(e) => setContent({ ...content, product: { ...product, name: e.target.value } })}
                  required
                />
              </div>

              <FormField
                id="hero-desc"
                label="Product Hero Story Description"
                as="textarea"
                rows={3}
                value={product.description || ''}
                onChange={(e) => setContent({ ...content, product: { ...product, description: e.target.value } })}
                required
              />
            </div>
          </div>

          {/* Product Contents Section ("Inside the Box") */}
          <div className="admin-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <h3 style={{ margin: 0 }}>Inside the Box: Blessed Items ({product.contents?.length || 0} Items)</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: 2, marginBottom: 0 }}>
                  Add, edit, or remove blessed items inside the Pooja Box. The storefront automatically displays all items.
                </p>
              </div>
              <button
                type="button"
                onClick={addContentItem}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 14px',
                  background: '#166534',
                  color: '#FFFFFF',
                  borderRadius: 6,
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Plus size={16} /> Add Blessed Item
              </button>
            </div>

            {/* Section Heading & Subtitle customization */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12, marginBottom: 16, background: '#F8FAFC', padding: 12, borderRadius: 8, border: '1px solid #E2E8F0' }}>
              <FormField
                id="inside-eyebrow"
                label="Section Eyebrow"
                value={product.insideBoxConfig?.eyebrow || 'Inside the box'}
                onChange={(e) => setContent({
                  ...content,
                  product: {
                    ...product,
                    insideBoxConfig: { ...product.insideBoxConfig, eyebrow: e.target.value }
                  }
                })}
                placeholder="Inside the box"
              />
              <FormField
                id="inside-title"
                label="Section Title (leave blank to auto-count items)"
                value={product.insideBoxConfig?.title || ''}
                onChange={(e) => setContent({
                  ...content,
                  product: {
                    ...product,
                    insideBoxConfig: { ...product.insideBoxConfig, title: e.target.value }
                  }
                })}
                placeholder="e.g. Five things, blessed along the way (or leave blank)"
              />
              <div style={{ gridColumn: '1 / -1' }}>
                <FormField
                  id="inside-desc"
                  label="Section Subtitle / Description"
                  as="textarea"
                  rows={2}
                  value={product.insideBoxConfig?.description || ''}
                  onChange={(e) => setContent({
                    ...content,
                    product: {
                      ...product,
                      insideBoxConfig: { ...product.insideBoxConfig, description: e.target.value }
                    }
                  })}
                  placeholder="Everything is packed as one box and travels together from temple to temple, ending at the Maha Yaagam in Thiruttani."
                />
              </div>
            </div>

            {/* List of Blessed Items */}
            <div style={{ display: 'grid', gap: 12 }}>
              {product.contents?.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '85px 1.2fr 2fr 40px',
                    gap: 10,
                    alignItems: 'center',
                    background: '#FFFFFF',
                    padding: '10px 12px',
                    borderRadius: 6,
                    border: '1px solid #CBD5E1'
                  }}
                >
                  <input
                    type="text"
                    value={item.qty}
                    onChange={(e) => updateContentItem(idx, 'qty', e.target.value)}
                    className="admin-input"
                    placeholder="Qty (1×)"
                    title="Quantity badge"
                    required
                  />
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => updateContentItem(idx, 'title', e.target.value)}
                    className="admin-input"
                    placeholder="Item Title (e.g. Rudraksh bracelet)"
                    title="Item title"
                    required
                  />
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateContentItem(idx, 'description', e.target.value)}
                    className="admin-input"
                    placeholder="Short description"
                    title="Item description"
                  />
                  <button
                    type="button"
                    onClick={() => removeContentItem(idx)}
                    title="Remove item"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#EF4444',
                      cursor: 'pointer',
                      padding: 6,
                      borderRadius: 4,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}

              {(!product.contents || product.contents.length === 0) && (
                <div style={{ padding: 16, textAlign: 'center', color: '#64748B', background: '#F8FAFC', borderRadius: 6 }}>
                  No items listed yet. Click "+ Add Blessed Item" to add your first item.
                </div>
              )}
            </div>
          </div>

          {/* Six Temple Journey */}
          <div className="admin-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <h3 style={{ margin: 0 }}>Six-Temple Pilgrimage Cards ({product.temples?.length || 0} Temples)</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: 2, marginBottom: 0 }}>
                  Manage the sequence of temples visited by the sacred Pooja Box.
                </p>
              </div>
              <button
                type="button"
                onClick={addTempleItem}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 14px',
                  background: '#166534',
                  color: '#FFFFFF',
                  borderRadius: 6,
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Plus size={16} /> Add Temple Card
              </button>
            </div>

            <div style={{ display: 'grid', gap: 10 }}>
              {product.temples?.map((temple, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1.2fr 1.2fr 1fr 1.2fr 80px 40px',
                    gap: 10,
                    alignItems: 'center',
                    background: '#FFFFFF',
                    padding: '10px 12px',
                    borderRadius: 6,
                    border: '1px solid #CBD5E1'
                  }}
                >
                  <input
                    type="text"
                    value={temple.ta}
                    onChange={(e) => updateTempleItem(idx, 'ta', e.target.value)}
                    className="admin-input"
                    placeholder="Tamil Name"
                    required
                  />
                  <input
                    type="text"
                    value={temple.en}
                    onChange={(e) => updateTempleItem(idx, 'en', e.target.value)}
                    className="admin-input"
                    placeholder="English Name"
                    required
                  />
                  <input
                    type="text"
                    value={temple.where}
                    onChange={(e) => updateTempleItem(idx, 'where', e.target.value)}
                    className="admin-input"
                    placeholder="Location / District"
                    required
                  />
                  <input
                    type="text"
                    value={temple.flag || ''}
                    onChange={(e) => updateTempleItem(idx, 'flag', e.target.value)}
                    className="admin-input"
                    placeholder="Flag text (e.g. Final Yaagam)"
                  />
                  <label style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', color: '#475569' }}>
                    <input
                      type="checkbox"
                      checked={Boolean(temple.isFinal)}
                      onChange={(e) => updateTempleItem(idx, 'isFinal', e.target.checked)}
                    />
                    Final?
                  </label>
                  <button
                    type="button"
                    onClick={() => removeTempleItem(idx)}
                    title="Remove temple"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#EF4444',
                      cursor: 'pointer',
                      padding: 6,
                      borderRadius: 4,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Authentication Certificate */}
          <div className="admin-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <h3 style={{ margin: 0 }}>Authentication Certificate Details</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: 2, marginBottom: 0 }}>
                  Customize the official authentication certificate details and verification points.
                </p>
              </div>
              <button
                type="button"
                onClick={addVerificationPoint}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 14px',
                  background: '#166534',
                  color: '#FFFFFF',
                  borderRadius: 6,
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Plus size={16} /> Add Verification Point
              </button>
            </div>

            <div style={{ display: 'grid', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <FormField
                  id="cert-auth"
                  label="Certificate Authority"
                  value={product.certificateConfig?.authority || ''}
                  onChange={(e) => setContent({ ...content, product: { ...product, certificateConfig: { ...product.certificateConfig, authority: e.target.value } } })}
                />
                <FormField
                  id="cert-title"
                  label="Certificate Title"
                  value={product.certificateConfig?.title || ''}
                  onChange={(e) => setContent({ ...content, product: { ...product, certificateConfig: { ...product.certificateConfig, title: e.target.value } } })}
                />
                <FormField
                  id="cert-seal"
                  label="Seal Tamil Text"
                  value={product.certificateConfig?.sealText || ''}
                  onChange={(e) => setContent({ ...content, product: { ...product, certificateConfig: { ...product.certificateConfig, sealText: e.target.value } } })}
                />
              </div>

              {/* Verification Points List */}
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#475569', marginBottom: 8 }}>
                  Certificate Verification Points ({product.certificateConfig?.verificationPoints?.length || 0})
                </label>
                <div style={{ display: 'grid', gap: 8 }}>
                  {(product.certificateConfig?.verificationPoints || []).map((point, pIdx) => (
                    <div key={pIdx} style={{ display: 'grid', gridTemplateColumns: '1fr 40px', gap: 8, alignItems: 'center' }}>
                      <input
                        type="text"
                        value={point}
                        onChange={(e) => updateVerificationPoint(pIdx, e.target.value)}
                        className="admin-input"
                        placeholder="e.g. Vibhuti sourced from the six Arupadai temples"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => removeVerificationPoint(pIdx)}
                        title="Remove point"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#EF4444',
                          cursor: 'pointer',
                          padding: 6,
                          borderRadius: 4,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Us Page Configuration */}
          <div className="admin-card">
            <h3>Contact Us Page & Devotee Helplines</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: 16 }}>
              Edit the live numbers, header texts, and description shown on the public Contact Us page (/contact).
            </p>
            <div style={{ display: 'grid', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <FormField
                  id="contact-tamil-title"
                  label="Tamil Title (lang='ta')"
                  value={product.contactConfig?.tamilTitle || ''}
                  onChange={(e) => setContent({ ...content, product: { ...product, contactConfig: { ...product.contactConfig, tamilTitle: e.target.value } } })}
                  placeholder="தொடர்புக்கு / உதவிக்கு"
                />
                <FormField
                  id="contact-main-title"
                  label="Contact Page Main Heading"
                  value={product.contactConfig?.title || ''}
                  onChange={(e) => setContent({ ...content, product: { ...product, contactConfig: { ...product.contactConfig, title: e.target.value } } })}
                  placeholder="Contact Sri Sankara TV"
                />
              </div>

              <FormField
                id="contact-desc"
                label="Text Above Numbers (Introductory Description)"
                as="textarea"
                rows={3}
                value={product.contactConfig?.description || ''}
                onChange={(e) => setContent({ ...content, product: { ...product, contactConfig: { ...product.contactConfig, description: e.target.value } } })}
                placeholder="For any queries regarding the sacred Sathru Samhara Maha Yagam Pooja Box..."
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <FormField
                  id="contact-phone1"
                  label="Primary Devotee Helpline Number *"
                  value={product.contactConfig?.phone1 || ''}
                  onChange={(e) => setContent({ ...content, product: { ...product, contactConfig: { ...product.contactConfig, phone1: e.target.value } } })}
                  placeholder="95917 47001"
                  required
                />
                <FormField
                  id="contact-phone2"
                  label="Secondary Devotee Helpline Number *"
                  value={product.contactConfig?.phone2 || ''}
                  onChange={(e) => setContent({ ...content, product: { ...product, contactConfig: { ...product.contactConfig, phone2: e.target.value } } })}
                  placeholder="95917 47002"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <FormField
                  id="contact-email"
                  label="Support Email"
                  value={product.contactConfig?.email || ''}
                  onChange={(e) => setContent({ ...content, product: { ...product, contactConfig: { ...product.contactConfig, email: e.target.value } } })}
                  placeholder="Srisankaratvshop@gmail.com"
                />
                <FormField
                  id="contact-timings"
                  label="Helpline Support Timings"
                  value={product.contactConfig?.timings || ''}
                  onChange={(e) => setContent({ ...content, product: { ...product, contactConfig: { ...product.contactConfig, timings: e.target.value } } })}
                  placeholder="Monday – Saturday: 9:00 AM – 8:00 PM IST"
                />
              </div>
            </div>
          </div>

          <Button type="submit" loading={saving} style={{ width: 'max-content', padding: '12px 28px', fontSize: '1rem' }}>
            <Save size={18} style={{ marginRight: 8 }} /> Publish Content Changes
          </Button>
        </form>
      )}
    </div>
  );
};

export default ContentPage;
