class Boot extends Phaser.Scene {

    constructor ()
    {
        super('boot');
    }

    init ()
    {
        let element = document.createElement('style');

        document.head.appendChild(element);

        element.sheet.insertRule('@font-face { font-family: "bebas"; src: url("https://labs.phaser.io/assets/fonts/ttf/bebas.ttf") format("truetype"); }', 0);

        this.registry.set('highscore', 0);
        this.registry.set('newBest', false);
    }

    preload ()
    {
        this.load.setBaseURL("https://labs.phaser.io")

        this.load.image('bg', 'assets/skies/gradient26.png');
        this.load.image('grid', 'assets/skies/grid.png');
        this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');

        this.load.audio('place', [
            'assets/audio/stacker/place.ogg',
            'assets/audio/stacker/place.m4a'
        ]);

        this.load.audio('miss', [
            'assets/audio/stacker/miss.ogg',
            'assets/audio/stacker/miss.m4a'
        ]);

        this.load.audio('gamelost', [
            'assets/audio/stacker/gamelost.ogg',
            'assets/audio/stacker/gamelost.m4a'
        ]);

        this.load.audio('gamewon', [
            'assets/audio/stacker/gamewon.ogg',
            'assets/audio/stacker/gamewon.m4a'
        ]);
    }

    create ()
    {
        let scene = this.scene;

        WebFont.load({
            custom: {
                families: [ 'bebas' ]
            },
            active: function ()
            {
                scene.start('instructions');
            }
        });
    }

}

class Instructions extends Phaser.Scene {

    constructor ()
    {
        super('instructions');
    }

    create ()
    {
        this.add.image((config.width / 2), (config.height / 2), 'bg').setDisplaySize(config.width, config.height);
        this.add.image((config.width / 2), config.height - 200, 'grid').setDisplaySize(800, 376);

        this.add.text(config.width / 2, config.height / 20, 'Instructions:', { fontFamily: 'bebas', fontSize: config.width / 7, color: '#ffffff'}).setShadow(2, 2, "#333333", 2, false, true).setOrigin(0.5);

        var help = [
            'Build a tower to the top of the screen',
            'Place rows of blocks on top of each other,',
            'but be careful: it gets faster each time,',
            'and you lose blocks if you don\'t land,',
            'perfectly or after rows 5 and 10!'
        ];

        this.add.text(config.width / 2, config.height / 5, help, { fontFamily: 'bebas', fontSize: config.width / 20, color: '#ffffff', align: 'center', lineSpacing: 6 }).setShadow(2, 2, "#333333", 2, false, true).setOrigin(0.5);

        this.add.text(config.width / 2, config.height / 1.5, 'Click to begin!', { fontFamily: 'bebas', fontSize: config.width / 7, color: '#ffffff' }).setShadow(2, 2, "#333333", 2, false, true).setOrigin(0.5);

        this.input.keyboard.once('keydown_SPACE', this.start, this);
        this.input.once('pointerdown', this.start, this);
    }

    start ()
    {
        this.scene.start('game');
    }

}

class StackerGame extends Phaser.Scene {

    constructor ()
    {
        super('game');

        this.grid;
        this.gridWidth = 7;
        this.gridHeight = 15;
        this.gridSize = Math.floor(config.width * 16/207);

        this.block1;
        this.block2;
        this.block3;

        this.speed = 250;

        this.direction = 0;
        this.currentY = 0;
        this.timer;

        this.offset = { x: this.gridSize * 3, y: this.gridSize * 2 };
    }

    init ()
    {
        this.grid = [];

        this.speed = 250;

        this.direction = 0;
        this.currentY = this.gridHeight;
    }

