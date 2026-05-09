import {
  doc, getDoc, setDoc, getDocs,
  collection, query, orderBy, limit,
  serverTimestamp, runTransaction
} from "firebase/firestore";
import { db } from "./firebase.js";

// ── Username ─────────────────────────────────────────────────

// Check if username is taken, claim it atomically
export async function claimUsername(uid, username) {
  const clean = username.trim().toLowerCase().replace(/\s+/g, "_");
  if (clean.length < 2 || clean.length > 20) throw new Error("Naam moet 2–20 tekens zijn");

  const usernameRef = doc(db, "usernames", clean);
  const userRef     = doc(db, "users", uid);

  try {
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(usernameRef);
      if (snap.exists() && snap.data().uid !== uid) {
        throw new Error("Naam al bezet");
      }
      tx.set(usernameRef, { uid, createdAt: serverTimestamp() });
      tx.set(userRef, { username: clean, displayName: username.trim() }, { merge: true });
    });
    return clean;
  } catch (err) {
    throw err;
  }
}

// ── Leaderboard writes ────────────────────────────────────────

// Update global leaderboard entry for this user
export async function updateGlobalLeaderboard(uid, displayName, xp, tierLabel) {
  try {
    await setDoc(doc(db, "leaderboard_global", uid), {
      displayName, xp, tierLabel,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (err) {
    console.warn("Global leaderboard update failed:", err);
  }
}

// Update module leaderboard
export async function updateModuleLeaderboard(uid, displayName, modId, level, accuracy) {
  try {
    await setDoc(doc(db, `leaderboard_modules_${modId}`, uid), {
      displayName, level, accuracy,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (err) {
    console.warn("Module leaderboard update failed:", err);
  }
}

// Update daily leaderboard
export async function updateDailyLeaderboard(uid, displayName, score) {
  const today = new Date().toISOString().slice(0, 10);
  try {
    const ref = doc(db, `leaderboard_daily_${today}`, uid);
    const snap = await getDoc(ref);
    // Only update if new score is higher
    if (!snap.exists() || snap.data().score < score) {
      await setDoc(ref, { displayName, score, updatedAt: serverTimestamp() }, { merge: true });
    }
  } catch (err) {
    console.warn("Daily leaderboard update failed:", err);
  }
}

// ── Leaderboard reads ─────────────────────────────────────────

export async function fetchGlobalTop10() {
  try {
    const q = query(collection(db, "leaderboard_global"), orderBy("xp", "desc"), limit(10));
    const snap = await getDocs(q);
    return snap.docs.map((d, i) => ({ rank: i + 1, uid: d.id, ...d.data() }));
  } catch (err) {
    console.warn("Fetch global failed:", err);
    return [];
  }
}

export async function fetchModuleTop10(modId) {
  try {
    const q = query(collection(db, `leaderboard_modules_${modId}`), orderBy("level", "desc"), orderBy("accuracy", "desc"), limit(10));
    const snap = await getDocs(q);
    return snap.docs.map((d, i) => ({ rank: i + 1, uid: d.id, ...d.data() }));
  } catch (err) {
    console.warn("Fetch module failed:", err);
    return [];
  }
}

export async function fetchDailyTop10() {
  const today = new Date().toISOString().slice(0, 10);
  try {
    const q = query(collection(db, `leaderboard_daily_${today}`), orderBy("score", "desc"), limit(10));
    const snap = await getDocs(q);
    return snap.docs.map((d, i) => ({ rank: i + 1, uid: d.id, ...d.data() }));
  } catch (err) {
    console.warn("Fetch daily failed:", err);
    return [];
  }
}

// Find user's own rank (outside top 10)
export async function fetchMyRankGlobal(uid, myXp) {
  try {
    const q = query(collection(db, "leaderboard_global"), orderBy("xp", "desc"));
    const snap = await getDocs(q);
    const idx = snap.docs.findIndex(d => d.id === uid);
    return idx >= 0 ? idx + 1 : null;
  } catch { return null; }
}
