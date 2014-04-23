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
	this.enemies;
	this.spawner;
	this.swingSound;
	this.mapRenderer;
		
	this.damageTimer = 0;
		
	this.key1;
	
	this.degrees = 1;
	this.maxSwingAngle = 135;
	this.swingSpeed = 500;
	this.currentSwing;
	this.swordLength = 40;
};

States.DungeonState.prototype = {
	preload : function() {
		this.load.image('corner', 'assets/corner.png');
		this.load.image('wall', 'assets/wall.png');
		this.load.image('floor', 'assets/floor.png');
		this.load.image('invisible', 'assets/invisibleWall.png');
		this.load.image('sword', 'assets/sword.png');
		this.load.spritesheet('healthbar', 'assets/health_bar.png', 35, 32, 6);
		this.load.spritesheet('player', 'assets/playercharacter.png', 51, 70, 6);
		this.load.spritesheet('darkknight', 'assets/darkknight.png', 50, 70, 6);
		
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
		
		//Setup player sprite
		this.player = this.add.sprite(0, 0, 'player');
		this.player.health = 5;
		this.player.scale.x *= this.tileScale/2;
		this.player.scale.y *= this.tileScale/2;
		this.player.anchor.setTo(0.5, 0.5);
		this.physics.enable(this.player, Phaser.Physics.ARCADE);
		
		this.newMap();

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
		
		//Game over state
		this.player.events.onKilled.add(this.gameOver, this);

		//Reset score
		score = 0;
		
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
		if(this.input.activePointer.isDown && !this.swinging && this.swingTimer <= 0){
			this.swinging = true;
			this.sword.revive();
			this.currentSwing = 0;
			this.swingTimer = 1;
			this.swingSound.play();
		}
		//Swing the sword if in the swinging is true
		if(this.swinging){
			this.swingSword();
			this.player.animations.play('attack');
		}
		
		//Enemy movement and collision with player
		for(var i = 0; i < this.enemies.length; i++){
			this.enemies[i].moveTo(this.player, this.speed, this.gameMap);
			this.physics.arcade.collide(this.enemies[i].sprite, this.player, this.takeDamage, null, this);
		}
		
		//Enemy collisions (sword and walls)
		for(var i = 0; i < this.swordBody.length; i++){
			for(iter = 0; iter < this.enemies.length; iter++){
				this.physics.arcade.overlap(this.swordBody[i], this.enemies[iter].sprite, this.doDamage, null, this);
				for(var x = 0; x < this.mapRenderer.colliders.length; x++){
					this.physics.arcade.collide(this.enemies[iter].sprite, this.mapRenderer.colliders[x], null, null, this);
				}
			}
		}

		//player collisions
		for (var i = 0; i < this.mapRenderer.colliders.length; i++){
			this.physics.arcade.collide(this.player, this.mapRenderer.colliders[i], null, null, this);
		}
		
		//Activate sprites within the scope of the window
		this.mapRenderer.drawScreen(this.player);
	},
	
	//Unfinished
	doDamage: function(hitter, receiver){
		this.enemies[iter].takeDamage(1);
		if (this.enemies[iter].health <= 0 ) {
			score += 10;
			this.enemies.splice(iter, 1);
		}
	},
	takeDamage: function(){
		if(this.damageTimer <= 0){
			this.player.damage(1);
			this.damageTimer = 0.5;
		}
		this.updateHealthBar(this.player.health);
	},
	
	//Moves the sword sprite and the sword body in a circular motion each frame
	swingSword: function(){
		this.swordLength = this.tileScale / this.swordLength;
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
				this.swordBody[i].body.x = this.sword.x - (x * this.swordLength * (1 + this.sword.anchor.y) * i / this.swordBody.length);
				this.swordBody[i].body.y = this.sword.y - (y * this.swordLength * (1 + this.sword.anchor.y) * i / this.swordBody.length);
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
	},


	//Creats a new map
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
		
		
		//TEMPORARY FIX FOR INCORRECT SPAWN LOCATION
		if(this.gameMap[this.player.body.x/this.tileSize][(this.game.height - this.player.body.y)/this.tileSize] == 1){
			this.newMap();
		}
		
		//Clear the enemies
		for(var i = 0; i < this.enemies.length; i++){
			this.enemies[i].sprite.kill();
		}
		
		//Create new enemies
		this.enemies = this.spawner.spawnRandom(this.gameMap, 75, 'darkknight', 1, 1);
	},

	//Advances to the game over screen
	gameOver: function() {
		this.state.start('gameover');
	},
	updateHealthBar: function(health) {
		switch (health) {
			case 1:
				this.healthbar2.visible = false;
			case 2:
				this.healthbar3.visible = false;
			case 3:
				this.healthbar4.visible = false;
			case 4:
				this.healthbar5.visible = false;
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
		this.button = this.add.button(703.5, 464.5, 'button', this.startGame, this, 1, 1, 0);
		this.add.text(0, 960, "Final Score: " + score, { font: "40px Arial", fill: "#ffffff", align: "left" })
	},

	startGame: function() {
		this.state.start('dungeon');
	}
}