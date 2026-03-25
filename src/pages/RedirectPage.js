import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { collection, getDocs, limit, query, where } from 'firebase/firestore';
import { db, hasMissingConfig } from '../firebase';
import { recordScan } from '../hooks';

export default function RedirectPage() {
  const { slug } = useParams();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('Looking up your QR destination…');
  const [targetUrl, setTargetUrl] = useState('');

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (hasMissingConfig) {
        setStatus('error');
        setMessage('Firebase is not configured.');
        return;
      }

      try {
        const qrQuery = query(collection(db, 'qrCodes'), where('slug', '==', slug), limit(1));
        const snapshot = await getDocs(qrQuery);

        if (snapshot.empty) {
          throw new Error('QR code not found.');
        }

        const item = snapshot.docs[0];
        const data = item.data();

        if (!data.active) {
          throw new Error('This QR code is currently paused.');
        }

        await recordScan(item.id);
        if (!mounted) return;

        setTargetUrl(data.targetUrl);
        setStatus('ready');
        setMessage('Destination found. Redirecting…');

        window.location.replace(data.targetUrl);
      } catch (error) {
        if (!mounted) return;
        setStatus('error');
        setMessage(error.message || 'Unable to resolve this QR code.');
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [slug]);

  return (
    <div className="page-shell">
      <div className="card stack gap-md narrow">
        <div className="eyebrow">Dynamic redirect</div>
        <h1>{status === 'error' ? 'Redirect failed' : 'Redirecting…'}</h1>
        <p>{message}</p>
        {targetUrl ? <a href={targetUrl}>{targetUrl}</a> : null}
        <Link className="linkish" to="/login">Back to app</Link>
      </div>
    </div>
  );
}
