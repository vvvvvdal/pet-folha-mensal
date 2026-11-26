"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { UserProfile } from "@/types";
import { GoogleAuthError } from "./google-session";
import {
  DriveConflictError,
  keepConflictCopy,
  lastSyncedAt,
  markMonthDirty,
  pendingMonths,
  pullMonth,
  pullNewerMonths,
  pushMonth,
  trackUnsyncedMonths,
  type RemoteMonth,
} from "./drive-sync";
import { getActivitiesForMonth, getProfileMonths } from "./storage";

export type SyncStatus = "idle" | "saved" | "syncing" | "pending" | "offline" | "reauth" | "error";
export interface SyncConflict {
  monthKey: string;
  remote: RemoteMonth;
}

const PUSH_DELAY_MS = 3000;
const PULL_INTERVAL_MS = 60_000;

interface Options {
  enabled: boolean;
  sub?: string;
  email?: string;
  user: UserProfile | null;
  /** Called after months downloaded from Drive were written into this browser. */
  onRemoteApplied: (months: string[]) => void;
}

export function useDriveSync({ enabled, sub, email, user, onRemoteApplied }: Options) {
  const [status, setStatus] = useState<SyncStatus>("idle");
  const [pending, setPending] = useState(0);
  const [lastSynced, setLastSynced] = useState<string>();
  const [conflict, setConflict] = useState<SyncConflict | null>(null);
  const [resolving, setResolving] = useState(false);
  const [error, setError] = useState("");
  const userRef = useRef(user);
  const appliedRef = useRef(onRemoteApplied);
  const conflictRef = useRef(conflict);
  const running = useRef(false);
  const again = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const lastPull = useRef(0);
  const flushRef = useRef<() => Promise<void>>(async () => {});
  useEffect(() => {
    userRef.current = user;
    appliedRef.current = onRemoteApplied;
    conflictRef.current = conflict;
  });
  const active = enabled && Boolean(sub) && Boolean(user);

  const refreshCounts = useCallback(() => {
    if (!sub) return;
    setPending(pendingMonths(sub).length);
    setLastSynced(lastSyncedAt(sub));
  }, [sub]);

  const fail = useCallback((caught: unknown) => {
    if (caught instanceof DriveConflictError) {
      setConflict({ monthKey: caught.monthKey, remote: caught.remote });
      setStatus("pending");
    } else if (caught instanceof GoogleAuthError) setStatus("reauth");
    else if (typeof navigator !== "undefined" && !navigator.onLine) setStatus("offline");
    else {
      setStatus("error");
      setError(caught instanceof Error ? caught.message : "Falha ao falar com o Google Drive.");
    }
  }, []);

  const flush = useCallback(async () => {
    if (!active || !sub) return;
    if (running.current) {
      again.current = true;
      return;
    }
    if (!navigator.onLine) {
      setStatus("offline");
      refreshCounts();
      return;
    }
    running.current = true;
    setStatus("syncing");
    try {
      for (const month of pendingMonths(sub)) {
        if (conflictRef.current?.monthKey === month || !userRef.current) continue;
        await pushMonth(sub, userRef.current, month);
      }
      setError("");
      setStatus(pendingMonths(sub).length ? "pending" : "saved");
    } catch (caught) {
      fail(caught);
    } finally {
      running.current = false;
      refreshCounts();
      if (again.current) {
        again.current = false;
        timer.current = setTimeout(() => void flushRef.current(), 500);
      }
    }
  }, [active, sub, fail, refreshCounts]);
  useEffect(() => {
    flushRef.current = flush;
  }, [flush]);

  const pull = useCallback(async () => {
    if (!active || !sub || !navigator.onLine || running.current) return;
    lastPull.current = Date.now();
    running.current = true;
    setStatus("syncing");
    try {
      const { updated, conflicts } = await pullNewerMonths(sub, email);
      if (updated.length) appliedRef.current(updated);
      if (conflicts[0]) setConflict({ monthKey: conflicts[0].monthKey, remote: conflicts[0] });
      setStatus(pendingMonths(sub).length ? "pending" : "saved");
    } catch (caught) {
      fail(caught);
    } finally {
      running.current = false;
      refreshCounts();
    }
  }, [active, sub, email, fail, refreshCounts]);

  /** Marks a month as changed and sends it a few seconds later. */
  const schedule = useCallback((monthKey: string) => {
    if (!active || !sub) return;
    markMonthDirty(sub, monthKey);
    refreshCounts();
    setStatus(navigator.onLine ? "pending" : "offline");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => void flush(), PUSH_DELAY_MS);
  }, [active, sub, flush, refreshCounts]);

  useEffect(() => {
    if (!active || !sub || !userRef.current) return;
    const profileId = userRef.current.id;
    trackUnsyncedMonths(sub, getProfileMonths(profileId).filter((month) => getActivitiesForMonth(profileId, month).length > 0));
    let cancelled = false;
    void (async () => {
      await pull();
      if (!cancelled) await flush();
    })();
    const online = () => void flush();
    const offline = () => setStatus("offline");
    const visibility = () => {
      if (document.visibilityState === "hidden") void flush();
      else if (Date.now() - lastPull.current > PULL_INTERVAL_MS) void pull();
    };
    window.addEventListener("online", online);
    window.addEventListener("offline", offline);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      cancelled = true;
      clearTimeout(timer.current);
      window.removeEventListener("online", online);
      window.removeEventListener("offline", offline);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [active, sub, pull, flush]);

  const resolveConflict = useCallback(async (keep: "device" | "drive") => {
    const current = conflictRef.current;
    if (!current || !sub || !userRef.current || resolving) return false;
    setResolving(true);
    try {
      if (keep === "device") {
        await keepConflictCopy(sub, userRef.current, current.monthKey, current.remote);
        await pushMonth(sub, userRef.current, current.monthKey, true);
      } else {
        await keepConflictCopy(sub, userRef.current, current.monthKey, "device");
        const result = await pullMonth(sub, current.remote, { email });
        if (!result.success) throw new Error(result.error);
        appliedRef.current([current.monthKey]);
      }
      setConflict(null);
      conflictRef.current = null;
      refreshCounts();
      void flush();
      return true;
    } catch (caught) {
      fail(caught);
      return false;
    } finally {
      setResolving(false);
    }
  }, [sub, email, resolving, fail, flush, refreshCounts]);

  return { status, pending, lastSynced, conflict, resolving, error, schedule, flush, pull, resolveConflict };
}

export type DriveSync = ReturnType<typeof useDriveSync>;
