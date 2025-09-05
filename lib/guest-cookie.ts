// Guest cookie management for passwordless authentication
// Inspired by the Boondocks passwordless system

interface GuestCookieData {
  allowed: boolean;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  firstSet: string;
  version: number;
}

const COOKIE_NAME = 'zerofinanx_guest_auth';
const COOKIE_VERSION = 5; // Clear cookies before testing updated email functionality
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year in seconds

// Check if running in browser
const isBrowser = typeof window !== 'undefined';

// Get the guest cookie data
export function getGuestCookie(): GuestCookieData | null {
  if (!isBrowser) return null;
  
  try {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === COOKIE_NAME && value) {
        const decoded = decodeURIComponent(value);
        const data = JSON.parse(decoded);
        
        // Check version compatibility
        if (data.version !== COOKIE_VERSION) {
          // Clear outdated cookie and return null
          clearGuestCookie();
          return null;
        }
        
        return data;
      }
    }
  } catch (error) {
    console.error('Error reading guest cookie:', error);
    // Clear corrupted cookie
    clearGuestCookie();
  }
  
  return null;
}

// Set the guest cookie
export function setGuestCookie(data: Partial<GuestCookieData>): void {
  if (!isBrowser) return;
  
  try {
    const currentData = getGuestCookie();
    const newData: GuestCookieData = {
      allowed: data.allowed ?? currentData?.allowed ?? true,
      email: data.email ?? currentData?.email,
      firstName: data.firstName ?? currentData?.firstName,
      lastName: data.lastName ?? currentData?.lastName,
      phone: data.phone ?? currentData?.phone,
      firstSet: currentData?.firstSet ?? new Date().toISOString(),
      version: COOKIE_VERSION
    };
    
    const encoded = encodeURIComponent(JSON.stringify(newData));
    const isSecure = window.location.protocol === 'https:';
    const expires = new Date(Date.now() + COOKIE_MAX_AGE * 1000).toUTCString();
    
    document.cookie = `${COOKIE_NAME}=${encoded}; expires=${expires}; path=/; SameSite=Lax${isSecure ? '; Secure' : ''}`;
  } catch (error) {
    console.error('Error setting guest cookie:', error);
  }
}

// Clear the guest cookie
export function clearGuestCookie(): void {
  if (!isBrowser) return;
  
  const isSecure = window.location.protocol === 'https:';
  document.cookie = `${COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax${isSecure ? '; Secure' : ''}`;
}

// Check if guest authentication is allowed
export function isGuestAuthAllowed(): boolean {
  const cookie = getGuestCookie();
  return cookie?.allowed ?? false;
}

// Get stored email from cookie
export function getStoredEmail(): string | undefined {
  const cookie = getGuestCookie();
  return cookie?.email;
}

// Get stored user info from cookie
export function getStoredUserInfo(): Partial<GuestCookieData> | null {
  const cookie = getGuestCookie();
  if (!cookie) return null;
  
  return {
    email: cookie.email,
    firstName: cookie.firstName,
    lastName: cookie.lastName,
    phone: cookie.phone
  };
}

// Check if cookies are enabled in the browser
export function areCookiesEnabled(): boolean {
  if (!isBrowser) return false;
  
  try {
    // Try to set a test cookie
    document.cookie = 'test_cookie=1; SameSite=Lax';
    const cookiesEnabled = document.cookie.includes('test_cookie');
    // Clean up test cookie
    document.cookie = 'test_cookie=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax';
    return cookiesEnabled;
  } catch {
    return false;
  }
}

// Get cookie age in days
export function getCookieAge(): number | null {
  const cookie = getGuestCookie();
  if (!cookie?.firstSet) return null;
  
  const firstSet = new Date(cookie.firstSet);
  const now = new Date();
  const diffMs = now.getTime() - firstSet.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  return diffDays;
}