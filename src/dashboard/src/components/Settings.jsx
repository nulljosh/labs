import { useState, useRef } from 'react';
import { exportAll, importAll } from '../lib/storage';
import { spark } from '../lib/spark';

export default function Settings({ settings, onSave }) {
  const [form, setForm] = useState(settings);
  const [pwInput, setPwInput] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [backupMsg, setBackupMsg] = useState('');
  const fileRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  const handleChangePassword = async () => {
    if (pwInput.length < 8) {
      setPwMsg('Password must be at least 8 characters');
      return;
    }
    const { error } = await spark.auth.updateUser({ password: pwInput });
    setPwInput('');
    setPwMsg(error ? `Update failed: ${error.message}` : 'Password updated');
    setTimeout(() => setPwMsg(''), 3000);
  };

  const handleDownloadBackup = () => {
    const json = exportAll();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bcgd-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRestoreBackup = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        importAll(ev.target.result);
        setBackupMsg('Backup restored. Reloading...');
        setTimeout(() => window.location.reload(), 1000);
      } catch {
        setBackupMsg('Invalid backup file');
        setTimeout(() => setBackupMsg(''), 3000);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="settings animate__animated animate__fadeIn">
      <h2 className="section-title">Alert Settings</h2>
      <form className="settings-form glass-card" onSubmit={handleSubmit}>
        <div className="form-field">
          <label>Alert Email</label>
          <input
            type="email"
            value={form.alertEmail}
            onChange={e => setForm(prev => ({ ...prev, alertEmail: e.target.value }))}
            placeholder="expert@bcgaragedoors.ca"
          />
          <span className="form-hint">Reorder emails will be pre-addressed to this recipient</span>
        </div>

        <div className="form-field">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={form.alertsEnabled}
              onChange={e => setForm(prev => ({ ...prev, alertsEnabled: e.target.checked }))}
            />
            <span>Show low-stock reorder prompts</span>
          </label>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">Save Settings</button>
        </div>
      </form>

      <h2 className="section-title" style={{ marginTop: '28px' }}>Security</h2>
      <div className="settings-form glass-card">
        <div className="form-field">
          <label>Password</label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="password"
              value={pwInput}
              onChange={e => setPwInput(e.target.value)}
              placeholder="New password"
              autoComplete="new-password"
              style={{ maxWidth: '220px' }}
            />
            <button type="button" className="btn btn-primary" onClick={handleChangePassword}>
              Update
            </button>
          </div>
          {pwMsg && <span className="form-hint" style={{ color: pwMsg.includes('least') || pwMsg.includes('failed') ? 'var(--red)' : 'var(--green)' }}>{pwMsg}</span>}
          <span className="form-hint">Sign-in is handled by your account on Cloudflare. Customer leads are only readable once signed in.</span>
        </div>
      </div>

      <h2 className="section-title" style={{ marginTop: '28px' }}>Data</h2>
      <div className="settings-form glass-card">
        <div className="form-field">
          <label>Backup</label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-primary" onClick={handleDownloadBackup}>
              Download Backup
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => fileRef.current?.click()}>
              Restore from Backup
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".json"
              onChange={handleRestoreBackup}
              style={{ display: 'none' }}
            />
          </div>
          {backupMsg && <span className="form-hint" style={{ color: backupMsg.includes('Invalid') ? 'var(--red)' : 'var(--green)' }}>{backupMsg}</span>}
          <span className="form-hint">Export all inventory, jobs, history, and settings as JSON</span>
        </div>
      </div>
    </div>
  );
}
