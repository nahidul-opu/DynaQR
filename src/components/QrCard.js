import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { formatDate } from '../lib';

export default function QrCard({ item, onEdit, onDelete }) {
  const [qrImage, setQrImage] = useState('');

  useEffect(() => {
    let active = true;

    QRCode.toDataURL(item.qrUrl, {
      width: 220,
      margin: 1,
    }).then((dataUrl) => {
      if (active) {
        setQrImage(dataUrl);
      }
    });

    return () => {
      active = false;
    };
  }, [item.qrUrl]);

  return (
    <article className="card stack gap-md">
      <div className="row split wrap gap-md">
        <div>
          <div className="eyebrow">{item.active ? 'Active' : 'Paused'}</div>
          <h3>{item.name}</h3>
          <p className="muted">Slug: <code>{item.slug}</code></p>
        </div>
        {qrImage ? (
          <a href={qrImage} download={`${item.slug}.png`} className="qr-preview-link">
            <img src={qrImage} alt={`QR for ${item.name}`} className="qr-preview" />
          </a>
        ) : null}
      </div>

      {item.description ? <p>{item.description}</p> : null}

      <div className="stack gap-xs">
        <div><span className="muted">QR URL:</span> <a href={item.qrUrl} target="_blank" rel="noreferrer">{item.qrUrl}</a></div>
        <div><span className="muted">Destination:</span> <a href={item.targetUrl} target="_blank" rel="noreferrer">{item.targetUrl}</a></div>
        <div><span className="muted">Scans:</span> {item.scanCount ?? 0}</div>
        <div><span className="muted">Updated:</span> {formatDate(item.updatedAt)}</div>
      </div>

      <div className="row gap-sm wrap">
        <button className="button secondary" onClick={() => navigator.clipboard.writeText(item.qrUrl)}>Copy QR URL</button>
        <button className="button secondary" onClick={() => onEdit(item)}>Edit</button>
        <button className="button danger" onClick={() => onDelete(item)}>Delete</button>
      </div>
    </article>
  );
}
