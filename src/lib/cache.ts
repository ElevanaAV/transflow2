// src/lib/cache.ts

/**
 * Simple in-memory cache with time-to-live for data
 */
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export interface Cache<T> {
  get: (key: string) => T | null;
  set: (key: string, data: T) => void;
  remove: (key: string) => void;
  clear: () => void;
  has: (key: string) => boolean;
}

/**
 * Creates a simple in-memory cache with optional TTL
 * @param ttlMs Time-to-live in milliseconds (default: 5 minutes)
 * @returns Cache instance with get/set/remove/clear methods
 */
export function createCache<T>(ttlMs: number = 5 * 60 * 1000): Cache<T> {
  const cache = new Map<string, CacheEntry<T>>();
  
  /**
   * Get data from cache if it's not expired
   */
  const get = (key: string): T | null => {
    const entry = cache.get(key);
    if (!entry) return null;
    
    const isExpired = Date.now() - entry.timestamp > ttlMs;
    if (isExpired) {
      cache.delete(key);
      return null;
    }
    
    return entry.data;
  };
  
  /**
   * Set data in cache with current timestamp
   */
  const set = (key: string, data: T): void => {
    cache.set(key, { data, timestamp: Date.now() });
  };
  
  /**
   * Remove data from cache
   */
  const remove = (key: string): void => {
    cache.delete(key);
  };
  
  /**
   * Clear all cache entries
   */
  const clear = (): void => {
    cache.clear();
  };
  
  /**
   * Check if key exists in cache and is not expired
   */
  const has = (key: string): boolean => {
    const entry = cache.get(key);
    if (!entry) return false;
    
    const isExpired = Date.now() - entry.timestamp > ttlMs;
    if (isExpired) {
      cache.delete(key);
      return false;
    }
    
    return true;
  };
  
  return {
    get,
    set,
    remove,
    clear,
    has,
  };
}