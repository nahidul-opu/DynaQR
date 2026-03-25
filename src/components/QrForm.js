import React, { useEffect, useState } from 'react';
import { isValidUrl, slugify } from '../lib';

const emptyForm = {
  name: '',
  slug: '',
  targetUrl: '',
  description: '',
  active: true,
};

export default function QrForm({ initialValues, onSubmit, onCancel, submitLabel }) {
  const [values, setValues] = useState(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setValues(initialValues || emptyForm);
  }, [initialValues]);

  function updateField(event) {
    const { name, value, type, checked } = event.target;
    setValues((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'name' && !current.slug ? { slug: slugify(value) } : {}),
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (!values.name.trim()) {
      setError('Name is required.');
      return;
    }

    if (!values.slug.trim()) {
      setError('Slug is required.');
      return;
    }

    if (!isValidUrl(values.targetUrl)) {
      setError('Target URL must start with http:// or https://');
      return;
    }

    setSaving(true);
    try {
      await onSubmit({
        ...values,
        slug: slugify(values.slug),
      });
      setValues(emptyForm);
    } catch (submitError) {
      setError(submitError.message || 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="stack gap-md" onSubmit={handleSubmit}>
      <div>
        <label className="label" htmlFor="name">Label</label>
        <input id="name" name="name" className="input" value={values.name} onChange={updateField} placeholder="Spring campaign landing page" />
      </div>

      <div>
        <label className="label" htmlFor="slug">Slug</label>
        <input id="slug" name="slug" className="input" value={values.slug} onChange={updateField} placeholder="spring-campaign" />
      </div>

      <div>
        <label className="label" htmlFor="targetUrl">Destination URL</label>
        <input id="targetUrl" name="targetUrl" className="input" value={values.targetUrl} onChange={updateField} placeholder="https://example.com/landing" />
      </div>

      <div>
        <label className="label" htmlFor="description">Description</label>
        <textarea id="description" name="description" className="input textarea" value={values.description} onChange={updateField} placeholder="Optional notes for this QR code" />
      </div>

      <label className="checkbox-row">
        <input type="checkbox" name="active" checked={values.active} onChange={updateField} />
        Active
      </label>

      {error ? <div className="alert error">{error}</div> : null}

      <div className="row gap-sm">
        <button className="button" type="submit" disabled={saving}>{saving ? 'Saving…' : submitLabel}</button>
        {onCancel ? <button className="button secondary" type="button" onClick={onCancel}>Cancel</button> : null}
      </div>
    </form>
  );
}
