import type {
  StoredAnalysis,
  StoredComparison,
  StoredHistoryEntry,
} from "@/types/history";

const STORAGE_KEY = "source-critic-history-v2";

function isBrowser() {
  return typeof window !== "undefined";
}

export function getStoredHistoryEntries(): StoredHistoryEntry[] {
  if (!isBrowser()) return [];

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as StoredHistoryEntry[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function getStoredAnalyses(): StoredAnalysis[] {
  return getStoredHistoryEntries().filter(
    (item): item is StoredAnalysis => item.kind === "analysis",
  );
}

export function getStoredComparisons(): StoredComparison[] {
  return getStoredHistoryEntries().filter(
    (item): item is StoredComparison => item.kind === "comparison",
  );
}

export function saveStoredAnalysis(entry: Omit<StoredAnalysis, "kind">) {
  if (!isBrowser()) return;

  const current = getStoredHistoryEntries();
  const next: StoredHistoryEntry[] = [{ ...entry, kind: "analysis" }, ...current];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function saveStoredComparison(entry: Omit<StoredComparison, "kind">) {
  if (!isBrowser()) return;

  const current = getStoredHistoryEntries();
  const next: StoredHistoryEntry[] = [{ ...entry, kind: "comparison" }, ...current];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function deleteStoredHistoryEntry(id: string) {
  if (!isBrowser()) return;

  const current = getStoredHistoryEntries();
  const next = current.filter((item) => item.id !== id);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function clearStoredAnalyses() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(STORAGE_KEY);
}