    create ()
    {
        let ox = this.offset.x;
        let oy = this.offset.y;

        let gw = this.gridWidth;
        let gh = this.gridHeight;

        let size = this.gridSize;

        let rows = [ 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1 ];

        this.add.image((config.width / 2), (config.height / 2), 'bg').setDisplaySize(config.width, config.height);
        this.add.image((config.width / 2), config.height - 200, 'grid').setDisplaySize(800, 376);


        for (let [index, item] of rows.entries()) {
          this.add.text(ox - size, oy + index * size, item, { fontFamily: 'bebas', fontSize: size / 1.3, color: '#ffffff', align: 'right' }).setShadow(2, 2, "#333333", 2, false, true);
        }

        this.add.grid(ox, oy, gw * size, gh * size, size, size, 0x999999, 1, 0x666666).setOrigin(0);

        this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.block1 = this.add.rectangle(ox + size * 2, oy + (this.currentY - 1) * size, size - 1, size - 1, 0x99ffff).setOrigin(0);
        this.block2 = this.add.rectangle(ox + size * 3, oy + (this.currentY - 1) * size, size - 1, size - 1, 0x99ffff).setOrigin(0);
        this.block3 = this.add.rectangle(ox + size * 4, oy + (this.currentY - 1) * size, size - 1, size - 1, 0x99ffff).setOrigin(0);

        for (var y = 0; y < gh; y++)
        {
            this.grid.push([ 0, 0, 0, 0, 0, 0, 0 ]);
        }

        this.timer = this.time.addEvent({ delay: this.speed, callback: this.moveBlocks, callbackScope: this, loop: true });

        this.input.keyboard.on('keydown_SPACE', this.drop, this);
        this.input.on('pointerdown', this.drop, this);
    }

    getGridX (block)
    {
        return (block.x - this.offset.x) / this.gridSize;
    }

    hasBlockBelow (block)
    {
        return (block && this.grid[this.currentY][this.getGridX(block)]);
    }

    totalBlocks ()
    {
        let total = 0;

        if (this.block1)
        {
            total++;
        }

        if (this.block2)
        {
            total++;
        }

        if (this.block3)
        {
            total++;
        }

        return total;
    }

    moveBlocks ()
    {
        let block1 = this.block1;
        let block2 = this.block2;
        let block3 = this.block3;

        let size = this.gridSize;
        let gw = this.gridWidth;

        if (this.direction === 0)
        {
            //  Moving right
            if (block1)
            {
                block1.x += size;

                if (this.getGridX(block1) === gw - 1)
                {
                    this.direction = 1;
                }
            }

            if (block2)
            {
                block2.x += size;

                if (this.getGridX(block2) === gw - 1)
                {
                    this.direction = 1;
                }
            }

            if (block3)
            {
                block3.x += size;

                if (this.getGridX(block3) === gw - 1)
                {
                    this.direction = 1;
                }
            }
        }
        else
        {
            //  Moving left
            if (block1)
            {
                block1.x -= size;

                if (block1 && this.getGridX(block1) === 0)
                {
                    this.direction = 0;
                }
            }

            if (block2)
            {
                block2.x -= size;

                if (block2 && this.getGridX(block2) === 0)
                {
                    this.direction = 0;
                }
            }

            if (block3)
            {
                block3.x -= size;

                if (block3 && this.getGridX(block3) === 0)
                {
                    this.direction = 0;
                }
            }
        }
    }

