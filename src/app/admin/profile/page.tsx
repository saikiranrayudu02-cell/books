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
    <div className="max-w-3xl space-y-8">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">
            <User size={24} />
            Admin Profile Settings
          </h2>
          <p className="admin-page-desc">Manage your personal credentials and security passwords</p>
        </div>
      </div>

      <div className="flex flex-col gap-12 mt-6">
        
        {/* Personal Details */}
        <form onSubmit={handleProfileSubmit} className="admin-card">
          <div className="admin-form-section">
            <h3 className="admin-form-section__title flex items-center gap-2">
              <ShieldCheck size={18} className="text-(--color-success)" />
              Personal Details
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="form-group sm:col-span-2">
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
          </div>

          <div className="flex justify-end pt-4 border-t border-(--color-border)">
            <button type="submit" disabled={loading} className="btn btn-primary w-full sm:w-auto justify-center">
              {loading ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>

        {/* Change Password */}
        <form onSubmit={handlePasswordSubmit} className="admin-card">
          <div className="admin-form-section">
            <h3 className="admin-form-section__title flex items-center gap-2">
              <KeyRound size={18} />
              Change Password
            </h3>
            
            <div className="grid grid-cols-1 gap-5 max-w-md">
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
          </div>

          <div className="flex justify-start pt-4 border-t border-(--color-border)">
            <button type="submit" disabled={pwLoading} className="btn btn-secondary w-full sm:w-auto justify-center">
              {pwLoading ? 'Updating...' : 'Change Password'}
            </button>
          </div>
        </form>
        
      </div>
    </div>
  );
}
