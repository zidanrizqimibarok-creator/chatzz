// Web Notification and Title Blinker for background/offline alerts

let originalTitle = document.title || 'Chatzz Messenger';
let blinkInterval: NodeJS.Timeout | null = null;
let unreadCounter = 0;

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  try {
    if (Notification.permission === 'granted') return true;
    if (Notification.permission !== 'denied') {
      const res = await Notification.requestPermission();
      return res === 'granted';
    }
  } catch {
    // ignore
  }
  return false;
}

export function showWebNotification(title: string, body: string, icon = '/favicon.ico') {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  try {
    const notif = new Notification(title, {
      body,
      icon,
      badge: icon,
      tag: 'chatzz-msg-' + Date.now(),
    });
    notif.onclick = () => {
      window.focus();
      notif.close();
      stopTitleBlink();
    };
  } catch {
    // fallback if service worker required on mobile
  }
}

export function startTitleBlink(senderName: string, unreadCount = 1) {
  unreadCounter = unreadCount;
  if (blinkInterval) return;

  originalTitle = 'Chatzz Messenger';
  let toggle = false;

  blinkInterval = setInterval(() => {
    toggle = !toggle;
    if (toggle) {
      document.title = `(${unreadCounter}) Pesan Baru dari ${senderName}`;
    } else {
      document.title = `Chatzz Messenger`;
    }
  }, 1200);
}

export function stopTitleBlink() {
  if (blinkInterval) {
    clearInterval(blinkInterval);
    blinkInterval = null;
  }
  unreadCounter = 0;
  document.title = 'Chatzz Messenger';
}

if (typeof window !== 'undefined') {
  window.addEventListener('focus', () => {
    stopTitleBlink();
  });
}
