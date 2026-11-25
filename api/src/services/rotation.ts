/**
 * Rotation solver.
 *
 * Produces a conflict-free schedule where every team visits every station
 * exactly once. With T teams and S stations, we pad the position set with a
 * "Base Camp" rest slot when T > S so the matrix stays square, then rotate a
 * Latin square: no station is used twice in the same round, and no team repeats
 * a station. This is the v1 solver; the production version also honours
 * facilitator availability windows, room changeover buffers and fixed slots.
 */

export interface RotationInput {
  teamIds: string[];
  stationIds: string[];
}

export interface RotationCellOut {
  teamId: string;
  round: number; // 1-based
  stationId: string | null; // null = Base Camp / rest
}

export function solveRotation({ teamIds, stationIds }: RotationInput): {
  rounds: number;
  cells: RotationCellOut[];
} {
  const positions: (string | null)[] = [...stationIds];
  while (positions.length < teamIds.length) positions.push(null); // Base Camp rest slots
  const rounds = positions.length;

  const cells: RotationCellOut[] = [];
  teamIds.forEach((teamId, ti) => {
    for (let r = 0; r < rounds; r++) {
      cells.push({ teamId, round: r + 1, stationId: positions[(ti + r) % positions.length] });
    }
  });

  if (!verifyNoClash(cells, rounds)) {
    throw new Error("rotation solver produced a clash");
  }
  return { rounds, cells };
}

/** Each station appears at most once per round (no two teams share a station). */
export function verifyNoClash(cells: RotationCellOut[], rounds: number): boolean {
  for (let r = 1; r <= rounds; r++) {
    const seen = new Set<string>();
    for (const c of cells) {
      if (c.round !== r || c.stationId === null) continue;
      if (seen.has(c.stationId)) return false;
      seen.add(c.stationId);
    }
  }
  return true;
}