    drop ()
    {
        this.timer.remove(false);

        let pos1 = (this.block1) ? this.getGridX(this.block1) : -1;
        let pos2 = (this.block2) ? this.getGridX(this.block2) : -1;
        let pos3 = (this.block3) ? this.getGridX(this.block3) : -1;

        let mapY = this.currentY - 1;

        if (this.currentY === this.gridHeight)
        {
            //  Is this the first row? If so we just drop and carry on.

            this.grid[mapY][pos1] = 1;
            this.grid[mapY][pos2] = 1;
            this.grid[mapY][pos3] = 1;

            this.sound.play('place');

            this.nextRow();
        }
        else
        {
            //  Can we drop? First check all 3 blocks. If none of them have anything
            //  below then it's game over.

            var droppedOne = false;

            if (!this.hasBlockBelow(this.block1) && !this.hasBlockBelow(this.block2) && !this.hasBlockBelow(this.block3))
            {
                this.gameOver();
            }
            else
            {
                //  Drop them one by one
                if (this.block1)
                {
                    if (this.hasBlockBelow(this.block1))
                    {
                        //  There's something below this block, so we're good to carry on
                        this.grid[mapY][pos1] = 1;
                    }
                    else
                    {
                        //  There's nothing below this block, so they lose it
                        this.block1.visible = false;
                        this.block1 = null;
                        droppedOne = true;
                    }
                }

                if (this.block2)
                {
                    if (this.hasBlockBelow(this.block2))
                    {
                        //  There's something below this block, so we're good to carry on
                        this.grid[mapY][pos2] = 1;
                    }
                    else
                    {
                        //  There's nothing below this block, so they lose it
                        this.block2.visible = false;
                        this.block2 = null;
                        droppedOne = true;
                    }
                }

                if (this.block3)
                {
                    if (this.hasBlockBelow(this.block3))
                    {
                        //  There's something below this block, so we're good to carry on
                        this.grid[mapY][pos3] = 1;
                    }
                    else
                    {
                        //  There's nothing below this block, so they lose it
                        this.block3.visible = false;
                        this.block3 = null;
                        droppedOne = true;
                    }
                }

                if (this.block1 || this.block2 || this.block3)
                {
                    if (this.currentY === 1)
                    {
                        this.currentY--;

                        this.gameOver();
                    }
                    else
                    {
                        if (droppedOne)
                        {
                            this.sound.play('miss');
                        }
                        else
                        {
                            this.sound.play('place');
                        }

                        this.nextRow();
                    }
                }
                else
                {
                    this.gameOver();
                }
            }
        }
    }

    nextRow ()
    {
        this.currentY--;

        if (this.currentY === 10 || this.currentY === 5)
        {
            this.speed -= (this.currentY === 10) ? 100 : 50;

            //  We also need to remove a block if they've still got the full amount
            if (this.currentY === 10 && this.totalBlocks() === 3)
            {
                //  3 down to 2
                this.block1 = null;
            }
            else if (this.currentY === 5 && this.totalBlocks() === 2)
            {
                //  2 down to 1
                if (this.block1 && this.block2 || this.block1 && this.block3)
                {
                    this.block1 = null;
                }
                else
                {
                    this.block2 = null;
                }
            }
        }

        //  Pick either left or right to appear from

        let side = 0;
        let size = this.gridSize;
        let shift = size;

        let ox = this.offset.x;
        let oy = this.offset.y;

        if (Math.random() >= 0.5)
        {
            this.direction = 1;
            side = (this.gridWidth - 1) * size;
            shift = -size;
        }
        else
        {
            this.direction = 0;
        }

        if (this.block1)
        {
            this.block1 = this.add.rectangle(ox + side, oy + (this.currentY - 1) * size, size - 1, size - 1, 0x99ffff).setOrigin(0);
            side += shift;
        }

        if (this.block2)
        {
            this.block2 = this.add.rectangle(ox + side, oy + (this.currentY - 1) * size, size - 1, size - 1, 0x99ffff).setOrigin(0);
            side += shift;
        }

        if (this.block3)
        {
            this.block3 = this.add.rectangle(ox + side, oy + (this.currentY - 1) * size, size - 1, size - 1, 0x99ffff).setOrigin(0);
        }

        this.timer = this.time.addEvent({ delay: this.speed, callback: this.moveBlocks, callbackScope: this, loop: true });
    }

    gameOver ()
    {
        this.timer.remove(false);

        this.input.keyboard.off('keydown_SPACE', this.drop);
        this.input.off('pointerdown', this.drop);

        this.registry.set('score', this.gridHeight - this.currentY);

        this.scene.pause();
        this.scene.run('gameOver');
    }
}

class GameOver extends Phaser.Scene {

    constructor ()
    {
        super('gameOver');
    }

