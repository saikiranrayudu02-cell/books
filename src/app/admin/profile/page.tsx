'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { User, KeyRound, ShieldCheck } from 'lucide-react';

export default function AdminProfilePage() {
  const { user, login } = useAuth(); // using login internally updates the context if needed, or we might need to refresh
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const [pwData, setPwData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePwChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPwData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          name: profileData.name,
          email: profileData.email,
          phone: profileData.phone,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Profile details updated');
        // A full robust implementation would update the AuthContext state here
        // For now, it will be updated on next login/refresh
      } else {
        toast.error(data.error || 'Failed to update profile');
      }
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (pwData.newPassword !== pwData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (pwData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setPwLoading(true);

    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          currentPassword: pwData.currentPassword,
          newPassword: pwData.newPassword,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Password changed successfully');
        setPwData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast.error(data.error || 'Failed to change password');
      }
    } catch (err) {
      toast.error('An error occurred while changing password');
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <User size={24} color="var(--color-primary)" />
          Admin Profile Settings
        </h2>
      </div>

      <div style={{ display: 'grid', gap: '32px' }}>
        
        {/* Personal Details */}
        <form onSubmit={handleProfileSubmit} className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={20} color="var(--color-success)" />
            Personal Details
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Full Name</label>
              <input required name="name" value={profileData.name} onChange={handleProfileChange} className="form-input" />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input required type="email" name="email" value={profileData.email} onChange={handleProfileChange} className="form-input" />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input required name="phone" value={profileData.phone} onChange={handleProfileChange} className="form-input" />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>

        {/* Change Password */}
        <form onSubmit={handlePasswordSubmit} className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <KeyRound size={20} color="var(--color-primary)" />
            Change Password
          </h3>
          
          <div style={{ display: 'grid', gap: '20px', marginBottom: '24px', maxWidth: '400px' }}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input required type="password" name="currentPassword" value={pwData.currentPassword} onChange={handlePwChange} className="form-input" />
            </div>

            <div className="form-group">
              <label className="form-label">New Password</label>
              <input required type="password" name="newPassword" value={pwData.newPassword} onChange={handlePwChange} className="form-input" />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input required type="password" name="confirmPassword" value={pwData.confirmPassword} onChange={handlePwChange} className="form-input" />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <button type="submit" disabled={pwLoading} className="btn btn-secondary">
              {pwLoading ? 'Updating...' : 'Change Password'}
            </button>
          </div>
        </form>
        
      </div>
    </div>
  );
}
