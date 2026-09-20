export interface EventSession {
  clientId: number;
  clientName: string;
  email?: string;
  subtotal: number;
  discountPercentage: number;
  discountAmount: number;
  total: number;
  servicesCount: number;
  productsCount: number;
  createdAt: string;
  expiresAt: string;
}

const STORAGE_KEY = "disagro-event-session";

export function getEventSession(): EventSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const session = JSON.parse(raw) as EventSession;
    if (!session.expiresAt) {
      return null;
    }

    const expired = new Date(session.expiresAt).getTime() <= Date.now();
    if (expired) {
      window.sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return session;
  } catch {
    window.sessionStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function saveEventSession(session: EventSession): void {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearEventSession(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(STORAGE_KEY);
}
