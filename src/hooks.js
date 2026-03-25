import { useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { addDoc, collection, deleteDoc, doc, increment, onSnapshot, orderBy, query, serverTimestamp, updateDoc, where, getDocs } from 'firebase/firestore';
import { auth, db, googleProvider } from './firebase';
import { buildQrUrl, slugify } from './lib';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  async function login() {
    await signInWithPopup(auth, googleProvider);
  }

  async function logout() {
    await signOut(auth);
  }

  return { user, loading, login, logout };
}

export function useQrCodes(user) {
  const [qrCodes, setQrCodes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setQrCodes([]);
      setLoading(false);
      return undefined;
    }

    const q = query(
      collection(db, 'qrCodes'),
      where('ownerUid', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const records = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
          qrUrl: buildQrUrl(item.data().slug),
        }));
        setQrCodes(records);
        setLoading(false);
      },
      (error) => {
        console.error(error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user]);

  return { qrCodes, loading };
}

export async function ensureUniqueSlug(slug, currentId = null) {
  const q = query(collection(db, 'qrCodes'), where('slug', '==', slug));
  const snapshot = await getDocs(q);

  if (snapshot.empty) return slug;

  const matched = snapshot.docs[0];
  if (currentId && matched.id === currentId) return slug;

  throw new Error('That slug is already in use. Please choose another one.');
}

export async function createQrCode(user, values) {
  const slug = slugify(values.slug || values.name);
  await ensureUniqueSlug(slug);

  return addDoc(collection(db, 'qrCodes'), {
    name: values.name.trim(),
    slug,
    targetUrl: values.targetUrl.trim(),
    description: values.description.trim(),
    active: true,
    ownerUid: user.uid,
    ownerEmail: user.email,
    scanCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateQrCode(id, values) {
  const slug = slugify(values.slug || values.name);
  await ensureUniqueSlug(slug, id);

  return updateDoc(doc(db, 'qrCodes', id), {
    name: values.name.trim(),
    slug,
    targetUrl: values.targetUrl.trim(),
    description: values.description.trim(),
    active: values.active,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteQrCode(id) {
  return deleteDoc(doc(db, 'qrCodes', id));
}

export async function recordScan(id) {
  return updateDoc(doc(db, 'qrCodes', id), {
    scanCount: increment(1),
    updatedAt: serverTimestamp(),
  });
}
