import { useState, useEffect, useCallback } from 'react';
import { getParts, saveParts, addHistory, getSettings, saveSettings, buildReorderMailto, CATEGORIES, getJobs, saveJobs, JOB_STATUSES, generateId } from './lib/storage';
import { spark, fetchNewLeads, markLeadsImported } from './lib/spark';
import Logo from './components/Logo';
import AuthGate from './components/AuthGate';
import PartList from './components/PartList';
import PartForm from './components/PartForm';
import JobList from './components/JobList';
import JobForm from './components/JobForm';
import HistoryLog from './components/HistoryLog';
import Settings from './components/Settings';

function exportCSV(parts) {
  const headers = ['Name', 'SKU', 'Category', 'Quantity', 'Min Threshold', 'Unit Cost', 'Supplier', 'Total Value'];
  const rows = parts.map(p => [
    `"${p.name}"`, p.sku, p.category, p.quantity, p.minThreshold,
    p.cost.toFixed(2), `"${p.supplier}"`, (p.quantity * p.cost).toFixed(2),
  ]);
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `garage-inventory-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function plural(n, word) {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}

export default function App() {
  const [session, setSession] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [parts, setParts] = useState(getParts);
  const [jobs, setJobs] = useState(getJobs);
  const [editingPart, setEditingPart] = useState(null);
  const [editingJob, setEditingJob] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showJobForm, setShowJobForm] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortKey, setSortKey] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [jobDeleteConfirm, setJobDeleteConfirm] = useState(null);
  const [toast, setToast] = useState(null);
  const [settings, setSettings] = useState(getSettings);
  const [showSettings, setShowSettings] = useState(false);
  const [recovering, setRecovering] = useState(false);

  useEffect(() => { saveParts(parts); }, [parts]);
  useEffect(() => { saveJobs(jobs); }, [jobs]);

  useEffect(() => {
    spark.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthReady(true);
    });
    // A recovery link signs the user in, so without this flag they'd land on the
    // dashboard and never get asked for the new password they came to set.
    const { data: sub } = spark.auth.onAuthStateChange((e, s) => {
      if (e === 'PASSWORD_RECOVERY') setRecovering(true);
      setSession(s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.querySelector('.search-input')?.focus();
      }
      if (e.key === 'Escape') {
        if (deleteConfirm) setDeleteConfirm(null);
        else if (jobDeleteConfirm) setJobDeleteConfirm(null);
        else if (showForm) { setShowForm(false); setEditingPart(null); }
        else if (showJobForm) { setShowJobForm(false); setEditingJob(null); }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [deleteConfirm, jobDeleteConfirm, showForm, showJobForm]);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }, []);

  // ---- Website leads -> Lead jobs ----
  // The booking form on bcgd.heyitsmejosh.com inserts into bcgd_leads. Pull any
  // that haven't been turned into a job yet, then flip them to 'Imported' so the
  // next poll skips them. ponytail: 60s poll, switch to realtime if it matters.
  useEffect(() => {
    if (!session) return;
    let cancelled = false;

    const pull = async () => {
      try {
        const leads = await fetchNewLeads();
        if (cancelled || !leads.length) return;
        setJobs(prev => {
          const known = new Set(prev.map(j => j.leadId).filter(Boolean));
          const fresh = leads.filter(l => !known.has(l.id));
          if (!fresh.length) return prev;
          return [
            ...fresh.map(l => ({
              id: generateId(),
              leadId: l.id,
              client: l.name,
              phone: l.phone,
              service: l.service || '',
              status: 'Lead',
              value: 0,
              date: l.created_at.slice(0, 10),
              notes: l.message || '',
              parts: [],
            })),
            ...prev,
          ];
        });
        await markLeadsImported(leads.map(l => l.id));
        showToast(`${plural(leads.length, 'new lead')} from the website`);
      } catch (err) {
        console.error('Lead sync failed', err);
      }
    };

    pull();
    const timer = setInterval(pull, 60000);
    return () => { cancelled = true; clearInterval(timer); };
  }, [session, showToast]);

  // ---- Part handlers ----

  const handleSave = useCallback((part) => {
    setParts(prev => {
      const exists = prev.find(p => p.id === part.id);
      if (exists) {
        addHistory({
          action: 'updated',
          partName: part.name,
          sku: part.sku,
          details: `Qty: ${exists.quantity} -> ${part.quantity}`,
        });
        return prev.map(p => p.id === part.id ? part : p);
      }
      addHistory({
        action: 'added',
        partName: part.name,
        sku: part.sku,
        details: `Qty: ${part.quantity}`,
      });
      return [...prev, part];
    });
    setEditingPart(null);
    setShowForm(false);
    showToast(part ? 'Part saved' : 'Part added');
  }, [showToast]);

  const handleDelete = useCallback((id) => {
    setParts(prev => {
      const part = prev.find(p => p.id === id);
      if (part) {
        addHistory({
          action: 'removed',
          partName: part.name,
          sku: part.sku,
          details: `Had ${part.quantity} in stock`,
        });
      }
      return prev.filter(p => p.id !== id);
    });
    setDeleteConfirm(null);
    showToast('Part removed');
  }, [showToast]);

  const handleAdjustQty = useCallback((id, delta) => {
    setParts(prev => prev.map(p => {
      if (p.id !== id) return p;
      const newQty = Math.max(0, p.quantity + delta);
      addHistory({
        action: delta > 0 ? 'restocked' : 'used',
        partName: p.name,
        sku: p.sku,
        details: `Qty: ${p.quantity} -> ${newQty}`,
      });
      if (newQty <= p.minThreshold && p.quantity > p.minThreshold && settings.alertsEnabled) {
        showToast(`Low stock: ${p.name} (${newQty}/${p.minThreshold})`);
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Low Stock Alert', {
            body: `${p.name} is at ${newQty} units (min: ${p.minThreshold})`,
          });
        }
      }
      return { ...p, quantity: newQty };
    }));
  }, [settings.alertsEnabled, showToast]);

  const handleSort = useCallback((key) => {
    setSortKey(prev => {
      if (prev === key) {
        setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        return key;
      }
      setSortDir('asc');
      return key;
    });
  }, []);

  // ---- Job handlers ----

  const handleSaveJob = useCallback((job) => {
    setJobs(prev => {
      const exists = prev.find(j => j.id === job.id);
      if (exists) return prev.map(j => j.id === job.id ? job : j);
      return [...prev, job];
    });
    setEditingJob(null);
    setShowJobForm(false);
    showToast('Job saved');
  }, [showToast]);

  const handleDeleteJob = useCallback((id) => {
    setJobs(prev => prev.filter(j => j.id !== id));
    setJobDeleteConfirm(null);
    showToast('Job removed');
  }, [showToast]);

  const handleAdvanceJob = useCallback((id) => {
    let consumed = null;
    setJobs(prev => prev.map(j => {
      if (j.id !== id) return j;
      const idx = JOB_STATUSES.indexOf(j.status);
      if (idx >= JOB_STATUSES.length - 1) return j;
      const next = JOB_STATUSES[idx + 1];
      // Parts come off the truck once, on the transition into Complete.
      if (next === 'Complete' && j.parts?.length && !j.partsConsumed) {
        consumed = j.parts;
        return { ...j, status: next, partsConsumed: true };
      }
      return { ...j, status: next };
    }));

    if (consumed) {
      consumed.forEach(({ partId, qty }) => handleAdjustQty(partId, -qty));
      showToast(`Job complete -- ${plural(consumed.length, 'part')} deducted`);
    } else {
      showToast('Job advanced');
    }
  }, [showToast, handleAdjustQty]);

  // ---- Derived data ----

  const totalUnits = parts.reduce((s, p) => s + p.quantity, 0);
  const totalValue = parts.reduce((s, p) => s + Math.round(p.quantity * p.cost * 100) / 100, 0);
  const lowStockParts = parts.filter(p => p.quantity <= p.minThreshold);
  const newLeads = jobs.filter(j => j.status === 'Lead');
  const openLeads = newLeads.length;
  const scheduledJobs = jobs.filter(j => j.status === 'Scheduled').length;

  const now = new Date();
  const todayKey = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString().slice(0, 10);
  const todayJobs = jobs.filter(j => j.status === 'Scheduled' && j.date === todayKey);

  const filteredParts = parts
    .filter(p => {
      const matchesSearch = !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase()) ||
        p.supplier.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      let av = a[sortKey];
      let bv = b[sortKey];
      if (typeof av === 'string') { av = av.toLowerCase(); bv = bv.toLowerCase(); }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

  // ---- Auth gate ----

  if (!authReady) return null;
  if (!session || recovering) return <AuthGate recovering={recovering} onRecovered={() => setRecovering(false)} />;

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <Logo size={56} />
          <div className="header-text">
            <h1 className="app-title">Best Choice Garage Doors</h1>
            <span className="app-subtitle">Operations Dashboard</span>
          </div>
        </div>
        <div className="header-actions">
          <button
            className="btn btn-secondary settings-toggle"
            onClick={() => setShowSettings(s => !s)}
          >
            {showSettings ? 'Close Settings' : 'Settings'}
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => spark.auth.signOut()}
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="app-main">
        {/* ---- Today: what am I doing, and what goes in the van ---- */}
        <div className="section animate__animated animate__fadeInUp">
          <h2 className="section-title">Today</h2>
          {newLeads.length > 0 && (
            <div className="today-leads glass-card">
              <span className="today-leads-count">{plural(newLeads.length, 'new lead')}</span>
              <span className="today-leads-names">{newLeads.map(j => j.client).join(', ')}</span>
            </div>
          )}
          {todayJobs.length === 0 ? (
            <p className="empty-hint">Nothing scheduled for today.</p>
          ) : (
            <div className="today-list glass-card">
              {todayJobs.map(j => (
                <div key={j.id} className="today-row">
                  <div className="today-row-main">
                    <span className="today-client">{j.client}</span>
                    <span className="today-service">{j.service || 'Service call'}</span>
                    {j.phone && (
                      <a className="today-phone" href={`tel:${j.phone.replace(/\D/g, '')}`}>{j.phone}</a>
                    )}
                  </div>
                  {j.parts?.length > 0 && (
                    <div className="today-parts">
                      {j.parts.map(({ partId, qty }) => {
                        const part = parts.find(p => p.id === partId);
                        if (!part) return null;
                        const short = qty > part.quantity;
                        return (
                          <span key={partId} className={`today-part ${short ? 'today-part--short' : ''}`}>
                            {qty}x {part.name}{short ? ` (only ${part.quantity} in stock)` : ''}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ---- Stats Row ---- */}
        <div className="stats-row animate__animated animate__fadeInUp">
          <div className="stat-card glass-card">
            <span className="stat-label">Total SKUs</span>
            <span className="stat-value">{parts.length}</span>
          </div>
          <div className="stat-card glass-card">
            <span className="stat-label">Total Units</span>
            <span className="stat-value">{totalUnits.toLocaleString()}</span>
          </div>
          <div className="stat-card glass-card">
            <span className="stat-label">Inventory Value (est.)</span>
            <span className="stat-value">
              {totalValue > 0
                ? `~$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : '--'}
            </span>
          </div>
          <div className={`stat-card glass-card ${lowStockParts.length > 0 ? 'alert' : ''}`}>
            <span className="stat-label">Low Stock</span>
            <span className="stat-value">{lowStockParts.length}</span>
          </div>
          {openLeads > 0 && (
            <div className="stat-card glass-card">
              <span className="stat-label">Open Leads</span>
              <span className="stat-value">{openLeads}</span>
            </div>
          )}
          {scheduledJobs > 0 && (
            <div className="stat-card glass-card">
              <span className="stat-label">Scheduled</span>
              <span className="stat-value">{scheduledJobs}</span>
            </div>
          )}
        </div>

        {/* ---- Low Stock Alerts ---- */}
        {lowStockParts.length > 0 && (
          <div className="section animate__animated animate__fadeInUp" style={{ animationDelay: '0.05s' }}>
            <h2 className="section-title">Low Stock Alerts</h2>
            <div className="alert-list glass-card">
              {lowStockParts.map(p => (
                <div key={p.id} className="alert-row">
                  <div className="alert-info" onClick={() => { setEditingPart(p); setShowForm(true); }}>
                    <span className="alert-name">{p.name}</span>
                    <span className="alert-sku">{p.sku}</span>
                  </div>
                  <div className="alert-actions">
                    <a
                      href={buildReorderMailto(p, settings.alertEmail)}
                      className="btn-reorder"
                      onClick={e => e.stopPropagation()}
                      title="Send reorder email"
                    >
                      Reorder
                    </a>
                    <div className="alert-qty">
                      <span className="qty-current">{p.quantity}</span>
                      <span className="qty-sep">/</span>
                      <span className="qty-min">{p.minThreshold}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---- Jobs ---- */}
        <div className="section animate__animated animate__fadeInUp" style={{ animationDelay: '0.1s' }}>
          <div className="section-header">
            <h2 className="section-title">Jobs</h2>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => { setEditingJob(null); setShowJobForm(true); }}
            >
              + New Job
            </button>
          </div>

          {showJobForm && (
            <JobForm
              job={editingJob}
              parts={parts}
              onSave={handleSaveJob}
              onCancel={() => { setShowJobForm(false); setEditingJob(null); }}
            />
          )}

          {jobs.length > 0 ? (
            <JobList
              jobs={jobs}
              onEdit={(j) => { setEditingJob(j); setShowJobForm(true); }}
              onDelete={(id) => setJobDeleteConfirm(id)}
              onAdvance={handleAdvanceJob}
            />
          ) : (
            <p className="empty-hint">No jobs yet. Create one to start tracking your pipeline.</p>
          )}
        </div>

        {/* ---- Inventory ---- */}
        <div className="section animate__animated animate__fadeInUp" style={{ animationDelay: '0.15s' }}>
          <div className="section-header">
            <h2 className="section-title">Inventory</h2>
            <div className="section-actions">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => exportCSV(filteredParts)}
                title="Export filtered inventory as CSV"
              >
                Export CSV
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => { setEditingPart(null); setShowForm(true); }}
              >
                + Add Part
              </button>
            </div>
          </div>

          <div className="inventory-toolbar">
            <div className="search-bar">
              <svg className="search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
                <line x1="10.5" y1="10.5" x2="15" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <input
                type="text"
                placeholder="Search parts, SKUs, suppliers... (Cmd+K)"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="search-input"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="category-select"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {showForm && (
            <PartForm
              part={editingPart}
              onSave={handleSave}
              onCancel={() => { setShowForm(false); setEditingPart(null); }}
            />
          )}

          <PartList
            parts={filteredParts}
            onEdit={(p) => { setEditingPart(p); setShowForm(true); }}
            onDelete={(id) => setDeleteConfirm(id)}
            onAdjustQty={handleAdjustQty}
            sortKey={sortKey}
            sortDir={sortDir}
            onSort={handleSort}
          />
        </div>

        {/* ---- Recent Activity ---- */}
        <div className="section animate__animated animate__fadeInUp" style={{ animationDelay: '0.2s' }}>
          <h2 className="section-title">Recent Activity</h2>
          <HistoryLog limit={10} />
        </div>

        {/* ---- Settings (collapsible) ---- */}
        {showSettings && (
          <div className="section animate__animated animate__fadeInUp">
            <Settings
              settings={settings}
              onSave={(s) => { setSettings(s); saveSettings(s); showToast('Settings saved'); }}
            />
          </div>
        )}
      </main>

      {/* Delete confirmation modal -- parts */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal glass-card animate__animated animate__fadeInUp animate__faster" onClick={e => e.stopPropagation()}>
            <h3>Remove this part?</h3>
            <p>This will permanently delete it from inventory and cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn btn-delete" onClick={() => handleDelete(deleteConfirm)}>Remove</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal -- jobs */}
      {jobDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setJobDeleteConfirm(null)}>
          <div className="modal glass-card animate__animated animate__fadeInUp animate__faster" onClick={e => e.stopPropagation()}>
            <h3>Remove this job?</h3>
            <p>This will permanently delete this job and cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setJobDeleteConfirm(null)}>Cancel</button>
              <button className="btn btn-delete" onClick={() => handleDeleteJob(jobDeleteConfirm)}>Remove</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast notification */}
      {toast && (
        <div className="toast animate__animated animate__fadeInUp animate__faster">{toast}</div>
      )}

      {/* App footer */}
      <footer className="app-footer">
        <div className="footer-left">
          <span>&copy; 2026 Best Choice Garage Doors</span>
          <span className="footer-sep">|</span>
          <a href="https://bcgaragedoors.ca" target="_blank" rel="noopener noreferrer">bcgaragedoors.ca</a>
        </div>
        <div className="footer-shortcuts">
          <span className="shortcut-hint">Cmd+K Search</span>
          <span className="shortcut-hint">Esc Close</span>
        </div>
      </footer>
    </div>
  );
}
