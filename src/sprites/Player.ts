import { Scene } from 'phaser';

export class Player extends Phaser.Physics.Arcade.Sprite {
  private context: Scene;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private fireKey!: Phaser.Input.Keyboard.Key;
  private lastFired = 0;
  public bullets!: Phaser.Physics.Arcade.Group;

  constructor ( scene: Scene, x: number, y: number ) {
    super(scene, x, y, 'player');
    this.scene.add.existing(this);

    this.context = scene;
    this.scene.physics.world.enable(this);
    this.setCollideWorldBounds(true);

    // 入力
    this.cursors = this.context.input.keyboard!.createCursorKeys();
    this.fireKey = this.context.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.bullets = this.context.physics.add.group({
      classType: Phaser.Physics.Arcade.Image,
        maxSize: 30,
        runChildUpdate: true,
      });
  }

  update (time: number) {
    const speed = 220;
    this.setVelocity(0);
    if (this.cursors.up?.isDown) this.setVelocityY(-speed);
    else if (this.cursors.down?.isDown) this.setVelocityY(speed);
    if (this.cursors.left?.isDown) this.setVelocityX(-speed);
    else if (this.cursors.right?.isDown) this.setVelocityX(speed);

    const fireRate = 120; // ms
    if (this.fireKey.isDown && time > this.lastFired + fireRate) {
      this.fireBullet();
      this.lastFired = time;
    }

    this.bullets.children.iterate((b: any) => {
      if (!b) return null;
      if (b.active && b.x > this.context.scale.width + 20) b.disableBody(true, true);
      return null;
    });
  }

  private fireBullet() {
    const bullet = this.bullets.get(
      this.x + 20  ,
      this.y - 12 ,
      'bullet'
    ) as Phaser.Physics.Arcade.Image;
    if (!bullet) return;
    bullet.enableBody(true, this.x + 20, this.y - 12, true, true);
    bullet.setVelocityX(480);
    bullet.setDepth(1);
  }
}
