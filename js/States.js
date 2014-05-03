//persistent variables
var score = 0;
var iter = 0;

States = {};
States.MainMenuState = function(game){
	this.button;
}
States.MainMenuState.prototype = {
	preload: function() {
		this.load.image('background', 'assets/mainmenu.png');
		this.load.spritesheet('button', 'assets/button.png', 193, 71, 3);
	},

	create: function() {
		this.add.sprite(0, 0, 'background');
		this.button = this.add.button(703.5, 464.5, 'button', this.startGame, this, 1, 1, 0);
	},

	startGame: function() {
		this.state.start('dungeon');
	}
}
States.DungeonState = function(game){
	this.generator;
	this.gameMap;
	this.tiles;
	this.width = 100; //how many tiles make up the width
	this.height = 30; //how many tiles make up the height
	this.tileSize = 100; //The size of each tile in the game world (in pixels)
	this.spriteSize = 70; //The size of the images you are using for tiles
	this.tileScale;
	this.wallSprites;
	this.floor;
	this.player;
	this.playerMapPositionX;
	this.playerMapPositionY;
	this.colliders;
	this.renderDistance;
	this.speed;
	this.sword;
	this.swordBody;
	this.swinging = false;
	this.swingTimer = 0;
	this.shield;
	this.shieldUp = false;
	this.enemies;
	this.spawner;
	this.swingSound;
	this.mapRenderer;
	this.scoreText;
		
	this.damageTimer = 0;
		
	this.key1;
	this.keye;
	
	this.degrees = 1;
	this.maxSwingAngle = 135;
	this.swingSpeed = 500;
	this.currentSwing;
	this.swordSpriteLength = 40;
	this.swordLength;
	
	this.stairs;
};

