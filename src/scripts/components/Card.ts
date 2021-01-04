export default class Card extends Phaser.GameObjects.Sprite {
    public value: number;
    public opened: boolean;
    public position: any;
    constructor(scene, value) {
        super(scene, 0, 0, 'card');
        this.scene = scene;
        this.value = value
        this.opened = false;   
        this.scene.add.existing(this);
        this.setInteractive();    
    }

    public flip(callback?): void {
        this.scene.tweens.add({
            targets: this,
            scaleX: 0,
            ease: 'Linear',
            duration: 150,
            onComplete: () => {
                this.show(callback);
            }
        })
    }

    public show(callback): void {
        let texture:string = this.opened ? 'card' + this.value : 'card';

        this.setTexture(texture);

        this.scene.tweens.add({
            targets: this,
            scaleX: 1,
            ease: 'Linear',
            duration: 150,
            onComplete: () => {
                if (callback) {
                    callback();
                };
            }
        })
    }

    public init(position): void {
        this.position = position;
        this.close();
        this.setPosition(-this.width, -this.width);
    }

    public move(params): void {
        this.scene.tweens.add({
            targets: this,
            x: params.x,
            y: params.y,
            delay: params.delay,
            ease: 'Linear',
            duration: 250,
            onComplete: ()=>{
                if (params.callback) {
                    params.callback();
                }
            }        
        })
    }

    public open(callback): void {
        this.opened = true;
        this.flip(callback);
    }

    public close(): void {
        if (this.opened) {
            this.opened = false;
            this.flip();
        }
    }
}