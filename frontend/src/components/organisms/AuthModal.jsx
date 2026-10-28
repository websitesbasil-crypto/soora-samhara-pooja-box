import React, { useState, useEffect } from 'react';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { Spinner } from '../atoms/Spinner';
import { ArrowLeft, KeyRound, Mail, CheckCircle2 } from 'lucide-react';

export const AuthModal = () => {
  const { authModalOpen, authModalMode, closeAuthModal, login, register, forgotPassword, resetPassword } = useCustomerAuth();

  const [mode, setMode] = useState(authModalMode || 'login'); // 'login' | 'register' | 'forgot' | 'reset'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    identifier: '',
    password: ''
  });
  
  // Forgot / Reset password state
  const [resetIdentifier, setResetIdentifier] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMode(authModalMode || 'login');
    setSubmitError('');
    setSuccessMsg('');
    setErrors({});
  }, [authModalMode, authModalOpen]);

  // Cooldown countdown timer for OTP resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  if (!authModalOpen) return null;

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
    setSubmitError('');
  };

  const validate = () => {
    const errs = {};
    if (mode === 'login') {
      if (!formData.identifier.trim()) {
        errs.identifier = 'Please enter your registered email or mobile number.';
      }
      if (!formData.password) {
        errs.password = 'Please enter your password.';
      }
    } else if (mode === 'register') {
      if (!formData.name.trim() || formData.name.trim().length < 2) {
        errs.name = 'Please enter your full name (at least 2 characters).';
      }
      const cleanPhone = formData.phone.trim().replace(/[\s-]/g, '').replace(/^(?:\+?91)/, '');
      if (!cleanPhone || !/^[6-9]\d{9}$/.test(cleanPhone)) {
        errs.phone = 'Please enter a valid 10-digit Indian mobile number.';
      }
      if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
        errs.email = 'Please enter a valid email address.';
      }
      if (!formData.password || formData.password.length < 6) {
        errs.password = 'Password must be at least 6 characters.';
      }
    } else if (mode === 'forgot') {
      if (!resetIdentifier.trim()) {
        errs.resetIdentifier = 'Please enter your registered email or 10-digit mobile number.';
      }
    } else if (mode === 'reset') {
      if (!otpCode.trim() || otpCode.trim().length !== 6) {
        errs.otpCode = 'Please enter the 6-digit verification code sent to your email.';
      }
      if (!newPassword || newPassword.length < 6) {
        errs.newPassword = 'New password must be at least 6 characters long.';
      }
      if (newPassword !== confirmPassword) {
        errs.confirmPassword = 'Passwords do not match.';
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitError('');
    setSuccessMsg('');

    try {
      if (mode === 'login') {
        await login({
          identifier: formData.identifier.trim(),
          password: formData.password
        });
      } else if (mode === 'register') {
        await register({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim().replace(/[\s-]/g, '').replace(/^(?:\+?91)/, ''),
          password: formData.password
        });
      } else if (mode === 'forgot') {
        const res = await forgotPassword({ identifier: resetIdentifier.trim() });
        setMaskedEmail(res.maskedEmail || res.identifier || resetIdentifier);
        setSuccessMsg(res.message || '6-digit verification code sent to your email.');
        setResendCooldown(60);
        setMode('reset');
      } else if (mode === 'reset') {
        const res = await resetPassword({
          identifier: resetIdentifier.trim(),
          otpCode: otpCode.trim(),
          newPassword
        });
        setSuccessMsg(res.message || 'Password updated successfully! Please sign in.');
        setFormData((prev) => ({ ...prev, identifier: resetIdentifier.trim(), password: '' }));
        setOtpCode('');
        setNewPassword('');
        setConfirmPassword('');
        setMode('login');
      }
    } catch (err) {
      setSubmitError(err.message || 'Action failed. Please check your details and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError('');
    try {
      const res = await forgotPassword({ identifier: resetIdentifier.trim() });
      setSuccessMsg('A fresh 6-digit verification code has been sent to your email.');
      setResendCooldown(60);
    } catch (err) {
      setSubmitError(err.message || 'Failed to resend verification code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="auth-modal-overlay"
      onClick={closeAuthModal}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(18, 5, 8, 0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'grid',
        placeItems: 'center',
        padding: '16px'
      }}
    >
      <div
        className="auth-modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(165deg, #3A0E18, #20060C)',
          border: '1px solid #E4B655',
          borderRadius: 8,
          boxShadow: '0 20px 48px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(228, 182, 85, 0.2)',
          color: '#F6EBD6',
          width: '100%',
          maxWidth: 440,
          padding: '28px 24px',
          position: 'relative'
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={closeAuthModal}
          aria-label="Close"
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'none',
            border: 'none',
            color: '#E4B655',
            fontSize: '1.5rem',
            cursor: 'pointer',
            lineHeight: 1
          }}
        >
          ×
        </button>

        {/* Modal Header */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <p style={{
            fontFamily: 'var(--font-tamil, Georgia, serif)',
            color: '#E4B655',
            fontSize: '0.95rem',
            margin: '0 0 4px'
          }}>
            ஸ்ரீ சங்கரா டிவி · சத்ரு சம்ஹார மஹா யாகம்
          </p>
          <h2 style={{
            fontFamily: 'var(--font-display, Georgia, serif)',
            fontSize: '1.45rem',
            color: '#F6EBD6',
            margin: 0,
            fontWeight: 400
          }}>
            {mode === 'login' && 'Devotee Sign In'}
            {mode === 'register' && 'Create Devotee Account'}
            {mode === 'forgot' && 'Reset Your Password'}
            {mode === 'reset' && 'Enter Verification Code'}
          </h2>
          <p style={{ fontSize: '0.84rem', color: '#D8C3A5', marginTop: 6 }}>
            {mode === 'login' && 'Sign in to reserve and track your blessed Sathru Samhara Maha Yagam.'}
            {mode === 'register' && 'Sign up with your email, mobile number and password to place your order.'}
            {mode === 'forgot' && 'Enter your registered email address or mobile number to receive a 6-digit verification code.'}
            {mode === 'reset' && (maskedEmail ? `Enter the 6-digit code sent to ${maskedEmail} and choose a new password.` : 'Enter the 6-digit code sent to your email.')}
          </p>
        </div>

        {/* Mode Switch Tabs (Only for login and register) */}
        {(mode === 'login' || mode === 'register') && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: 4,
              padding: 3,
              marginBottom: 20
            }}
          >
            <button
              type="button"
              onClick={() => { setMode('login'); setSubmitError(''); setSuccessMsg(''); }}
              style={{
                padding: '8px 12px',
                border: 'none',
                borderRadius: 3,
                background: mode === 'login' ? '#E4B655' : 'transparent',
                color: mode === 'login' ? '#2B1B18' : '#D8C3A5',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setSubmitError(''); setSuccessMsg(''); }}
              style={{
                padding: '8px 12px',
                border: 'none',
                borderRadius: 3,
                background: mode === 'register' ? '#E4B655' : 'transparent',
                color: mode === 'register' ? '#2B1B18' : '#D8C3A5',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div
            style={{
              background: 'rgba(22, 101, 52, 0.3)',
              border: '1px solid #4ADE80',
              color: '#BBF7D0',
              padding: '10px 14px',
              borderRadius: 4,
              fontSize: '0.85rem',
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Error Alert */}
        {submitError && (
          <div
            style={{
              background: 'rgba(163, 34, 26, 0.25)',
              border: '1px solid #FF8F86',
              color: '#FFD2CE',
              padding: '10px 14px',
              borderRadius: 4,
              fontSize: '0.85rem',
              marginBottom: 16
            }}
          >
            {submitError}
          </div>
        )}

        {/* Auth Forms */}
        <form onSubmit={handleSubmit} noValidate>
          {/* REGISTER MODE */}
          {mode === 'register' && (
            <>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#F6EBD6', marginBottom: 4 }}>
                  Devotee Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={handleChange('name')}
                  placeholder="e.g. Sriram Kalaikumar"
                  autoComplete="name"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: errors.name ? '1px solid #FF8F86' : '1px solid rgba(228, 182, 85, 0.35)',
                    borderRadius: 4,
                    color: '#FFFFFF',
                    fontSize: '0.95rem'
                  }}
                />
                {errors.name && <p style={{ color: '#FF8F86', fontSize: '0.78rem', margin: '4px 0 0' }}>{errors.name}</p>}
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#F6EBD6', marginBottom: 4 }}>
                  Mobile Number (10 Digits) *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange('phone')}
                  placeholder="e.g. 9876543210"
                  inputMode="numeric"
                  autoComplete="tel"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: errors.phone ? '1px solid #FF8F86' : '1px solid rgba(228, 182, 85, 0.35)',
                    borderRadius: 4,
                    color: '#FFFFFF',
                    fontSize: '0.95rem'
                  }}
                />
                {errors.phone && <p style={{ color: '#FF8F86', fontSize: '0.78rem', margin: '4px 0 0' }}>{errors.phone}</p>}
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#F6EBD6', marginBottom: 4 }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={handleChange('email')}
                  placeholder="name@example.com"
                  autoComplete="email"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: errors.email ? '1px solid #FF8F86' : '1px solid rgba(228, 182, 85, 0.35)',
                    borderRadius: 4,
                    color: '#FFFFFF',
                    fontSize: '0.95rem'
                  }}
                />
                {errors.email && <p style={{ color: '#FF8F86', fontSize: '0.78rem', margin: '4px 0 0' }}>{errors.email}</p>}
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#F6EBD6', marginBottom: 4 }}>
                  Password * <span style={{ color: '#D8C3A5', fontWeight: 400 }}>(min. 6 chars)</span>
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={handleChange('password')}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: errors.password ? '1px solid #FF8F86' : '1px solid rgba(228, 182, 85, 0.35)',
                    borderRadius: 4,
                    color: '#FFFFFF',
                    fontSize: '0.95rem'
                  }}
                />
                {errors.password && <p style={{ color: '#FF8F86', fontSize: '0.78rem', margin: '4px 0 0' }}>{errors.password}</p>}
              </div>
            </>
          )}

          {/* LOGIN MODE */}
          {mode === 'login' && (
            <>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#F6EBD6', marginBottom: 4 }}>
                  Email Address or 10-Digit Mobile *
                </label>
                <input
                  type="text"
                  value={formData.identifier}
                  onChange={handleChange('identifier')}
                  placeholder="Enter email or mobile number"
                  autoComplete="username"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: errors.identifier ? '1px solid #FF8F86' : '1px solid rgba(228, 182, 85, 0.35)',
                    borderRadius: 4,
                    color: '#FFFFFF',
                    fontSize: '0.95rem'
                  }}
                />
                {errors.identifier && <p style={{ color: '#FF8F86', fontSize: '0.78rem', margin: '4px 0 0' }}>{errors.identifier}</p>}
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#F6EBD6' }}>
                    Password *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setResetIdentifier(formData.identifier || '');
                      setSubmitError('');
                      setSuccessMsg('');
                      setErrors({});
                      setMode('forgot');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#E4B655',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                  >
                    Forgot Password?
                  </button>
                </div>
                <input
                  type="password"
                  value={formData.password}
                  onChange={handleChange('password')}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: errors.password ? '1px solid #FF8F86' : '1px solid rgba(228, 182, 85, 0.35)',
                    borderRadius: 4,
                    color: '#FFFFFF',
                    fontSize: '0.95rem'
                  }}
                />
                {errors.password && <p style={{ color: '#FF8F86', fontSize: '0.78rem', margin: '4px 0 0' }}>{errors.password}</p>}
              </div>
            </>
          )}

          {/* FORGOT PASSWORD MODE */}
          {mode === 'forgot' && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                <Mail size={18} color="#E4B655" />
                <span style={{ fontSize: '0.88rem', color: '#E4B655', fontWeight: 600 }}>
                  Enter your registered contact details:
                </span>
              </div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#F6EBD6', marginBottom: 4 }}>
                Email Address or 10-Digit Mobile *
              </label>
              <input
                type="text"
                value={resetIdentifier}
                onChange={(e) => {
                  setResetIdentifier(e.target.value);
                  setErrors((prev) => ({ ...prev, resetIdentifier: '' }));
                  setSubmitError('');
                }}
                placeholder="e.g. devotee@example.com or 9876543210"
                autoComplete="email"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: errors.resetIdentifier ? '1px solid #FF8F86' : '1px solid rgba(228, 182, 85, 0.35)',
                  borderRadius: 4,
                  color: '#FFFFFF',
                  fontSize: '0.95rem'
                }}
              />
              {errors.resetIdentifier && <p style={{ color: '#FF8F86', fontSize: '0.78rem', margin: '4px 0 0' }}>{errors.resetIdentifier}</p>}
              <p style={{ fontSize: '0.78rem', color: '#D8C3A5', marginTop: 6 }}>
                A 6-digit verification code will be sent to the email address registered with this account.
              </p>
            </div>
          )}

          {/* RESET PASSWORD (ENTER 6-DIGIT CODE + NEW PASSWORD) */}
          {mode === 'reset' && (
            <>
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#F6EBD6' }}>
                    6-Digit Verification Code *
                  </label>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendCooldown > 0 || isSubmitting}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: resendCooldown > 0 ? '#9CA3AF' : '#E4B655',
                      fontSize: '0.78rem',
                      cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                      textDecoration: resendCooldown > 0 ? 'none' : 'underline'
                    }}
                  >
                    {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend code'}
                  </button>
                </div>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => {
                    setOtpCode(e.target.value.replace(/\D/g, ''));
                    setErrors((prev) => ({ ...prev, otpCode: '' }));
                  }}
                  placeholder="123456"
                  inputMode="numeric"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    textAlign: 'center',
                    letterSpacing: '8px',
                    fontWeight: 700,
                    fontSize: '1.25rem',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: errors.otpCode ? '1px solid #FF8F86' : '1px solid rgba(228, 182, 85, 0.35)',
                    borderRadius: 4,
                    color: '#E4B655'
                  }}
                />
                {errors.otpCode && <p style={{ color: '#FF8F86', fontSize: '0.78rem', margin: '4px 0 0' }}>{errors.otpCode}</p>}
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#F6EBD6', marginBottom: 4 }}>
                  New Password * <span style={{ color: '#D8C3A5', fontWeight: 400 }}>(min. 6 chars)</span>
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setErrors((prev) => ({ ...prev, newPassword: '' }));
                  }}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: errors.newPassword ? '1px solid #FF8F86' : '1px solid rgba(228, 182, 85, 0.35)',
                    borderRadius: 4,
                    color: '#FFFFFF',
                    fontSize: '0.95rem'
                  }}
                />
                {errors.newPassword && <p style={{ color: '#FF8F86', fontSize: '0.78rem', margin: '4px 0 0' }}>{errors.newPassword}</p>}
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#F6EBD6', marginBottom: 4 }}>
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                  }}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: errors.confirmPassword ? '1px solid #FF8F86' : '1px solid rgba(228, 182, 85, 0.35)',
                    borderRadius: 4,
                    color: '#FFFFFF',
                    fontSize: '0.95rem'
                  }}
                />
                {errors.confirmPassword && <p style={{ color: '#FF8F86', fontSize: '0.78rem', margin: '4px 0 0' }}>{errors.confirmPassword}</p>}
              </div>
            </>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '12px 20px',
              background: '#D9731A',
              color: '#2B1B18',
              font: '700 1rem var(--font-body, sans-serif)',
              border: 'none',
              borderRadius: 4,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 4px 12px rgba(217, 115, 26, 0.35)',
              transition: 'all 0.2s ease'
            }}
          >
            {isSubmitting && <Spinner size="small" />}
            {mode === 'login' && 'Sign In as Devotee'}
            {mode === 'register' && 'Create Account & Continue'}
            {mode === 'forgot' && 'Send 6-Digit Code'}
            {mode === 'reset' && 'Update Password'}
          </button>
        </form>

        {/* Footer Navigation */}
        <div style={{ textAlign: 'center', marginTop: 18, fontSize: '0.85rem', color: '#D8C3A5' }}>
          {mode === 'login' && (
            <>
              First time devotee?{' '}
              <button
                type="button"
                onClick={() => { setMode('register'); setSubmitError(''); setSuccessMsg(''); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#E4B655',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Create an account
              </button>
            </>
          )}

          {mode === 'register' && (
            <>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => { setMode('login'); setSubmitError(''); setSuccessMsg(''); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#E4B655',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Sign in here
              </button>
            </>
          )}

          {(mode === 'forgot' || mode === 'reset') && (
            <button
              type="button"
              onClick={() => { setMode('login'); setSubmitError(''); setSuccessMsg(''); }}
              style={{
                background: 'none',
                border: 'none',
                color: '#E4B655',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <ArrowLeft size={14} /> Back to Sign In
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
