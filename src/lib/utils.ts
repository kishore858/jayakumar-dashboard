
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Combine tailwind classes with clsx
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date to a readable string
export function formatDate(date: Date | string): string {
  const dateObj = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(dateObj);
}

// Extract domain from a URL
export function extractDomain(url: string): string {
  try {
    // Add protocol if missing
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    const domain = new URL(url).hostname;
    return domain.replace('www.', '');
  } catch (error) {
    console.error('Error extracting domain:', error);
    return url;
  }
}

// Get favicon URL from a domain
export function getFaviconUrl(domain: string): string {
  if (!domain) return '';
  
  // Clean up domain
  domain = domain.trim();
  if (domain.startsWith('http://') || domain.startsWith('https://')) {
    domain = extractDomain(domain);
  }
  
  // Google's favicon service
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
}

// Mask password for display
export function maskPassword(password: string): string {
  return '•'.repeat(Math.min(password.length, 8));
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Validate URL format
export function isValidUrl(url: string): boolean {
  try {
    // Add protocol if missing
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}

// Generate a password
export function generatePassword(length: number = 12): string {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}
