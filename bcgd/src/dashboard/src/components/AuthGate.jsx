import { useState } from 'react';
import { spark } from '../lib/spark';
import Logo from './Logo';

// Replaces the old 4-digit PinGate. Leads are customer PII (names + phone
// numbers) so read access is gated by real sign-in, enforced by the API, not a client
// -side PIN check that anyone could edit out in devtools.
//
// Three modes in one card: sign in, request a reset link, and — when App
// hands us `recovering` after a PASSWORD_RECOVERY event — set the new password.
export default function AuthGate({ recovering = false, onRecovered }) {
  const [mode, setMode] = useState(recovering ? 'update' : 'signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [shaking, setShaking] = useState(false);

  const fail = (msg) => {
    setError(msg);
    setShaking(true);
    setPassword('');
    setTimeout(() => setShaking(false), 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    setNotice('');

    if (mode === 'reset') {
      const { error } = await spark.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      setBusy(false);
      if (error) fail(error.message);
      else setNotice('Check your email for a reset link.');
      return;
    }

    if (mode === 'update') {
      if (password.length < 8) { setBusy(false); fail('Password must be at least 8 characters.'); return; }
      const { error } = await spark.auth.updateUser({ password });
      setBusy(false);
      if (error) { fail(error.message); return; }
      setPassword('');
      onRecovered?.();
      return;
    }

    const { error } = await spark.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) fail(error.message);
    // Success: App's onAuthStateChange listener swaps this out.
  };

  const subtitle = { signin: 'Sign in', reset: 'Reset your password', update: 'Choose a new password' }[mode];
  const submitLabel = { signin: 'Sign In', reset: 'Send reset link', update: 'Save password' }[mode];
  const busyLabel = { signin: 'Signing in...', reset: 'Sending...', update: 'Saving...' }[mode];

  return (
    <div className="pin-gate">
      <form
        className={`pin-card glass-card ${shaking ? 'pin-shake' : ''}`}
        onSubmit={handleSubmit}
      >
        <Logo size={48} />
        <h1 className="pin-title">Best Choice Garage Doors</h1>
        <p className="pin-subtitle">{subtitle}</p>

        {mode !== 'update' && (
          <input
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setError(''); }}
            className="auth-input"
            placeholder="Email"
            autoComplete="username"
            autoFocus
            required
          />
        )}

        {mode !== 'reset' && (
          <input
            type="password"
            value={password}
            onChange={e => { setPassword(e.target.value); setError(''); }}
            className="auth-input"
            placeholder={mode === 'update' ? 'New password' : 'Password'}
            autoComplete={mode === 'update' ? 'new-password' : 'current-password'}
            autoFocus={mode === 'update'}
            required
          />
        )}

        {error && <p className="pin-error">{error}</p>}
        {notice && <p className="pin-subtitle">{notice}</p>}

        <button type="submit" className="btn btn-primary pin-submit" disabled={busy}>
          {busy ? busyLabel : submitLabel}
        </button>

        {mode === 'signin' && (
          <button
            type="button"
            className="btn btn-link"
            onClick={() => { setMode('reset'); setError(''); setPassword(''); }}
          >
            Forgot password?
          </button>
        )}
        {mode === 'reset' && (
          <button
            type="button"
            className="btn btn-link"
            onClick={() => { setMode('signin'); setError(''); setNotice(''); }}
          >
            Back to sign in
          </button>
        )}
      </form>
    </div>
  );
}
