// STUB: context collapse stats service (CONTEXT_COLLAPSE feature). Used by
// TokenWarning via useSyncExternalStore. Zero stats => no collapse warning shown.
export interface CollapseStats {
  collapsedSpans: number;
  stagedSpans: number;
  health: {
    totalErrors: number;
    totalEmptySpawns: number;
    emptySpawnWarningEmitted: boolean;
  };
}

export function getStats(): CollapseStats {
  return {
    collapsedSpans: 0,
    stagedSpans: 0,
    health: {
      totalErrors: 0,
      totalEmptySpawns: 0,
      emptySpawnWarningEmitted: false,
    },
  };
}

export function subscribe(_onChange: () => void): () => void {
  return () => {};
}
