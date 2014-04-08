//Nathan Murray

window.onload = function() {
    
    "use strict";
    
    
    
    var game = new Phaser.Game( 1600, 1000, Phaser.AUTO, 'game', { preload: preload, create: create, update: update } );
    
    function preload() {
        game.load.image('corner', 'assets/corner.png');
        game.load.image('wall', 'assets/wall.png');
        game.load.image('floor', 'assets/floor.png');
        game.load.image('invisible', 'assets/invisibleWall.png');
        game.load.image('sword', 'assets/sword.png');
        game.load.spritesheet('player', 'assets/character.png', 51, 70, 6);
        
        game.load.audio('swing', 'assets/Swoosh.mp3');
    }
    
    var logo;
    var generator;
    var gameMap;
    var tiles;
    var width = 75; //how many tiles make up the width
    var height = 75; //how many tiles make up the height
    var tileSize = 100; //The size of each tile in the game world (in pixels)
    var spriteSize = 70; //The size of the images you are using for tiles
    var tileScale;
    var wallSprites;
    var floor;
    var player;
    var playerMapPositionX;
    var playerMapPositionY;
    var colliders;
    var renderDistance;
    var speed;
    var sword;
    var swordBody;
    var swinging = false;
    var swingTimer = 0;
    var enemies;
    var spawner;
    var swingSound;
    var mapRenderer;
    
    var key1;
    
    function create() {
  		game.stage.backgroundColor = 0x000000;
    	enemies = new Array();
    	
    	//Sets the speed to be scaled based on the map world instead of the camera view
    	if(game.width > game.height){
    		speed = game.width;
    	}
    	else{
    		speed = game.height;
    	}
    	speed = (speed * tileSize) / 500;
    	
    	game.physics.startSystem(Phaser.Physics.ARCADE);
    	tileScale = tileSize/spriteSize;
        
        //MonsterSpawner
        spawner = new MonsterSpawner(game, tileSize, tileScale);

        //New generator (max room size, minimum room size)
        generator = new Map(10, 5);
       	mapRenderer = new MapRenderer(game, tileSize, tileScale, width, height);
       	
       	
        //Setup sword sprite
        sword = game.add.sprite(0, 0, 'sword');
        sword.scale.x *= tileScale;
        sword.scale.y *= tileScale;
        sword.anchor.setTo(0, 1.3);
        sword.kill();
        
        //Create the swords body
        swordBody = new Array();
        for(var i = 0; i < 5; i++){
        	swordBody.push( game.add.sprite(0, 0, 'block'));
        	swordBody[i].scale.x = tileScale / 5;
        	swordBody[i].scale.y = tileScale / 5;
        	swordBody[i].visible = false;
        	game.physics.enable(swordBody[i], Phaser.Physics.ARCADE);
        }
        
        //Setup player sprite
        player = game.add.sprite(0, 0, 'player');
        player.health = 5;
        player.scale.x *= tileScale/2;
        player.scale.y *= tileScale/2;
        player.anchor.setTo(0.5, 0.5);
        game.physics.enable(player, Phaser.Physics.ARCADE);
        
        newMap();
        
		//Setup camera
        game.camera.bounds = null;
        game.camera.follow(player);
        
        //Add animations
        player.animations.add('walk', [2, 3, 4, 5]);
        player.animations.add('idle', [0]);
        player.animations.add('attack', [1]);

        
        swingSound = game.add.sound('swing');

        
        key1 = game.input.keyboard.addKey(Phaser.Keyboard.ONE);
        key1.onDown.add(newMap, this);
        
        
    }
    
    var damageTimer = 0;
    function update() {
    	if(damageTimer >= 0)
    		damageTimer -= game.time.physicsElapsed;
    
    	//PLAYER MOVEMENT
    	player.body.velocity.x = 0;
    	player.body.velocity.y = 0;
    	player.rotation = game.physics.arcade.angleToPointer(player);

    	if(game.input.keyboard.isDown(Phaser.Keyboard.A)){
    		player.body.velocity.x -= speed;
    	}
    	if(game.input.keyboard.isDown(Phaser.Keyboard.D)){
    		player.body.velocity.x += speed;
    	}
   		if(game.input.keyboard.isDown(Phaser.Keyboard.S)){
    		player.body.velocity.y += speed;
    	}
    	if(game.input.keyboard.isDown(Phaser.Keyboard.W)){
    		player.body.velocity.y -= speed;
    	}
    	//Reduce the speed based on a unit circle (so holding forward and sideways doesn't give a speed boost
    	if(player.body.velocity.y != 0 && player.body.velocity.x != 0){
    		player.body.velocity.y *= Math.sin((45) * Math.PI / 180);
    		player.body.velocity.x *= Math.sin((45) * Math.PI / 180);
    	}
    	//Walk animation
    	if(player.body.velocity.y != 0 || player.body.velocity.x != 0){
    		player.animations.play('walk', 7, false);
    	}
    	else{
    		player.animations.play('idle');
    	}
    	//Reduce the swing timer
    	if(swingTimer > 0){
    		swingTimer -= game.time.physicsElapsed;
    	}
    	//Activate swing animation if the swing timer is 0
    	if(game.input.activePointer.isDown && !swinging && swingTimer <= 0){
    		swinging = true;
    		sword.revive();
    		currentSwing = 0;
    		swingTimer = 1;
    		swingSound.play();
    	}
    	//Swing the sword if in the swinging is true
    	if(swinging){
    		swingSword();
    		player.animations.play('attack');
    	}
    	
    	//player collisions
    	for (var i = 0; i < mapRenderer.colliders.length; i++){
    		game.physics.arcade.collide(player, mapRenderer.colliders[i], null, null, this);
    	}
		//Enemy movement and collision with player
    	for(var i = 0; i < enemies.length; i++){
    		enemies[i].moveTo(player, speed, gameMap);
    		game.physics.arcade.collide(enemies[i].sprite, player, takeDamage, null, this);
    	}
    	
    	//Enemy collisions (sword and walls)
    	for(var i = 0; i < swordBody.length; i++){
    		for(var j = 0; j < enemies.length; j++){
    			game.physics.arcade.collide(swordBody[i], enemies[j].sprite, doDamage, null, this);
    			for(var x = 0; x < mapRenderer.colliders.length; x++){
    				game.physics.arcade.collide(enemies[j].sprite, mapRenderer.colliders[x], null, null, this);
    			}
    		}
    	}
    	
    	//Activate sprites within the scope of the window
    	mapRenderer.drawScreen(player);
    }
    
    //Unfinished
    function doDamage(hitter, reciever){
    	reciever.damage(1);
		/*reciever.health -= 1;
		if(reciever.health <= 0)
			reciever.kill();*/
    }
    function takeDamage(){
    	if(damageTimer <= 0){
    		player.damage(1);
    		damageTimer = 0.5;
    	}
    }
    
    //Moves the sword sprite and the sword body in a circular motion each frame
    var degrees = 1;
    var maxSwingAngle = 135;
    var swingSpeed = 500;
    var currentSwing;
    var swordLength = 40;
    function swingSword(){
    	swordLength = tileScale / swordLength;
    	if(degrees <= maxSwingAngle){
    		sword.x = player.x;
    		sword.y = player.y;
    		degrees += (swingSpeed * game.time.physicsElapsed);
    		sword.angle = player.angle + degrees;
    		
    		var y =	Math.sin((sword.angle + 90) * Math.PI / 180);
    		var x = Math.cos((sword.angle + 90) * Math.PI / 180);
    		
    		for(var i = 0; i < swordBody.length; i++){
    			swordBody[i].revive();
    			swordBody[i].visible = false;
    			swordBody[i].body.x = sword.x - (x * swordLength * (1 + sword.anchor.y) * i / swordBody.length);
    			swordBody[i].body.y = sword.y - (y * swordLength * (1 + sword.anchor.y) * i / swordBody.length);
    		}
    		currentSwing++;
    	}
    	else{
    		for(var i = 0; i < swordBody.length; i++){
    			swordBody[i].kill();
    		}
    		sword.kill();
    		degrees = 25;
    		swinging = false;
    	}
    }


	//Creats a new map
    function newMap(){
    	
    	if(!player.alive)
    		player.revive(5);
    	
    	//Destroys walls and sets the floor invisible
    	mapRenderer.clear();
		//Create a new map layout
  		gameMap = generator.createMap(width, height);
    	//Draw the new map walls
    	mapRenderer.drawWalls(gameMap);
    	
    	//Place the player at the spawn position
    	player.body.x = generator.characterSpawnX * tileSize;
    	player.body.y = game.height - generator.characterSpawnY * tileSize;
    	
    	
    	//TEMPORARY FIX FOR INCORRECT SPAWN LOCATION
    	if(gameMap[player.body.x/tileSize][(game.height - player.body.y)/tileSize] == 1){
    		newMap();
    	}
    	
    	//Clear the enemies
    	for(var i = 0; i < enemies.length; i++){
    		enemies[i].sprite.kill();
    	}
    	
    	//Create new enemies
    	enemies = spawner.spawnRandom(gameMap, 75, 'player', 5, 1);
    }
};