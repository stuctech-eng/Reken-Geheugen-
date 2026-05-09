import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase.js";
import { DEFAULT_SAVE, dClone, dMerge } from "../core/save.js";

// Load save from Firestore
// Falls back to localStorage if offline
export async function loadFromFirestore(uid) {
  try {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      // Merge with defaults so new fields are always present
      return dMerge(dClone(DEFAULT_SAVE), data);
    }
    // First time user — return defaults
    return dClone(DEFAULT_SAVE);
  } catch (err) {
    console.warn("Firestore load failed, using localStorage:", err);
    // Offline fallback
    try {
      const local = localStorage.getItem("rg3_save");
      if (local) return dMerge(dClone(DEFAULT_SAVE), JSON.parse(local));
    } catch {}
    return dClone(DEFAULT_SAVE);
  }
}

// Save to Firestore (merge — never overwrites unrelated fields)
export async function saveToFirestore(uid, data) {
  try {
    const ref = doc(db, "users", uid);
    // Remove non-serializable fields
    const clean = JSON.parse(JSON.stringify(data));
    await setDoc(ref, { ...clean, updatedAt: serverTimestamp() }, { merge: true });
  } catch (err) {
    console.warn("Firestore save failed, saved to localStorage only:", err);
  }
  // Always also save to localStorage as offline backup
  try {
    localStorage.setItem("rg3_save", JSON.stringify(data));
  } catch {}
}
