import Phaser from 'phaser';
import { laneColor, laneY } from '../rendering/laneVisuals';
import type { Snapshot, UnitState } from '../types/schema';

type UnitSprite = {
  container: Phaser.GameObjects.Container;
  body: Phaser.GameObjects.Arc;
  hpFront: Phaser.GameObjects.Rectangle;
  targetX: number;
  lastHp: number;
};

export class LaneScene extends Phaser.Scene {
  private latest: Snapshot | null = null;
  private sprites = new Map<string, UnitSprite>();

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
    this.add.text(420, 20, 'Lane RTS Rivalry (Local Prototype)', { color: '#ffffff' });
  }

  update() {
    if (!this.latest) return;

    const seen = new Set<string>();
    this.latest.units.forEach((unit) => {
      seen.add(unit.id);
      const sprite = this.sprites.get(unit.id);
      if (sprite) {
        this.updateSprite(sprite, unit);
      } else {
        this.sprites.set(unit.id, this.createSprite(unit));
      }
    });

    this.sprites.forEach((sprite, id) => {
      if (!seen.has(id)) {
        this.tweens.add({
          targets: sprite.container,
          alpha: 0,
          duration: 180,
          onComplete: () => sprite.container.destroy(),
        });
        this.sprites.delete(id);
      }
    });
  }

  private createSprite(unit: UnitState): UnitSprite {
    const body = this.add.circle(0, 0, unit.team === 'player' ? 12 : 10, laneColor(unit.category));
    const hpBack = this.add.rectangle(0, -18, 26, 4, 0x333333);
    const hpFront = this.add.rectangle(0, -18, 26, 4, 0x2ecc71);
    const container = this.add.container(unit.x, laneY(unit.category), [body, hpBack, hpFront]);

    return {
      container,
      body,
      hpFront,
      targetX: unit.x,
      lastHp: unit.hp,
    };
  }

  private updateSprite(sprite: UnitSprite, unit: UnitState) {
    sprite.targetX = unit.x;
    sprite.container.x = Phaser.Math.Linear(sprite.container.x, sprite.targetX, 0.35);
    sprite.container.y = laneY(unit.category);

    const hpRatio = Math.max(0, unit.hp / unit.max_hp);
    sprite.hpFront.width = 26 * hpRatio;
    sprite.hpFront.x = -(26 * (1 - hpRatio)) / 2;

    sprite.body.setScale(unit.state === 'attacking' ? 1.06 : 1);

    if (unit.hp < sprite.lastHp) {
      sprite.body.setTintFill(0xffffff);
      this.time.delayedCall(70, () => {
        if (sprite.body.active) sprite.body.clearTint();
      });
      this.tweens.add({ targets: sprite.body, scale: 1.13, yoyo: true, duration: 90 });
    }

    sprite.lastHp = unit.hp;
  }
}
