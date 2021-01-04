import Card from './../components/Card';

export default class GameScene extends Phaser.Scene {
    private bg: Phaser.GameObjects.Image;
    private cards: Card[];
    private openedCard: Card;
    private openedCardsCount: number;
    private timeoutText: Phaser.GameObjects.Text;
    private sounds: {
        card: Phaser.Sound.BaseSound,
        theme: Phaser.Sound.BaseSound,
        success: Phaser.Sound.BaseSound,
        timeout: Phaser.Sound.BaseSound,
        complete: Phaser.Sound.BaseSound,
    };
    private timer: Phaser.Time.TimerEvent;
    private positions: any[];
    private levelSetting: {
        cardsId: number[],
        timeout: number,
        rows: number,
        cols: number
    }[];
    private levelCounter: number;
    private levelCounterText: Phaser.GameObjects.Text;
    private currentTimer: number;
    private scoreText: Phaser.GameObjects.Text;
    private score: number;
    private successfulSeries: number;
    constructor() {
        super('Game');   
        this.levelSetting = [
            {
                cardsId: [1, 2],
                timeout: 15,
                rows: 2,
                cols: 2
            },
            {
                cardsId: [1, 2, 3],
                timeout: 20,
                rows: 2,
                cols: 3
            },
            {
                cardsId: [1, 2, 3, 4],
                timeout: 25,
                rows: 2,
                cols: 4
            },
            {
                cardsId: [1, 2, 3, 4, 5],
                timeout: 30,
                rows: 2,
                cols: 5
            },
            {
                cardsId: [1, 2, 3, 4, 5],
                timeout: 25,
                rows: 2,
                cols: 5
            },
            {
                cardsId: [1, 2, 3, 4, 5],
                timeout: 20,
                rows: 2,
                cols: 5
            },
            {
                cardsId: [1, 2, 3, 4, 5],
                timeout: 15,
                rows: 2,
                cols: 5
            },
        ]
        this.levelCounter = 0;
        this.score = 0;
        this.successfulSeries = 0;
    }

    public preload(): void {
        this.load.image('bg', '../../../public/assets/background.png');
        this.load.image('card', '../../../public/assets/card.png');
        this.load.image('card1', '../../../public/assets/card1.png');
        this.load.image('card2', '../../../public/assets/card2.png');
        this.load.image('card3', '../../../public/assets/card3.png');
        this.load.image('card4', '../../../public/assets/card4.png');
        this.load.image('card5', '../../../public/assets/card5.png');

        this.load.audio('theme', '../../../public/sounds/theme.mp3');
        this.load.audio('card', '../../../public/sounds/card.mp3');
        this.load.audio('complete', '../../../public/sounds/complete.mp3');
        this.load.audio('success', '../../../public/sounds/success.mp3');
        this.load.audio('timeout', '../../../public/sounds/timeout.mp3');
    }

    public create(): void {
        this.createTimer();
        this.createBackground();
        this.createText();
        this.start();
        this.createSound();
    }
    
    private createText(): void {
        this.timeoutText = this.add.text(10, 330, '', {
            font: '24px Arial',
            color: '#ffffff'
        });
        this.levelCounterText = this.add.text(10, 250, '', {
            font: '24px Arial',
            color: '#ffffff'
        });
        this.scoreText = this.add.text(10, 200, '', {
            font: '24px Arial',
            color: '#ffffff'
        }
        )
    }

    private createSound(): void {
        this.sounds = {
            card: this.sound.add('card'),
            theme: this.sound.add('theme'),
            complete: this.sound.add('complete'),
            success: this.sound.add('success'),
            timeout: this.sound.add('timeout')
        };
        this.sounds.theme.play({ volume: 0.1, loop: true });
    }

    private onTimerTick(): void {
        this.timeoutText.setText('Time: ' + this.currentTimer);
        
        if (this.currentTimer <= 0) {
            this.timer.paused = true;
            this.sounds.timeout.play();
            this.levelCounter = 0;
            this.restart();
        }

        --this.currentTimer;

    }

