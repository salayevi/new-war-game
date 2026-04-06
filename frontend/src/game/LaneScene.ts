import Phaser from 'phaser';
import type { Snapshot, UnitState } from '../types/schema';

export class LaneScene extends Phaser.Scene {
  private latest: Snapshot | null = null;

  constructor() {
    super('lane');
  }

  setSnapshot(snapshot: Snapshot) {
    this.latest = snapshot;
  }

  create() {
    this.add.rectangle(500, 240, 1000, 480, 0x1b1f2a);
    this.add.rectangle(40, 240, 80, 260, 0x2e8b57);
    this.add.rectangle(960, 240, 80, 260, 0xb22222);
    this.add.text(420, 20, 'Lane RTS Rivalry', { color: '#ffffff' });
  }

  update() {
    this.children.removeAll();
    this.create();
    if (!this.latest) return;

    this.latest.units.forEach((u) => this.drawUnit(u));
  }

  private drawUnit(unit: UnitState) {
    const yMap = {
      worker: 370,
      melee: 300,
      ranged: 240,
      shielded: 190,
      heavy: 135,
    } as const;

    const colorMap = {
      worker: 0xf0c419,
      melee: 0x4a90e2,
      ranged: 0xa55eea,
      shielded: 0x95a5a6,
      heavy: 0xff6b6b,
    } as const;

    const x = unit.x;
    const y = yMap[unit.category];
    const color = colorMap[unit.category];
    const radius = unit.team === 'player' ? 12 : 10;

    this.add.circle(x, y, radius, color);
    const hpWidth = 26;
    const hpRatio = Math.max(0, unit.hp / unit.max_hp);
    this.add.rectangle(x, y - 18, hpWidth, 4, 0x333333);
    this.add.rectangle(x - (hpWidth * (1 - hpRatio)) / 2, y - 18, hpWidth * hpRatio, 4, 0x2ecc71);
  }
}
