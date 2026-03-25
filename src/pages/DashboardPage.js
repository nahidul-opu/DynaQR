import React, { useState } from 'react';
import QrForm from '../components/QrForm';
import QrCard from '../components/QrCard';
import { createQrCode, deleteQrCode, updateQrCode, useQrCodes } from '../hooks';

export default function DashboardPage({ user, logout }) {
  const { qrCodes, loading } = useQrCodes(user);
  const [editing, setEditing] = useState(null);
  const [banner, setBanner] = useState('');

  async function handleCreate(values) {
    await createQrCode(user, values);
    setBanner('QR code created.');
  }

  async function handleUpdate(values) {
    await updateQrCode(editing.id, values);
    setEditing(null);
    setBanner('QR code updated.');
  }

  async function handleDelete(item) {
    const confirmed = window.confirm(`Delete "${item.name}"?`);
    if (!confirmed) return;

    await deleteQrCode(item.id);
    setBanner('QR code deleted.');
  }

  return (
    <div className="page-shell">
      <div className="page-content stack gap-lg">
        <header className="card row split wrap gap-md">
          <div>
            <div className="eyebrow">Signed in as</div>
            <h1>{user.displayName || user.email}</h1>
            <p className="muted">Use hash-based URLs for GitHub Pages, for example <code>#/r/spring-campaign</code>.</p>
          </div>
          <div className="row gap-sm wrap">
            <button className="button secondary" onClick={logout}>Sign out</button>
          </div>
        </header>

        {banner ? <div className="alert success">{banner}</div> : null}

        <section className="card stack gap-md">
          <div>
            <h2>{editing ? 'Edit QR code' : 'Create QR code'}</h2>
            <p className="muted">Every QR code points to your GitHub Pages app first, then redirects to the current destination stored in Firestore.</p>
          </div>

          <QrForm
            initialValues={editing || undefined}
            onSubmit={editing ? handleUpdate : handleCreate}
            onCancel={editing ? () => setEditing(null) : undefined}
            submitLabel={editing ? 'Save changes' : 'Create QR code'}
          />
        </section>

        <section className="stack gap-md">
          <div className="row split wrap gap-md">
            <div>
              <h2>Your QR codes</h2>
              <p className="muted">Click a QR image to download it as PNG.</p>
            </div>
          </div>

          {loading ? <div className="card">Loading QR codes…</div> : null}

          {!loading && qrCodes.length === 0 ? (
            <div className="card">No QR codes yet. Create your first one above.</div>
          ) : null}

          {qrCodes.map((item) => (
            <QrCard key={item.id} item={item} onEdit={setEditing} onDelete={handleDelete} />
          ))}
        </section>
      </div>
    </div>
  );
}
