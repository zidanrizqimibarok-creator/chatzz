import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getDatabase,
  ref,
  push,
  onChildAdded,
  remove,
  set,
  onValue,
  off,
  DatabaseReference,
} from 'firebase/database';

export const firebaseConfig = {
  apiKey: 'AIzaSyD9Lc-hChPV8Bu7Wv89jorvRxRa9sH7Ym8',
  authDomain: 'gochat-4914a.firebaseapp.com',
  databaseURL: 'https://gochat-4914a-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'gochat-4914a',
  storageBucket: 'gochat-4914a.firebasestorage.app',
  messagingSenderId: '135335378843',
  appId: '1:135335378843:web:fe5b8b7dc66c2e533f6b3e',
  measurementId: 'G-NWC9SVZ1PD',
};

// Singleton initialization
let firebaseAppInstance: any = null;
let firebaseDbInstance: any = null;

try {
  firebaseAppInstance = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  firebaseDbInstance = getDatabase(firebaseAppInstance);
} catch (err) {
  console.warn('[Firebase] Initialization error:', err);
}

/**
 * Send a message via Firebase Realtime Database mailbox
 * Acts as a dual pipe alongside MQTT for offline durability
 */
export async function sendFirebaseDirectMessage(targetPin: string, payload: any): Promise<boolean> {
  if (!firebaseDbInstance || !targetPin) return false;
  try {
    const mailboxRef = ref(firebaseDbInstance, `chatzz/mailboxes/${targetPin}`);
    await push(mailboxRef, {
      ...payload,
      _pipe: 'firebase',
      _queuedAt: Date.now(),
    });
    return true;
  } catch (err) {
    console.warn('[Firebase] Send direct message failed:', err);
    return false;
  }
}

/**
 * Send a group message via Firebase Realtime Database
 */
export async function sendFirebaseGroupMessage(groupId: string, payload: any): Promise<boolean> {
  if (!firebaseDbInstance || !groupId) return false;
  try {
    const groupRef = ref(firebaseDbInstance, `chatzz/groups/${groupId}/messages`);
    await push(groupRef, {
      ...payload,
      _pipe: 'firebase',
      _queuedAt: Date.now(),
    });
    return true;
  } catch (err) {
    console.warn('[Firebase] Send group message failed:', err);
    return false;
  }
}

/**
 * Listen to incoming messages for a specific PIN from Firebase Realtime Database.
 * When messages arrive (even if sent while offline), triggers callback and cleans up.
 */
export function listenFirebaseInbox(
  myPin: string,
  onMessageReceived: (payload: any) => void
): () => void {
  if (!firebaseDbInstance || !myPin) return () => {};

  const mailboxRef = ref(firebaseDbInstance, `chatzz/mailboxes/${myPin}`);

  const unsubscribe = onChildAdded(
    mailboxRef,
    (snapshot) => {
      const data = snapshot.val();
      if (data) {
        onMessageReceived(data);
        // Automatically consume / remove delivered message from cloud mailbox
        try {
          remove(snapshot.ref);
        } catch {
          // ignore removal error
        }
      }
    },
    (err) => {
      console.warn('[Firebase] Inbox listener error:', err);
    }
  );

  return () => {
    try {
      off(mailboxRef, 'child_added', unsubscribe);
    } catch {
      // ignore
    }
  };
}

/**
 * Send typing status through Firebase Realtime Database
 */
export async function sendFirebaseTyping(
  targetPin: string,
  myPin: string,
  isTyping: boolean
): Promise<void> {
  if (!firebaseDbInstance || !targetPin || !myPin) return;
  try {
    const typingRef = ref(firebaseDbInstance, `chatzz/typing/${targetPin}/${myPin}`);
    if (isTyping) {
      await set(typingRef, { isTyping: true, updatedAt: Date.now() });
    } else {
      await remove(typingRef);
    }
  } catch {
    // ignore
  }
}

/**
 * Listen to typing status from a partner
 */
export function listenFirebaseTyping(
  myPin: string,
  onTypingChange: (senderPin: string, isTyping: boolean) => void
): () => void {
  if (!firebaseDbInstance || !myPin) return () => {};

  const typingRef = ref(firebaseDbInstance, `chatzz/typing/${myPin}`);
  const unsubscribe = onValue(
    typingRef,
    (snapshot) => {
      const val = snapshot.val();
      if (!val) {
        onTypingChange('', false);
        return;
      }
      // Check each sender's typing state
      Object.entries(val).forEach(([senderPin, info]: [string, any]) => {
        const isFresh = info?.isTyping && Date.now() - (info?.updatedAt || 0) < 5000;
        onTypingChange(senderPin, isFresh);
      });
    },
    () => {}
  );

  return () => {
    try {
      off(typingRef, 'value', unsubscribe);
    } catch {
      // ignore
    }
  };
}