States.DungeonState.prototype = {
	preload : function() {
		this.load.image('corner', 'assets/corner.png');
		this.load.image('wall', 'assets/wall.png');
		this.load.image('floor', 'assets/floor.png');
		this.load.image('stairs', 'assets/stairs.png');
		this.load.image('invisible', 'assets/invisibleWall.png');
		this.load.image('sword', 'assets/sword.png');
		this.load.image('shield', 'assets/shield.png');
		this.load.spritesheet('healthbar', 'assets/health_bar.png', 35, 32, 6);
		this.load.spritesheet('player', 'assets/playercharacter.png', 51, 70, 6);
		this.load.spritesheet('darkknight', 'assets/darkknight.png', 50, 70, 6);
		this.load.spritesheet('archer', 'assets/archer.png', 50, 70, 6);
		this.load.spritesheet('bloodknight', 'assets/bloodknight.png', 50, 70, 6);
		
		this.load.audio('swing', 'assets/Swoosh.mp3');
	},
	
	create: function() {
		this.stage.backgroundColor = 0x000000;
		this.enemies = new Array();
		
		//Sets the speed to be scaled based on the map world instead of the camera view
		if(this.width > this.height){
			this.speed = this.game.width;
		}
		else{
			this.speed = this.game.height;
		}
		this.speed = (this.speed * this.tileSize) / 500;
		
		this.physics.startSystem(Phaser.Physics.ARCADE);
		this.tileScale = this.tileSize/this.spriteSize;
		
		//MonsterSpawner
		this.spawner = new MonsterSpawner(this.game, this.tileSize, this.tileScale);

		//New generator (max room size, minimum room size)
		this.generator = new Map(10, 1);
		this.mapRenderer = new MapRenderer(this.game, this.tileSize, this.tileScale, this.width, this.height);
		
		
		//Setup sword sprite
		this.sword = this.add.sprite(0, 0, 'sword');
		this.sword.scale.x *= this.tileScale;
		this.sword.scale.y *= this.tileScale;
		this.sword.anchor.setTo(0, 1.3);
		this.sword.kill();

		//And the shield sprite
		this.shield = this.add.sprite(0, 0, 'shield');
		this.shield.scale.x *= this.tileScale;
		this.shield.scale.y *= this.tileScale;
		this.shield.anchor.setTo(0.45, 2.2);
		this.shield.kill();
		
		//Create the swords body
		this.swordBody = new Array();
		for(var i = 0; i < 5; i++){
			this.swordBody.push( this.add.sprite(0, 0, 'floor'));
			this.swordBody[i].scale.x = this.tileScale / 5;
			this.swordBody[i].scale.y = this.tileScale / 5;
			this.swordBody[i].anchor.setTo(0.5, 0.5);
			this.swordBody[i].visible = false;
			this.physics.enable(this.swordBody[i], Phaser.Physics.ARCADE);
		}
		//Add a small tip to the sword for better results when swinging along the X and Y axis
		this.swordBody.push( this.add.sprite(0, 0, 'floor'));
		this.swordBody[this.swordBody.length-1].scale.x = this.tileScale / 8;
		this.swordBody[this.swordBody.length-1].scale.y = this.tileScale / 8;
		this.swordBody[this.swordBody.length-1].anchor.setTo(0.5, 0.5);
		this.swordBody[i].visible = false;
		this.physics.enable(this.swordBody[i], Phaser.Physics.ARCADE);
		
		//Create stair sprite
		this.stairs = this.add.sprite(0, 0, 'stairs');
		this.stairs.scale.x *= this.tileScale;
		this.stairs.scale.y *= this.tileScale;
		this.physics.enable(this.stairs, Phaser.Physics.ARCADE);
		
		//Setup player sprite
		this.player = this.add.sprite(0, 0, 'player');
		this.player.health = 5;
		this.player.scale.x *= this.tileScale/2;
		this.player.scale.y *= this.tileScale/2;
		this.player.anchor.setTo(0.5, 0.5);
		this.physics.enable(this.player, Phaser.Physics.ARCADE);
		this.player.body.setSize(51, 51, 0, this.tileSize/5);
		
		//Setup health bar
		this.healthbar1 = this.add.image(5, 5, 'healthbar');
		this.healthbar2 = this.add.image(40, 5, 'healthbar');
		this.healthbar3 = this.add.image(75, 5, 'healthbar');
		this.healthbar4 = this.add.image(110, 5, 'healthbar');
		this.healthbar5 = this.add.image(145, 5, 'healthbar');
		this.healthbar5.fixedToCamera = true;
		this.healthbar4.fixedToCamera = true;
		this.healthbar3.fixedToCamera = true;
		this.healthbar2.fixedToCamera = true;
		this.healthbar1.fixedToCamera = true;
		
		//Setup score text
		this.scoreText = this.add.text(1400, 0, "Score: 0", { font: "30px Arial", fill: "#ffffff", align: "right" })
		this.scoreText.fixedToCamera = true;
		
		this.newMap();

		

		
		
		//Setup camera
		this.camera.bounds = null;
		this.camera.follow(this.player);
		
		//Add animations
		this.player.animations.add('walk', [2, 3, 4, 5]);
		this.player.animations.add('idle', [0]);
		this.player.animations.add('attack', [1]);

		
		this.swingSound = this.add.sound('swing');

		
		this.key1 = this.input.keyboard.addKey(Phaser.Keyboard.ONE);
		//this.key1.onDown.add(this.newMap, this);

		this.keye = this.input.keyboard.addKey(Phaser.Keyboard.E);
		this.keye.onDown.add(this.raiseShield, this);
		this.keye.onUp.add(this.lowerShield, this);
		
		//Game over state
		this.player.events.onKilled.add(this.gameOver, this);

		//Reset score
		score = 0;
		
		this.swordLength = this.swordSpriteLength * this.tileScale;
	},
	
	update: function() {
		if(this.damageTimer >= 0)
			this.damageTimer -= this.time.physicsElapsed;
	
		//PLAYER MOVEMENT
		this.player.body.velocity.x = 0;
		this.player.body.velocity.y = 0;
		this.player.rotation = this.physics.arcade.angleToPointer(this.player);

		if(this.input.keyboard.isDown(Phaser.Keyboard.A)){
			this.player.body.velocity.x -= this.speed;
		}
		if(this.input.keyboard.isDown(Phaser.Keyboard.D)){
			this.player.body.velocity.x += this.speed;
		}
		if(this.input.keyboard.isDown(Phaser.Keyboard.S)){
			this.player.body.velocity.y += this.speed;
		}
		if(this.input.keyboard.isDown(Phaser.Keyboard.W)){
			this.player.body.velocity.y -= this.speed;
		}
		//Reduce the speed based on a unit circle (so holding forward and sideways doesn't give a speed boost
		if(this.player.body.velocity.y != 0 && this.player.body.velocity.x != 0){
			this.player.body.velocity.y *= Math.sin((45) * Math.PI / 180);
			this.player.body.velocity.x *= Math.sin((45) * Math.PI / 180);
		}
		//Walk animation
		if(this.player.body.velocity.y != 0 || this.player.body.velocity.x != 0){
			this.player.animations.play('walk', 7, false);
		}
		else{
			this.player.animations.play('idle');
		}
		//Reduce the swing timer
		if(this.swingTimer > 0){
			this.swingTimer -= this.time.physicsElapsed;
		}
		//Activate swing animation if the swing timer is 0
		if(this.input.activePointer.isDown && !this.swinging && this.swingTimer <= 0 && !this.shieldUp){
			this.swinging = true;
			this.sword.revive();
			this.currentSwing = 0;
			this.swingTimer = 0.5;
			this.swingSound.play();
		}
		//Swing the sword if in the swinging is true
		if(this.swinging){
			this.swingSword();
			this.player.animations.play('attack');
		}

		//Update shield position if up
		if ( this.shieldUp ) {
			this.raiseShield();
		}
		
		//Enemy movement and collision with player
		for(var i = 0; i < this.enemies.length; i++){
			this.enemies[i].moveTo(this.player, this.speed, this.gameMap);
			this.physics.arcade.overlap(this.enemies[i].sprite, this.player, this.takeDamage, null, this);
		}
		
		//Enemy collisions (sword and walls)
		for(var i = 0; i < this.swordBody.length; i++){
			for(iter = 0; iter < this.enemies.length; iter++){
				try {
					this.physics.arcade.overlap(this.swordBody[i], this.enemies[iter].sprite, this.doDamage, null, this);
					for(var x = 0; x < this.mapRenderer.colliders.length; x++){
						this.physics.arcade.collide(this.enemies[iter].sprite, this.mapRenderer.colliders[x], null, null, this);
					}
				}
				catch (err) {
					break; // we've killed multiple enemies in one swing and reached the end of the array so stop checks
				}
			}
		}

		//player collisions
		for (var i = 0; i < this.mapRenderer.colliders.length; i++){
			this.physics.arcade.collide(this.player, this.mapRenderer.colliders[i], null, null, this);
		}
		this.physics.arcade.overlap(this.player, this.stairs, this.newMap, null, this);
		
		//Activate sprites within the scope of the window
		this.mapRenderer.drawScreen(this.player);

		//Update score
		this.scoreText.text = "Score: " + score;
	},
	
/*	render: function(){
		this.game.debug.body(this.player);
		for(var i = 0; i < this.enemies.length; i++)
			this.game.debug.body(this.enemies[i].sprite);
		for(var i = 0; i < this.swordBody.length; i++)
			this.game.debug.body(this.swordBody[i]);
	},*/
	
	//Unfinished
	doDamage: function(hitter, receiver){
		this.enemies[iter].takeDamage(1);
		this.enemies[iter].knockback(this.player, 400);
		if (this.enemies[iter].health <= 0 ) {
			score += 10;
			this.enemies.splice(iter, 1);
		}
	},
	takeDamage: function(){
		if(this.damageTimer <= 0 && !this.shieldUp){
			this.player.damage(1);
			this.damageTimer = 0.5;
		}
		this.updateHealthBar(this.player.health);
	},
	
	//Moves the sword sprite and the sword body in a circular motion each frame
	swingSword: function(){
		if (!this.shieldUp) {
			//this.swordLength = this.swordLength * this.tileScale;
			if(this.degrees <= this.maxSwingAngle){
				this.sword.x = this.player.x;
				this.sword.y = this.player.y;
				this.degrees += (this.swingSpeed * this.time.physicsElapsed);
				this.sword.angle = this.player.angle + this.degrees;
				
				var y = Math.sin((this.sword.angle + 90) * Math.PI / 180);
				var x = Math.cos((this.sword.angle + 90) * Math.PI / 180);
				
				for(var i = 0; i < this.swordBody.length; i++){
					this.swordBody[i].revive();
					this.swordBody[i].visible = false;
					this.swordBody[i].body.x = this.sword.x - (x * this.swordLength * (this.sword.anchor.y) * i / 5);// / this.swordBody.length);
					this.swordBody[i].body.y = this.sword.y - (y * this.swordLength * (this.sword.anchor.y) * i / 5);// / this.swordBody.length);
				}
				this.currentSwing++;
			}
			else{
				for(var i = 0; i < this.swordBody.length; i++){
					this.swordBody[i].kill();
				}
				this.sword.kill();
				this.degrees = 25;
				this.swinging = false;
			}
		}
	},

	//Raises shield and updates position each frame
	raiseShield: function() {
		if (!this.swinging) {
			this.shieldUp = true;
			this.shield.x = this.player.x;
			this.shield.y = this.player.y;
			this.shield.angle = this.player.angle + 90;
			this.shield.revive();
		}
	},

	//Lowers shield and kills the associated sprite
	lowerShield: function() {
		this.shieldUp = false;
		this.shield.kill();
	},

	//Creates a new map
	newMap: function(){
		
		if(!this.player.alive)
			this.player.revive(5);
		
		//Destroys walls and sets the floor invisible
		this.mapRenderer.clear();
		//Create a new map layout
		this.gameMap = this.generator.createMap(this.width, this.height);
		//Draw the new map walls
		this.mapRenderer.drawWalls(this.gameMap);
		
		//Place the player at the spawn position
		this.player.body.x = this.generator.characterSpawnX * this.tileSize;
		this.player.body.y = this.game.height - this.generator.characterSpawnY * this.tileSize;
		
		this.placeStairs();
		
		//TEMPORARY FIX FOR INCORRECT SPAWN LOCATION
		if(this.gameMap[this.player.body.x/this.tileSize][(this.game.height - this.player.body.y)/this.tileSize] == 1 ){//|| this.gameMap[this.stairs.x/this.tileSize][(this.game.height - this.stairs.y)/this.tileSize] == 1){
			this.newMap();
		}
		
		
		
		//Clear the enemies
		for(var i = 0; i < this.enemies.length; i++){
			this.enemies[i].sprite.kill();
		}
		
		//Create new enemies
		this.enemies = this.spawner.spawnRandom(this.gameMap, 25, 'darkknight', 2, 1);
		var temp = this.spawner.spawnRandom(this.gameMap, 25, 'bloodknight', 2, 1);
		this.enemies.push.apply(this.enemies, temp);
		temp = this.spawner.spawnRandom(this.gameMap, 25, 'archer', 2, 1);
		this.enemies.push.apply(this.enemies, temp);
		
		this.healthbar1.destroy();
		this.healthbar2.destroy();
		this.healthbar3.destroy();
		this.healthbar4.destroy();
		this.healthbar5.destroy();
		
		this.healthbar1 = this.add.image(5, 5, 'healthbar');
		this.healthbar2 = this.add.image(40, 5, 'healthbar');
		this.healthbar3 = this.add.image(75, 5, 'healthbar');
		this.healthbar4 = this.add.image(110, 5, 'healthbar');
		this.healthbar5 = this.add.image(145, 5, 'healthbar');
		this.healthbar5.fixedToCamera = true;
		this.healthbar4.fixedToCamera = true;
		this.healthbar3.fixedToCamera = true;
		this.healthbar2.fixedToCamera = true;
		this.healthbar1.fixedToCamera = true;
		this.updateHealthBar(this.player.health);
		
		this.scoreText.destroy();
		this.scoreText = this.add.text(1400, 0, "Score: 0", { font: "30px Arial", fill: "#ffffff", align: "right" })
		this.scoreText.fixedToCamera = true;
		this.scoreText.text = "Score: " + score;
	},
	
	placeStairs : function(){
		var placed = false;
		while(!placed){
			var x = Math.floor(Math.random() * this.width);
			var y = Math.floor(Math.random() * this.height);
			if(this.gameMap[x][y] == 0){
				this.stairs.body.x = x * this.tileSize;
				this.stairs.body.y = this.game.height - ((y+1) * this.tileSize);
				placed = true;
			}
		}
	},
	//Advances to the game over screen
	gameOver: function() {
		this.state.start('gameover');
	},
	updateHealthBar: function(health) {
		switch (health) {
			case 1:
				this.healthbar5.visible = false;
				this.healthbar4.visible = false;
				this.healthbar3.visible = false;
				this.healthbar2.visible = false;
				this.healthbar1.visible = true;
				break;
			case 2:
				this.healthbar5.visible = false;
				this.healthbar4.visible = false;
				this.healthbar3.visible = false;
				this.healthbar2.visible = true;
				this.healthbar1.visible = true;
				break;
			case 3:
				this.healthbar5.visible = false;
				this.healthbar4.visible = false;
				this.healthbar3.visible = true;
				this.healthbar2.visible = true;
				this.healthbar1.visible = true;
				break;
			case 4:
				this.healthbar5.visible = false;
				this.healthbar4.visible = true;
				this.healthbar3.visible = true;
				this.healthbar2.visible = true;
				this.healthbar1.visible = true;
				break;
			case 5:
				this.healthbar5.visible = true;
				this.healthbar4.visible = true;
				this.healthbar3.visible = true;
				this.healthbar2.visible = true;
				this.healthbar1.visible = true;
				break;
			default:
				this.healthbar5.visible = false;
				this.healthbar4.visible = false;
				this.healthbar3.visible = false;
				this.healthbar2.visible = false;
				this.healthbar1.visible = false;
		}
	}
}
States.LoseState = function(game){
	this.button;
}
States.LoseState.prototype = {
	preload: function() {
		this.load.image('background', 'assets/losescreen.jpg');
		this.load.spritesheet('button', 'assets/continuebutton.png', 193, 71, 3);
	},

	create: function() {
		this.add.sprite(0, 0, 'background');
		this.button = this.add.button(703.5, 875, 'button', this.startGame, this, 1, 1, 0);
		this.add.text(550, 250, "Final Score: " + score, { font: "80px Arial", fill: "#ffffff", align: "left" })
	},

	startGame: function() {
		this.state.start('dungeon');
	}
}