'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { Lock, Mail, ShieldAlert, KeyRound, Sparkles } from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';

  const { login } = useAuth();
  const toast = useToast();
  
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    identifier: '', // Username or Email
    password: '',
    confirmPassword: '',
  });

  // Dynamic style states for hover and focus micro-interactions
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [submitHover, setSubmitHover] = useState(false);
  const [googleHover, setGoogleHover] = useState(false);
  const [toggleHover, setToggleHover] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.identifier || !formData.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!isLoginMode && formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    
    try {
      const endpoint = isLoginMode ? '/api/auth/login' : '/api/auth/register';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: formData.identifier,
          password: formData.password,
          // Only send name if registering (can be extracted from identifier if missing)
          ...( !isLoginMode && { name: formData.identifier.split('@')[0] } )
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      login(data.user);
      toast.success(isLoginMode ? 'Logged in successfully!' : 'Account created successfully!');
      
      if (data.user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push(redirectUrl === '/' ? '/account' : redirectUrl);
      }
    } catch (err: any) {
      toast.error(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setTimeout(async () => {
      await login({
        id: `user_${Date.now()}`,
        name: 'Postal Aspirant',
        email: 'aspirant@gmail.com',
        role: 'customer'
      });
      toast.success('Logged in with Google successfully!');
      router.push(redirectUrl);
    }, 800);
  };

  return (
    <div style={{
      minHeight: 'calc(100dvh - var(--navbar-height) - 140px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 16px',
      position: 'relative',
      overflow: 'hidden',
      background: '#f8fafc'
    }}>
      {/* Decorative Blur Background Blobs for Studio Lighting Effect */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '15%',
        width: '380px',
        height: '380px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.16) 0%, rgba(59, 130, 246, 0) 70%)',
        filter: 'blur(35px)',
        pointerEvents: 'none',
        zIndex: 0
      }} />
      <div style={{
        position: 'absolute',
        bottom: '15%',
        right: '15%',
        width: '420px',
        height: '420px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.14) 0%, rgba(139, 92, 246, 0) 70%)',
        filter: 'blur(40px)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* Main Glassmorphic Login Card */}
      <div className="card" style={{
        width: '100%',
        maxWidth: '430px',
        padding: '44px 36px',
        borderRadius: '28px',
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.65)',
        boxShadow: '0 20px 48px -12px rgba(15, 23, 42, 0.08), 0 4px 12px rgba(15, 23, 42, 0.02)',
        position: 'relative',
        zIndex: 2,
        textAlign: 'center',
      }}>
        
        {/* Logo Container */}
        <div style={{
          width: '64px',
          height: '64px',
          margin: '0 auto 20px',
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          border: '1px solid rgba(226, 232, 240, 0.8)'
        }}>
          <img
            src="/images/logo.png"
            alt="Tenali Exam Publisher"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
        
        <h1 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '1.6rem',
          fontWeight: 800,
          marginBottom: '8px',
          color: '#0f172a',
          letterSpacing: '-0.5px'
        }}>
          {isLoginMode ? 'Sign In' : 'Create Account'}
        </h1>

        <p style={{
          fontSize: '0.875rem',
          color: 'var(--color-text-muted, #64748b)',
          marginBottom: '28px',
          lineHeight: 1.5
        }}>
          {redirectUrl.includes('checkout')
            ? 'Sign in to complete your checkout and track shipment.'
            : isLoginMode ? 'Access your postal exam preparation dashboard.' : 'Start your competitive postal exam preparation today.'}
        </p>

        {/* Form Container */}
        <form onSubmit={handleFormSubmit} style={{ textAlign: 'left', marginBottom: '24px' }}>
          
          {/* Field: Username or Email */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Username or Email
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: focusedField === 'identifier' ? '#2563eb' : '#94a3b8', display: 'flex', transition: 'color 0.2s' }}>
                <Mail size={18} />
              </span>
              <input
                type="text"
                name="identifier"
                value={formData.identifier}
                onChange={handleInputChange}
                onFocus={() => setFocusedField('identifier')}
                onBlur={() => setFocusedField(null)}
                placeholder="Enter username or email"
                style={{
                  width: '100%', 
                  padding: '12px 14px 12px 42px', 
                  borderRadius: '12px',
                  border: focusedField === 'identifier' ? '1.5px solid #2563eb' : '1.5px solid rgba(226, 232, 240, 0.9)', 
                  outline: 'none',
                  fontSize: '0.95rem',
                  color: '#0f172a',
                  background: '#ffffff',
                  boxShadow: focusedField === 'identifier' ? '0 0 0 4px rgba(59, 130, 246, 0.08)' : 'none',
                  transition: 'all 0.2s ease',
                }}
                required
              />
            </div>
          </div>

          {/* Field: Password */}
          <div style={{ marginBottom: isLoginMode ? '26px' : '18px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: focusedField === 'password' ? '#2563eb' : '#94a3b8', display: 'flex', transition: 'color 0.2s' }}>
                <KeyRound size={18} />
              </span>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                placeholder="Enter your password"
                style={{
                  width: '100%', 
                  padding: '12px 14px 12px 42px', 
                  borderRadius: '12px',
                  border: focusedField === 'password' ? '1.5px solid #2563eb' : '1.5px solid rgba(226, 232, 240, 0.9)', 
                  outline: 'none',
                  fontSize: '0.95rem',
                  color: '#0f172a',
                  background: '#ffffff',
                  boxShadow: focusedField === 'password' ? '0 0 0 4px rgba(59, 130, 246, 0.08)' : 'none',
                  transition: 'all 0.2s ease',
                }}
                required
              />
            </div>
          </div>

          {/* Field: Confirm Password (Register Mode only) */}
          {!isLoginMode && (
            <div style={{ marginBottom: '26px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: focusedField === 'confirmPassword' ? '#2563eb' : '#94a3b8', display: 'flex', transition: 'color 0.2s' }}>
                  <ShieldAlert size={18} />
                </span>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField('confirmPassword')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Confirm your password"
                  style={{
                    width: '100%', 
                    padding: '12px 14px 12px 42px', 
                    borderRadius: '12px',
                    border: focusedField === 'confirmPassword' ? '1.5px solid #2563eb' : '1.5px solid rgba(226, 232, 240, 0.9)', 
                    outline: 'none',
                    fontSize: '0.95rem',
                    color: '#0f172a',
                    background: '#ffffff',
                    boxShadow: focusedField === 'confirmPassword' ? '0 0 0 4px rgba(59, 130, 246, 0.08)' : 'none',
                    transition: 'all 0.2s ease',
                  }}
                  required
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            onMouseEnter={() => setSubmitHover(true)}
            onMouseLeave={() => setSubmitHover(false)}
            style={{ 
              width: '100%', 
              padding: '14px', 
              borderRadius: '12px',
              border: 'none',
              background: submitHover 
                ? 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)' 
                : 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '1.02rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: submitHover ? '0 8px 24px rgba(37, 99, 235, 0.3)' : '0 4px 12px rgba(37, 99, 235, 0.15)',
              transform: submitHover ? 'translateY(-1px)' : 'none',
              transition: 'all 0.25s ease'
            }}
          >
            {loading ? 'Processing...' : isLoginMode ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {/* Separator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(226, 232, 240, 0.8)' }} />
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(226, 232, 240, 0.8)' }} />
        </div>

        {/* Google Login Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          onMouseEnter={() => setGoogleHover(true)}
          onMouseLeave={() => setGoogleHover(false)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            padding: '14px 20px',
            border: '1.5px solid rgba(226, 232, 240, 0.8)',
            borderRadius: '12px',
            background: '#ffffff',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 650,
            fontSize: '0.96rem',
            color: '#334155',
            boxShadow: googleHover ? '0 6px 16px rgba(0, 0, 0, 0.05)' : '0 2px 6px rgba(0, 0, 0, 0.02)',
            transform: googleHover ? 'translateY(-1px)' : 'none',
            transition: 'all 0.2s ease',
            opacity: loading ? 0.7 : 1,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Toggle Mode */}
        <p style={{
          fontSize: '0.875rem',
          color: '#64748b',
          textAlign: 'center',
          marginTop: '28px',
        }}>
          {isLoginMode ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onMouseEnter={() => setToggleHover(true)}
            onMouseLeave={() => setToggleHover(false)}
            onClick={() => {
              setIsLoginMode(!isLoginMode);
              setFormData({ identifier: '', password: '', confirmPassword: '' });
            }}
            style={{
              background: 'none', 
              border: 'none', 
              padding: 0,
              color: '#2563eb', 
              fontWeight: 700,
              cursor: 'pointer', 
              fontSize: '0.875rem',
              textDecoration: toggleHover ? 'underline' : 'none',
              transition: 'color 0.15s ease'
            }}
          >
            {isLoginMode ? 'Create one' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '60px' }}>Loading sign in...</div>}>
      <LoginContent />
    </Suspense>
  );
}
