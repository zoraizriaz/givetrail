"use client";

// Tiny generic localStorage-backed list store, used for prototype-only
// "session created" records (campaigns, expenses) that don't have a real
// backend yet but should still show up immediately for the person using it.

export function readList<T>(key: string): T[] {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

export function appendToList<T>(key: string, item: T): T[] {
  const list = readList<T>(key);
  list.push(item);
  try {
    window.localStorage.setItem(key, JSON.stringify(list));
  } catch {
    // ignore
  }
  return list;
}

export function updateList<T>(key: string, next: T[]): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(next));
  } catch {
    // ignore
  }
}