    create ()
    {
        this.add.rectangle(config.width / 2, config.height / 2, config.width, config.height, 0x000000, 0.7);

        var list = [
            'Tiny Bonus:',
            '',
            'Minor Prize:',
            '',
            'Major Prize:'
        ];

        var prizes1 = [ 'A Paperclip', 'Half-eaten Sandwich', 'A Boiled Egg', 'Used Gum', 'A Goldfish', 'A Book about Flash' ];
        var prizes2 = [ 'Mario Stickers', 'SNES Joypad', 'Superman Cape', 'Contra Poster', 'Bubble Machine', 'X-Ray Specs', 'Skateboard' ];
        var prizes3 = [ 'Playstation 4', 'A Tardis', 'An X-Wing', 'Super Nintendo', 'Arcade Machine', 'Dragon Egg', 'Personal Cyborg' ];

        var prizelist = [
            'Nothing',
            '',
            'Nothing',
            '',
            'Nothing'
        ];

        var title = 'GAME OVER!';

        if (this.registry.get('score') >= 5)
        {
            prizelist[0] = Phaser.Utils.Array.GetRandom(prizes1);
        }

        if (this.registry.get('score') >= 10)
        {
            prizelist[2] = Phaser.Utils.Array.GetRandom(prizes2);
        }

        if (this.registry.get('score') === 15)
        {
            prizelist[4] = Phaser.Utils.Array.GetRandom(prizes3);
            title = 'GAME WON!';
        }

        if (this.registry.get('score') < 15)
        {
            this.sound.play('gamelost');
        }
        else
        {
            this.sound.play('gamewon');
        }

        if (this.registry.get('score') > this.registry.get('highscore')) {

          this.registry.set('highscore', this.registry.get('score'));
          this.registry.set('newBest', true);

        } else {

          this.registry.set('newBest', false);

        }

        this.add.text(config.width / 2, config.height / 16, title, { fontFamily: 'bebas', fontSize: config.width / 5, color: '#ffffff' }).setShadow(2, 2, "#333333", 2, false, true).setOrigin(0.5);
        this.add.text(config.width / 2, config.height / 6, 'Let\'s see what you have won:', { fontFamily: 'bebas', fontSize: config.width / 13, color: '#ffffff' }).setShadow(2, 2, "#333333", 2, false, true).setOrigin(0.5);

        this.add.text(config.width / 2 - config.width / 4, config.height / 2.5, list, { fontFamily: 'bebas', fontSize: config.width / 18, color: '#ffffff', align: 'right' }).setShadow(2, 2, "#333333", 2, false, true).setOrigin(0.5);
        this.add.text(config.width / 2 + config.width / 4, config.height / 2.5, prizelist, { fontFamily: 'bebas', fontSize: config.width / 18, color: '#ffff00' }).setShadow(2, 2, "#333333", 2, false, true).setOrigin(0.5);

        if (this.registry.get('newBest') == false) {
          this.add.text(config.width / 2, config.height - config.height / 5, `Score: ${this.registry.get('score')}`, { fontFamily: 'bebas', fontSize: config.width / 20, color: '#ffffff' }).setShadow(2, 2, "#333333", 2, false, true).setOrigin(0.5);
          this.add.text(config.width / 2, config.height - config.height / 7, `Highscoree: ${this.registry.get('highscore')}`, { fontFamily: 'bebas', fontSize: config.width / 20, color: '#ffffff' }).setShadow(2, 2, "#333333", 2, false, true).setOrigin(0.5);
        } else {
          this.add.text(config.width / 2, config.height - config.height / 7, `new highscore: ${this.registry.get('score')}`, { fontFamily: 'bebas', fontSize: config.width / 20, color: '#ffffff' }).setShadow(2, 2, "#333333", 2, false, true).setOrigin(0.5);
        }

        this.add.text(config.width / 2, config.height - config.height / 10, 'Click to try again!', { fontFamily: 'bebas', fontSize: config.width / 20, color: '#ffffff' }).setShadow(2, 2, "#333333", 2, false, true).setOrigin(0.5);

        this.input.keyboard.once('keydown_SPACE', this.restart, this);
        this.input.once('pointerdown', this.restart, this);
    }

    restart ()
    {
        this.scene.start('game');
    }

}

var config = {
    type: Phaser.AUTO,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: (window.innerHeight * 428) / 926,
    height: window.innerHeight,
    parent: 'phaser-example',
    scene: [ Boot, Instructions, StackerGame, GameOver ]
};

var game = new Phaser.Game(config);