    private createTimer(): void {
        this.timer = this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.onTimerTick();
            },
            callbackScope: this,
            loop: true 
        })
    }

    private setLevelCounterText(): void {
        let level = this.levelCounter + 1;
        this.levelCounterText.setText('Level: ' + level);
    }

    private setScroreText(): void {
        this.scoreText.setText('Score ' + this.score);
    }

    private restart(): void {
        let count = 0;
        const onCardMoveComplete = () => {
            ++count;
            if (count >= this.cards.length) {
                this.cards.forEach(card => {
                    card.destroy();
                })
                this.start();
            }
        };
        this.cards.forEach(card => {
            card.move({
                x: Number(this.sys.game.config.width) + card.width,
                y: Number(this.sys.game.config.height) + card.height,
                delay: card.position.delay,
                callback: onCardMoveComplete,
            });
        });
    }

    private start(): void {
        this.initCardsPositions();
        this.createCards();
        this.openedCard = null;
        this.openedCardsCount = 0;
        this.timer.paused = false;
        this.currentTimer = this.levelSetting[this.levelCounter].timeout;
        this.setLevelCounterText();
        this.setScroreText();
        this.initCards();
        this.showCards();
    }

    private initCards(): void {
        const positions = Phaser.Utils.Array.Shuffle(this.positions);
        this.cards.forEach(card => {
            card.init(positions.pop());
        })
    }

    private showCards(): void {
        this.cards.forEach(card => {
            card.depth = card.position.delay;
            card.move({
                x: card.position.x,
                y: card.position.y,
                delay: card.position.delay
            });
        })
    }

    private createBackground(): void {
        this.bg = this.add.image(0, 0, 'bg');
        this.bg.setOrigin(0, 0);
    }

    private createCards(): void {
        this.cards = [];       

        for (let value of this.levelSetting[this.levelCounter].cardsId) {
            for (let i = 0; i < 2; i++) {
                this.cards.push(new Card(this, value))
            }
        }

        this.input.on('gameobjectdown', this.onCardClicked, this);
    }

    private addScore(): void {
        if (this.successfulSeries === 0) {
            this.score += 100;
            this.successfulSeries++
        } else if (this.successfulSeries === 1) {
            this.score += 250;
            this.successfulSeries++
        } else if (this.successfulSeries === 2) {
            this.score += 500;
            this.successfulSeries++
        } else if (this.successfulSeries === 3) {
            this.score += 1000;
            this.successfulSeries++
        } else if (this.successfulSeries === 4) {
            this.score += 5000;
        } 
        this.setScroreText();
    } 

    private onCardClicked(pointer, card) {
        if (card.opened) {
            return false;
        }
        this.setScroreText();
        this.sounds.card.play();
        if (this.openedCard) {
            if (this.openedCard.value === card.value) {
                this.sounds.success.play();
                this.openedCard = null;
                ++this.openedCardsCount;
                this.addScore();
            } else {
                this.successfulSeries = 0;
                this.openedCard.close();
                this.openedCard = card;
            }
        } else {
            this.openedCard = card;
        }
        
        card.open(()=>{
            if (this.openedCardsCount === this.cards.length / 2) {
                this.levelCounter++;
                if (!(this.levelCounter >= this.levelSetting.length)) {
                    this.sounds.complete.play();
                    this.restart();
                } else {
                    this.levelCounter = 0;
                }
            }
        }); 
    }

    private initCardsPositions(): void {
        this.positions = [];
        const cardTexture = this.textures.get('card').getSourceImage();
        const cardWidth: number = cardTexture.width + 4;
        const cardHeight: number = cardTexture.height + 4;
        const offsetX: number = (Number(this.sys.game.config.width) - cardWidth * this.levelSetting[this.levelCounter].cols) / 2 + cardWidth / 2;
        const offsetY: number = (Number(this.sys.game.config.height) - cardHeight * this.levelSetting[this.levelCounter].rows) / 2 + cardHeight / 2;
        let id: number = 0
        for (let row: number = 0; row < this.levelSetting[this.levelCounter].rows; row++) {
            for (let col: number = 0; col < this.levelSetting[this.levelCounter].cols; col++) {
                ++id;
                this.positions.push({
                    delay: id * 100 ,
                    x: offsetX + col * cardWidth, 
                    y: offsetY + row * cardHeight
                })
            }
        }
    }

    
}