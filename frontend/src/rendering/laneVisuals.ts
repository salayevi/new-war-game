import type { UnitCategory } from '../types/schema';

export function laneY(category: UnitCategory): number {
  const yMap: Record<UnitCategory, number> = {
    worker: 370,
    melee: 300,
    ranged: 240,
    shielded: 190,
    heavy: 135,
  };
  return yMap[category];
}

export function laneColor(category: UnitCategory): number {
  const colorMap: Record<UnitCategory, number> = {
    worker: 0xf0c419,
    melee: 0x4a90e2,
    ranged: 0xa55eea,
    shielded: 0x95a5a6,
    heavy: 0xff6b6b,
  };
  return colorMap[category];
}
