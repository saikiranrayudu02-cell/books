'use client';

import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, AlertTriangle, ShieldCheck, Save, Loader2 } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { Switch } from '@/components/ui/switch-button';

export default function AdminSettingsPage() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        if (data.settings && data.settings.maintenance_mode !== undefined) {
          setMaintenanceMode(data.settings.maintenance_mode);
        }
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const saveSettings = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'maintenance_mode', value: maintenanceMode })
      });
      
      if (!res.ok) throw new Error('Failed to update settings');
      
      toast.success('Maintenance mode updated successfully');
    } catch (error) {
      console.error('Failed to update maintenance mode:', error);
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-loading__spinner" />
        <span className="admin-loading__text">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">
            <SettingsIcon size={24} />
            System Settings
          </h2>
          <p className="admin-page-desc">Manage global application configurations</p>
        </div>
      </div>

      {/* Settings Card */}
      <div className="admin-card">
        <div className="border-b border-(--color-border) p-6">
          <h3 className="text-xl font-bold text-(--color-text-primary) flex items-center gap-2">
            <ShieldCheck className="text-blue-500" size={20} />
            Application State
          </h3>
          <p className="text-sm text-(--color-text-secondary) mt-1">
            Control the overall accessibility of the public-facing application.
          </p>
        </div>

        <div className="p-6 space-y-8">
          {/* Maintenance Mode Toggle */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-5 rounded-xl border border-orange-200 dark:border-orange-900/30 bg-orange-50/50 dark:bg-orange-900/10">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} className="text-orange-500" />
                <h4 className="text-lg font-bold text-(--color-text-primary)">Maintenance Mode</h4>
              </div>
              <p className="text-sm text-(--color-text-secondary) leading-relaxed">
                When enabled, all public pages will be completely hidden behind a maintenance screen. 
                Users will see <span className="font-semibold text-(--color-text-primary)">&quot;Currently the application is on maintenance mode please try again later.&quot;</span>
                <br className="mb-2"/>
                <strong className="text-orange-600 dark:text-orange-400">Note:</strong> The admin dashboard will remain fully accessible to you.
              </p>
            </div>

            <div className="flex items-center shrink-0">
              <Switch 
                value={maintenanceMode}
                onToggle={() => setMaintenanceMode(!maintenanceMode)}
                iconOn={<ShieldCheck size={14} className="text-green-500" />}
                iconOff={<AlertTriangle size={14} className="text-orange-500" />}
                className="scale-125 mx-2"
              />
              <span className={`ml-4 font-bold text-sm ${maintenanceMode ? 'text-orange-600 dark:text-orange-400' : 'text-(--color-text-muted)'}`}>
                {maintenanceMode ? 'ENABLED' : 'DISABLED'}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 bg-(--color-bg-hover) border-t border-(--color-border) flex justify-end">
          <button 
            onClick={saveSettings}
            disabled={saving}
            className="btn btn-primary min-w-30"
          >
            {saving ? (
              <><Loader2 size={18} className="animate-spin" /> Saving...</>
            ) : (
              <><Save size={18} /> Save Settings</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
