import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    // 画像を使わず、起動時に簡易テクスチャを生成して使う
  }

  create() {
    // 背景の星空テクスチャ生成
    const w = this.game.config.width as number;
    const h = this.game.config.height as number;
    const g = this.add.graphics();

    g.fillStyle(0x000000, 1);
    g.fillRect(0, 0, w, h);

    // ランダムな星
    for (let i = 0; i < 400; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const a = 0.5 + Math.random() * 0.5;

      g.fillStyle(0xffffff, a);
      g.fillRect(x, y, 2, 2);
    }
    g.generateTexture('starfield', w, h);
    g.clear();

    // プレイヤー（簡易シップ）
    const ship = this.add.graphics();
    ship.fillStyle(0x00e5ff, 1);
    ship.fillTriangle(0, -12, 0, 12, 28, 0); // 右向き三角
    ship.lineStyle(2, 0xffffff, 1);
    ship.strokeTriangle(0, -12, 0, 12, 28, 0);
    ship.generateTexture('player', 30, 30);
    ship.destroy();

    // 弾
    const bullet = this.add.graphics();
    bullet.fillStyle(0xffe066, 1);
    bullet.fillRect(0, 0, 8, 2);
    bullet.generateTexture('bullet', 8, 2);
    bullet.destroy();

    // 敵
    const enemy = this.add.graphics();
    enemy.fillStyle(0xff4d4f, 1);
    enemy.fillCircle(8, 8, 8);
    enemy.lineStyle(2, 0xffffff, 1);
    enemy.strokeCircle(8, 8, 8);
    enemy.generateTexture('enemy', 16, 16);
    enemy.destroy();

    this.scene.start('Game');
  }
}
