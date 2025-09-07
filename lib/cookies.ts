// Cookie management utilities for passwordless authentication
// Adapted from the Boondocks passwordless system

const COOKIE_NAME = 'zerofinanx_guest_auth';

export interface GuestCookieData {
  allowed: boolean;           // Guest authentication permission flag
  email?: string;            // User's email for prefilling
  firstSet: string;          // ISO date when cookie was first created
  version: number;           // Cookie schema version for migrations
}

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Check if cookies are enabled in the browser
export function areCookiesEnabled(): boolean {
  if (!isBrowser) return false;
  
  try {
    document.cookie = 'test=1; SameSite=Lax';
    const enabled = document.cookie.indexOf('test=1') !== -1;
    document.cookie = 'test=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    return enabled;
  } catch (e) {
    return false;
  }
}

// Get cookie data
function getCookieData(): GuestCookieData | null {
  if (!isBrowser || !areCookiesEnabled()) return null;
  
  try {
    const cookies = document.cookie.split(';');
    const cookie = cookies.find(c => c.trim().startsWith(`${COOKIE_NAME}=`));
    
    if (!cookie) return null;
    
    const value = cookie.split('=')[1];
    const decoded = decodeURIComponent(value);
    return JSON.parse(decoded);
  } catch (e) {
    console.warn('Failed to parse guest cookie:', e);
    return null;
  }
}

// Set cookie data
function setCookieData(data: GuestCookieData): void {
  if (!isBrowser || !areCookiesEnabled()) return;
  
  try {
    const encoded = encodeURIComponent(JSON.stringify(data));
    const expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + 1); // 1 year expiry
    
    const isHTTPS = window.location.protocol === 'https:';
    const secureFlag = isHTTPS ? '; Secure' : '';
    
    document.cookie = `${COOKIE_NAME}=${encoded}; expires=${expiry.toUTCString()}; path=/; SameSite=Lax${secureFlag}`;
  } catch (e) {
    console.warn('Failed to set guest cookie:', e);
  }
}

// Check if guest authentication is allowed
export function isGuestAuthAllowed(): boolean {
  const data = getCookieData();
  return data?.allowed === true;
}

// Get stored email from cookie
export function getStoredEmail(): string | null {
  const data = getCookieData();
  return data?.email || null;
}

// Enable guest authentication with email
export function enableGuestAuth(email: string): void {
  const existingData = getCookieData();
  
  const data: GuestCookieData = {
    allowed: true,
    email: email,
    firstSet: existingData?.firstSet || new Date().toISOString(),
    version: 1
  };
  
  setCookieData(data);
}

// Update stored email
export function updateStoredEmail(email: string): void {
  const data = getCookieData();
  if (data) {
    data.email = email;
    setCookieData(data);
  }
}

// Clear guest authentication cookie
export function clearGuestAuth(): void {
  if (!isBrowser) return;
  
  document.cookie = `${COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
}

// Get cookie information for display
export function getCookieInfo(): {
  exists: boolean;
  email?: string;
  ageInDays?: number;
  firstSet?: string;
} {
  const data = getCookieData();
  
  if (!data) {
    return { exists: false };
  }
  
  const firstSetDate = new Date(data.firstSet);
  const now = new Date();
  const ageInDays = Math.floor((now.getTime() - firstSetDate.getTime()) / (1000 * 60 * 60 * 24));
  
  return {
    exists: true,
    email: data.email,
    ageInDays,
    firstSet: data.firstSet
  };
}

// Validate email format with enhanced validation
export function isValidEmail(email: string): boolean {
  const trimmed = email.trim().toLowerCase();
  
  // Basic format check
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  if (!emailRegex.test(trimmed)) return false;
  
  // Check for common typos and invalid patterns
  const invalidPatterns = [
    /\.{2,}/, // Multiple consecutive dots
    /^\./, // Starts with dot
    /\.$/, // Ends with dot
    /@\./, // @ followed by dot
    /\.@/, // Dot followed by @
    /@.*@/, // Multiple @ symbols
    /\s/, // Any whitespace
    /[<>"]/, // Invalid characters
    /@example\.(com|org|net)$/i, // Common test domains
  ];
  
  return !invalidPatterns.some(pattern => pattern.test(trimmed));
}

// Normalize email (lowercase, trim)
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}