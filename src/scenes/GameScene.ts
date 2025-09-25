import Phaser from 'phaser';
import { Player } from '../sprites/Player';

export default class GameScene extends Phaser.Scene {
  private bg!: Phaser.GameObjects.TileSprite;
  private player!: Player;
  private enemies!: Phaser.Physics.Arcade.Group;
  private score = 0;
  private scoreText!: Phaser.GameObjects.Text;
  private gameOver = false;

  constructor() {
    super('Game');
  }

  create() {
    const { width, height } = this.scale;

    // 背景（横スクロール）
    this.bg = this.add.tileSprite(0, 0, width, height, 'starfield').setOrigin(0);

    // プレイヤー
    this.player = new Player(this, 80, height/ 2);
   
    // 敵
    this.enemies = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Image,
      maxSize: 40,
      runChildUpdate: true,
    });

    // 敵スポーン
    this.time.addEvent({ delay: 800, loop: true, callback: this.spawnEnemy, callbackScope: this });

    // 衝突
    this.physics.add.overlap(this.player.bullets, this.enemies, this.hitEnemy as any);
    this.physics.add.overlap(this.player, this.enemies, this.playerHit as any);

    // スコア
    this.scoreText = this.add.text(12, 10, 'SCORE 0', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#fff',
    });
    this.scoreText.setScrollFactor(0);

    // モバイル簡易操作（ドラッグで上下）
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      if (p.isDown && !this.gameOver) this.player.y = Phaser.Math.Clamp(p.y, 0, height);
    });
  }

  update(time: number, delta: number) {
    super.update(time, delta);

    if (this.gameOver) return;

    // 背景スクロール
    this.bg.tilePositionX += 1.6;

    this.player.update(time);

    // 画面外の弾・敵をクリーンアップ
    this.enemies.children.iterate((e: any) => {
      if (!e) return null;
      if (e.active && e.x < -20) e.disableBody(true, true);
      return null;
    });
  }

  private spawnEnemy() {
    const y = Phaser.Math.Between(20, this.scale.height - 20);

    // 15%の確率でenemy2をスポーン、85%の確率でenemy
    const enemyType = Math.random() < 0.15 ? 'enemy2' : 'enemy';
    
    const enemy = this.enemies.get(
      this.scale.width + 20,
      y,
      enemyType
    ) as Phaser.Physics.Arcade.Image;

    if (!enemy) return;
    enemy.enableBody(true, this.scale.width + 20, y, true, true);
    
    // enemy2は少し遅いが、より多くのポイント
    if (enemyType === 'enemy2') {
      enemy.setVelocityX(-100 - Math.random() * 50);
      enemy.setCircle(12, 0, 0); // 少し大きめの当たり判定
      enemy.setData('scoreValue', 25); // より高いスコア
    } else {
      enemy.setVelocityX(-150 - Math.random() * 80);
      enemy.setCircle(8, 0, 0);
      enemy.setData('scoreValue', 10); // 通常のスコア
    }
  }

  private hitEnemy = (
    bullet: Phaser.GameObjects.GameObject,
    enemy: Phaser.GameObjects.GameObject
  ) => {
    const b = bullet as Phaser.Physics.Arcade.Image;
    const e = enemy as Phaser.Physics.Arcade.Image;
    b.disableBody(true, true);
    e.disableBody(true, true);
    
    // enemy2かどうかでスコアを変更
    const scoreValue = e.getData('scoreValue') || 10;
    this.score += scoreValue;
    this.scoreText.setText(`SCORE ${this.score}`);

    // enemy2の場合はより派手な爆発エフェクト
    const isEnemy2 = scoreValue > 10;
    const explosionColor = isEnemy2 ? 0xff6600 : 0xffe066;
    const explosionSize = isEnemy2 ? 20 : 16;
    
    const boom = this.add.circle(e.x, e.y, 2, explosionColor);
    this.tweens.add({
      targets: boom,
      radius: explosionSize,
      alpha: 0,
      duration: isEnemy2 ? 300 : 220,
      onComplete: () => boom.destroy(),
    });
  };

  private playerHit = () => {
    if (this.gameOver) return;
    this.gameOver = true;
    this.player.disableBody(true, true);

    // 複数の爆発エフェクトを時間差で発生
    const explosionCount = 5;
    const explosionColors = [0x00e5ff, 0xff6600, 0xffe066, 0xff0066, 0x66ff00];
    
    for (let i = 0; i < explosionCount; i++) {
      this.time.delayedCall(i * 150, () => {
        // プレイヤー位置から少しランダムにずらした位置に爆発を作成
        const offsetX = Phaser.Math.Between(-20, 20);
        const offsetY = Phaser.Math.Between(-20, 20);
        const boom = this.add.circle(
          this.player.x + offsetX, 
          this.player.y + offsetY, 
          2, 
          explosionColors[i % explosionColors.length]
        );
        
        this.tweens.add({
          targets: boom,
          radius: Phaser.Math.Between(12, 20),
          alpha: 0,
          duration: 300,
          onComplete: () => boom.destroy(),
        });
      });
    }

    // ゲームオーバーテキストは最後の爆発後に表示
    this.time.delayedCall(explosionCount * 150 + 200, () => {
      const txt = this.add.text(
        this.scale.width / 2,
        this.scale.height / 2,
        'GAME OVER\n[Press R to Restart]',
        {
          fontFamily: 'monospace',
          fontSize: '28px',
          color: '#fff',
          align: 'center',
        }
      );
      txt.setOrigin(0.5);

      this.input.keyboard!.once('keydown-R', () => {
        this.gameOver = false;
        this.scene.restart()
      });
    });
  };
}
