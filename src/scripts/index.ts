import * as Phaser from "phaser";
import GameScene from './scenes/GameScene';

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: "minesweeper",
    width: 1280,
    height: 720,
    scene: GameScene,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
        }
    },
};

export default new Phaser.Game(config);