import { browser } from "$app/environment";

export function readStorage<T>(key: string, fallback: T): T {
  if (!browser) return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch (error) {
    console.error(`Failed to read localStorage key "${key}":`, error);
    return fallback;
  }
}

export function writeStorage<T>(key: string, value: T): void {
  if (!browser) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to write localStorage key "${key}":`, error);
  }
}

export function removeStorage(key: string): void {
  if (!browser) return;
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Failed to remove localStorage key "${key}":`, error);
  }
}