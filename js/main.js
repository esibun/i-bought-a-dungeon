//Nathan Murray

window.onload = function() {
    
    "use strict";
    
    
    
    var game = new Phaser.Game( 1600, 1000, Phaser.AUTO, 'game', { preload: preload, create: create, update: update } );
    
    function preload() {
        game.load.image('block', 'assets/dirt.png');
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
    
    var key1;
    
    function create() {
    	enemies = new Array();
    	if(game.width > game.height){
    		renderDistance = game.width;
    		speed = game.width;
    	}
    	else{
    		renderDistance = game.height;
    		speed = game.height;
    	}
    	
    	speed = (speed * tileSize) / 500;
    	renderDistance = 2 + Math.ceil((renderDistance / 2) / tileSize);
    	//renderDistance = 4;
    	
    	game.physics.startSystem(Phaser.Physics.ARCADE);
    	wallSprites = new Array();
    	colliders = new Array();
    	tileScale = tileSize/spriteSize;
        
        //MonsterSpawner
        spawner = new MonsterSpawner(game, tileSize, tileScale);
        
        game.stage.backgroundColor = 0xffffAf;
        
        //New generator (max room size, minimum room size)
        generator = new MapGenerator(10, 5);
       	
       	floor = new Array();
		for(var x = width-1; x >= 0; x--){
			floor[x] = new Array();
			for(var y = height -1; y >= 0; y--){
				floor[x][y] = game.add.sprite( x * tileSize, game.height - tileSize - y * tileSize, 'floor');
				floor[x][y].scale.x = tileScale;
				floor[x][y].scale.y = tileScale;
				floor[x][y].body = null;
				floor[x][y].kill();
			}
	 	}
       	
       	tiles = new Array();
		for(var x = width-1; x >= 0; x--){
			tiles[x] = new Array();
			for(var y = height -1; y >= 0; y--){
				tiles[x][y] = game.add.sprite( x * tileSize, game.height - tileSize - y * tileSize, 'block');
				tiles[x][y].scale.x = tileScale;
				tiles[x][y].scale.y = tileScale;
				game.physics.enable(tiles[x][y], Phaser.Physics.ARCADE);
				tiles[x][y].body.immovable = true;
				//tiles[x][y].moves = false;
				tiles[x][y].kill();
			}
	 	}
        
        sword = game.add.sprite(0, 0, 'sword');
        sword.scale.x *= tileScale;
        sword.scale.y *= tileScale;
        sword.anchor.setTo(0, 1.3);
        sword.kill();
        
        swordBody = new Array();
        for(var i = 0; i < 5; i++){
        	swordBody.push( game.add.sprite(0, 0, 'block'));
        	swordBody[i].scale.x = tileScale / 5;
        	swordBody[i].scale.y = tileScale / 5;
        	swordBody[i].visible = false;
        	game.physics.enable(swordBody[i], Phaser.Physics.ARCADE);
        }
        
        player = game.add.sprite(0, 0, 'player');
        player.health = 5;
        player.scale.x *= tileScale/2;
        player.scale.y *= tileScale/2;
        player.anchor.setTo(0.5, 0.5);
        game.physics.enable(player, Phaser.Physics.ARCADE);
        
        newMap();
        

        game.camera.bounds = null;
        game.camera.follow(player);
        
        player.animations.add('walk', [2, 3, 4, 5]);
        player.animations.add('idle', [0]);
        player.animations.add('attack', [1]);
        
        //TESTING AREA
        
        //enemies = game.add.sprite((generator.characterSpawnX + 1) * tileSize, game.height - (1+ generator.characterSpawnY) * tileSize, 'player');
        //spawnRandom = function (map, amount, type, health, damage);
        //game.physics.enable(enemies, Phaser.Physics.ARCADE);
        //enemies.health = 3;
        
        swingSound = game.add.sound('swing');
        
        //END TESTING AREA
        
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
    	if(player.body.velocity.y != 0 && player.body.velocity.x != 0){
    		player.body.velocity.y *= Math.sin((45) * Math.PI / 180);
    		player.body.velocity.x *= Math.sin((45) * Math.PI / 180);
    	}
    	if(player.body.velocity.y != 0 || player.body.velocity.x != 0){
    		player.animations.play('walk', 7, false);
    	}
    	else{
    		player.animations.play('idle');
    	}
    	
    	if(swingTimer > 0){
    		swingTimer -= game.time.physicsElapsed;
    	}
    	if(game.input.activePointer.isDown && !swinging && swingTimer <= 0){
    		swinging = true;
    		sword.revive();
    		currentSwing = 0;
    		swingTimer = 1;
    		swingSound.play();
    	}
    	
    	for (var i = 0; i < colliders.length; i++){
    		game.physics.arcade.collide(player, colliders[i], null, null, this);
    	}
    	
    	if(swinging){
    		swingSword();
    		player.animations.play('attack');
    	}
    	
    	for(var i = 0; i < enemies.length; i++){
    		enemies[i].moveTo(player, speed, gameMap);
    		game.physics.arcade.collide(enemies[i].sprite, player, takeDamage, null, this);
    	}
    	
    	for(var i = 0; i < swordBody.length; i++){
    		for(var j = 0; j < enemies.length; j++){
    			game.physics.arcade.collide(swordBody[i], enemies[j].sprite, doDamage, null, this);
    			for(var x = 0; x < colliders.length; x++){
    				game.physics.arcade.collide(enemies[j].sprite, colliders[x], null, null, this);
    			}
    		}
    	}
    	
    	calculatePlayerMapPosition();
    	drawScreen();
    }
    
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
    
    function calculatePlayerMapPosition(){
    	playerMapPositionX = player.x % tileSize;
    	playerMapPositionY = (game.height - player.y) % tileSize;
    	playerMapPositionX = (player.x - playerMapPositionX) / tileSize;
    	playerMapPositionY = (game.height - player.y - playerMapPositionY) / tileSize;
    }
    
    function drawScreen(){
    	for(var i = playerMapPositionX - renderDistance; i < playerMapPositionX + renderDistance; i++){	
    		for(var j = playerMapPositionY - renderDistance; j < playerMapPositionY + renderDistance; j++){
    			if(i > 0 && i < width && j > 0 && j < height){
    				if(gameMap[i][j] == 1)
    					tiles[i][j].revive();
    				if(i < width && i > 0 && j < height && j > 0)
    					floor[i][j].revive();
    			}
    			
    		}
    	}
    	
    	for(var i = playerMapPositionX - renderDistance - 1; i < playerMapPositionX + renderDistance + 1; i++){
    		if( i > 0 && i < width && playerMapPositionY + renderDistance + 1 < height && playerMapPositionY + renderDistance + 1 > 0){
    			floor[i][playerMapPositionY+renderDistance + 1].kill();
    			tiles[i][playerMapPositionY+renderDistance + 1].kill();
    		}
    		if(i > 0 && i < width && playerMapPositionY-(renderDistance + 1) > 0 && playerMapPositionY- (renderDistance + 1) < height){
    			floor[i][playerMapPositionY-(renderDistance + 1)].kill();
    			tiles[i][playerMapPositionY-(renderDistance + 1)].kill();
    		}
    	}
    	for(var i = playerMapPositionY - renderDistance - 1; i < playerMapPositionY +renderDistance + 1; i++){
    		if(i > 0 && i < height && playerMapPositionX + renderDistance + 1 < width && playerMapPositionX + renderDistance + 1 > 0){
    			floor[playerMapPositionX+renderDistance + 1][i].kill();
    			tiles[playerMapPositionX+renderDistance + 1][i].kill();
    		}
    		if(i > 0 && i < height && playerMapPositionX - (renderDistance + 1) > 0 && playerMapPositionX - (renderDistance + 1) < width){
    			floor[playerMapPositionX-(renderDistance + 1)][i].kill();
    			tiles[playerMapPositionX-(renderDistance + 1)][i].kill();
    		}
    	}
    	
    	for(var i = 0; i < colliders.length; i++){
    		if((colliders[i].x / tileSize) >= (playerMapPositionX - renderDistance * 3) && (colliders[i].x / tileSize) <= playerMapPositionX + renderDistance * 3){
    			if(((game.height - colliders[i].y) / tileSize) >= (playerMapPositionY - renderDistance) && ((game.height - colliders[i].y) / tileSize) <= playerMapPositionY + renderDistance){
    				if(!colliders[i].alive){
    					colliders[i].revive();
    					colliders[i].visible = false;
    				}
    			}
    		}
    		else if(colliders[i].alive){
    			colliders[i].kill();
    		}
    				 
    	}
    	
    	for(var i = 0; i < wallSprites.length; i++){
    		if((wallSprites[i].x / tileSize) >= (playerMapPositionX - renderDistance) && (wallSprites[i].x / tileSize) <= playerMapPositionX + renderDistance){
    			if(((game.height - wallSprites[i].y) / tileSize) >= (playerMapPositionY - renderDistance) && ((game.height - wallSprites[i].y) / tileSize) <= playerMapPositionY + renderDistance){
    				if(!wallSprites[i].alive){
    					wallSprites[i].revive();
    				}
    			}
    		}
    		else if(wallSprites[i].alive){
    			wallSprites[i].kill();
    		}
    				 
    	}
    }
    
    function newMap(){
    	
    	if(!player.alive)
    		player.revive(5);
    		
    	for(var i = 0; i < wallSprites.length; i++){
    		wallSprites[i].destroy();
    	}

  		gameMap = generator.createMap(width, height);
  		
   /* 	for(var x = 0; x < width; x++){
        	for(var y = 0; y < height; y++){
    			if(gameMap[x][y] == 1){
    				tiles[x][y].revive();
    			}
    			else{
    				tiles[x][y].kill();
    			}
    		}
    	}*/
    	
    	var wallMap = drawWalls();
    	
    	for(var i = 0; i < colliders.length; i++){
    		colliders[i].body = null;
    		colliders[i].destroy();
    	}
    	
    	createColliders(wallMap);
    	
    	player.body.x = generator.characterSpawnX * tileSize;
    	player.body.y = game.height - generator.characterSpawnY * tileSize;
    	
    	
    	//TEMPORARY FIX FOR INCORRECT SPAWN LOCATION
    	if(gameMap[player.body.x/tileSize][(game.height - player.body.y)/tileSize] == 1){
    		newMap();
    	}
    	
    	//CLEAR THE ENEMIES
    	for(var i = 0; i < enemies.length; i++){
    		enemies[i].sprite.kill();
    	}
    	
    	enemies = spawner.spawnRandom(gameMap, 75, 'player', 5, 1);
    	
    	for(var i = 0; i < width; i++){	
    		for(var j = 0; j < height; j++){
    			if(tiles[i][j].alive)
    				tiles[i][j].kill();
    			if(floor[i][j].alive)
    				floor[i][j].kill();
    		}
    	}
    }
    
    function drawWalls(){
    	wallSprites = new Array();
    	var wallMap = new Array();
    	var i = 0;
    	for(var x = 0; x < width; x++){
    		wallMap[x] = new Array();
        	for(var y = 0; y < height; y++){
        		wallMap[x][y] = 0;
        		if(gameMap[x][y] == 1){
        			//create top wall
        			if(y > 0 && gameMap[x][y-1] == 0){
        				addSpriteToList(wallSprites, i, x, y, 'wall');
        				wallSprites[i].angle = -90;
        				wallSprites[i].y += tileSize;
        				i++;
        				wallMap[x][y] = 1;
        			}
        			//create bottom wall
        			if(y < height-1 && gameMap[x][y+1] == 0){
        				addSpriteToList(wallSprites, i, x, y, 'wall');
        				wallSprites[i].angle = 90;
        				wallSprites[i].x += tileSize;
        				i++;
        				wallMap[x][y] = 1;
        			}
        			//create right wall
        			if(x > 0 && gameMap[x-1][y] == 0){
        				addSpriteToList(wallSprites, i, x, y, 'wall');
        				i++;
        				wallMap[x][y] = 1;
        			}
        			//create left wall
        			if(x < width-1 && gameMap[x+1][y] == 0){
        				addSpriteToList(wallSprites, i, x, y, 'wall');
        				wallSprites[i].angle = 180;
        				wallSprites[i].x += tileSize;
        				wallSprites[i].y += tileSize;
        				i++;
        				wallMap[x][y] = 1;
        			}
        			
        			//create top left corner
        			if(checkBounds(x, y) && gameMap[x-1][y+1] == 0 && gameMap[x-1][y] == 0 && gameMap[x][y+1] == 0 || y < height-1 && x > 0 && gameMap[x-1][y+1] == 0 && gameMap[x-1][y] == 1 && gameMap[x][y+1] == 1){
        				addSpriteToList(wallSprites, i, x, y, 'corner');
        				i++;
        				wallMap[x][y] = 1;
        			}
        			//create top right corner
        			if(checkBounds(x, y) && gameMap[x+1][y+1] == 0 && gameMap[x][y+1] == 0 && gameMap[x+1][y] == 0 || y < height-1 && x < width-1 && gameMap[x+1][y+1] == 0 && gameMap[x][y+1] == 1 && gameMap[x+1][y] == 1){
        				addSpriteToList(wallSprites, i, x, y, 'corner');
        				wallSprites[i].angle = 90;
        				wallSprites[i].x += tileSize;
        				i++;
        				wallMap[x][y] = 1;
        			}
        			//create bottom right corner
        			if(checkBounds(x, y) && gameMap[x+1][y-1] == 0 && gameMap[x][y-1] == 0 && gameMap[x+1][y] == 0 || x < width-1 && y > 0 && gameMap[x+1][y-1] == 0 && gameMap[x][y-1] == 1 && gameMap[x+1][y] == 1){
        				addSpriteToList(wallSprites, i, x, y, 'corner');
        				wallSprites[i].angle = 180;
        				wallSprites[i].x += tileSize;
        				wallSprites[i].y += tileSize;
        				i++;
        				wallMap[x][y] = 1;
        			}
        			//create bottom left corner
        			if(checkBounds(x, y) && gameMap[x-1][y-1] == 0 && gameMap[x-1][y] == 0 && gameMap[x][y-1] == 0 || x > 0 && y > 0 && gameMap[x-1][y-1] == 0 && gameMap[x-1][y] == 1 && gameMap[x][y-1] == 1){
        				addSpriteToList(wallSprites, i, x, y, 'corner');
        				wallSprites[i].angle = -90;
        				wallSprites[i].y += tileSize;
        				i++;
        				wallMap[x][y] = 1;
        			}
    			}
    		}
    	}
    	
    	return wallMap;
    }
    
    function createColliders(wallMap){
    	colliders = new Array();
    	var i = 0;
    	for(var x = 0; x < width; x++){
    		for(var y = 0; y < height; y++){
    			var upY = y+1;
    			if(wallMap[x][y] == 1){
					var count = 0;
					var tempX = x;
					while(wallMap[tempX][y] == 1){
						wallMap[tempX][y] = 0;
						i = checkUp(wallMap, i, tempX, y);
						count++;
						tempX++;
					}
					addSpriteToList(colliders, i, x, y, 'invisible');
					colliders[i].scale.x *= count;
					game.physics.enable(colliders[i], Phaser.Physics.ARCADE);
					colliders[i].body.immovable = true;
					colliders[i].visible = false;
    				i++;
    			}
    		}
    	}
    }
    
    function checkUp(wallMap, pos, x, y){
    	y++;
    	if(wallMap[x][y] == 1){
    		addSpriteToList(colliders, pos, x, y, 'invisible');
						
			var count = 0;
			while(wallMap[x][y] == 1){
				wallMap[x][y] = 0;
				count++;
				y++;
			}
			colliders[pos].scale.y *= count;
			colliders[pos].y -= (tileSize * (count-1));
			game.physics.enable(colliders[pos], Phaser.Physics.ARCADE);
			colliders[pos].body.immovable = true;
			colliders[pos].visible = false;
			pos++;
    	}
    	return pos;
    }
    
    function checkBounds(x, y){
    	return x > 0 && x < width -1 && y > 0 && y < height -1;
    }
    function addSpriteToList(target, pos, x, y, type){
    	if(pos >= target.length)
    		target.push( game.add.sprite(x * tileSize, game.height - tileSize - y * tileSize, type));
    	else
    		target[pos] = game.add.sprite(x * tileSize, game.height - tileSize - y * tileSize, type);
    	target[pos].scale.x = tileScale;
    	target[pos].scale.y = tileScale;
    }
		
};

MapGenerator = function (maxRoomSize, minRoomSize){
	this.maxRoomSize = maxRoomSize;
	this.minRoomSize = minRoomSize;
	
	this.width;
	this.height;
	
	this.characterSpawnX;
	this.characterSpawnY;
	
	this.roomCount = 0;
};

MapGenerator.prototype.createMap = function(width, height){
	this.width = width;
	this.height = height;
	
	var map = new Array();
	for(var x = 0; x < width; x++){
		map[x] = new Array();
		for(var y = 0; y < height; y++){
			map[x][y] = 1;
		}
	 }
	 
	 //Find a starting point, and avoid the sides.
	 var spawnX = Math.random() * (width - 18);
	 spawnX = parseInt(spawnX)+9;
	 var spawnY = Math.random() * (height - 8);
	 spawnY = parseInt(spawnY)+1;
	 
	map = this.createRoom(map, spawnX, spawnY, 0);
	 
	 return map;
}
/*Types are:
	0 = spawn room
	1 = horizontal
	2 = vertical
*/

//direct 1 is left and right, 2 is up and down
MapGenerator.prototype.createRoom = function(map, startX, startY, type, direction){
	if(type == 0){
		map = this.createStartingRoom(map, startX, startY);
	}
	else if(type == 1){
		this.createHorizontalRoom(map, startX, startY, direction);
	}
	
	return map;
	
}

//Starting room is a special, 1 time only case.	
MapGenerator.prototype.createStartingRoom = function(map, startX, startY){
	var width = 5;
	var height = 3;
		
	var maxLeftExits = 1;
	var maxRightExits = 1;
	
	var exits = Math.random();
	if(exits < 0.5)
		exits = 1;
	else
		exits = 2;
		
	var targetY = startY + height;
	var targetX = startX + width;
	
	
	//Hollow the room out
	for(var y = startY; y < targetY; y++){
		for(var x = startX; x < targetX; x++){
			if(x > 0 && x < this.width && y > 0 && y < this.height)
				map[x][y] = 0;
		}
	}
	this.roomCount = 1;
		
	var leftExits = 0;
	var rightExits = 0;

	//Create an exit
		for(var i = 0; i < exits; i++){
			//while(rightExits < maxRightExits && leftExits < maxLeftExits){
				var x = Math.floor(Math.random() * width);
				var y = Math.floor(Math.random() * (height - 1));
				
				if(x == width)
					x--;
				if(y == height)
					y--;
				
				x += startX;
				y += startY;
				
				var dir = Math.random();
				if(dir < 0.5 && rightExits < maxRightExits){
					dir = 1;
					while(map[x][y] != 1){
						x++;
					}
					this.createDoor(x, y, 1, 2, map);
					rightExits++;
				}
				
				else if(dir >= 0.5 && leftExits < maxLeftExits){
					dir = 2;
					while(map[x][y] != 1){
						x--;
					}
					this.createDoor(x, y, 1, 2, map);
					leftExits++;
				}
			}		
		//}
		if(this.roomCount == 1)
			map = this.createMap(this.width, this.height);
			
	this.characterSpawnX = startX + 2;
	this.characterSpawnY = startY + 1;
	
	return map;
}

MapGenerator.prototype.createHorizontalRoom = function(map, startX, startY, direction){

	var width = Math.ceil(Math.random() * (this.maxRoomSize - this.minRoomSize)  + this.minRoomSize);
	var height = Math.ceil(Math.random() * (this.maxRoomSize - this.minRoomSize) + this.minRoomSize);

	if(direction == 1){
		var right = false;
		if(map[startX+1][startY] == 1 && map[startX-1][startY] == 0)
			right = true;
		
		if(right){
			var length = 0;
			var bottomX = startX + 1;
			var bottomY = startY;
			var down = Math.floor(Math.random() * (height - 1));
			var temp = down;
			
			if(map[bottomX][bottomY - 1] == 1)
				while(bottomY > 1 && map[bottomX][bottomY -2] == 1 && temp > 0){
					bottomY--;
					temp--;
				}
				
			//Check in bounds
			if(bottomX + width < this.width - 1 && bottomY + height < this.height - 1)
				this.hollow(bottomX, bottomY, bottomX + width, bottomY + height, map); 
		}
		else{
			var length = 0;
			var bottomX = startX;
			var bottomY = startY;
			var down = Math.floor(Math.random() * (height - 1));
			var temp = down;
			
			if(bottomY-1 >= 0)
			if(map[bottomX][bottomY - 1] == 1)
				while(bottomY > 1 && map[bottomX][bottomY -2] == 1 && temp > 0){
					bottomY--;
					temp--;
				}
			temp = width;
			if(bottomX-1 >= 0)
			if(map[bottomX-1][bottomY] == 1)
				while(bottomX > 1 && map[bottomX - 2][bottomY] == 1 && temp > 0){
					bottomX--;
					temp--;
				}
			
			//Check in bounds
			if(bottomX + width < this.width - 1 && bottomY + height < this.height - 1)
				this.hollow(bottomX, bottomY, bottomX + width, bottomY + height, map);
		}
	}
	if(direction == 2){
		var top = false;
		if(map[startX][startY + 1] == 1 && map[startX][startY - 1] == 0)
			top = true;
		
		if(top){
			var bottomX = startX;
			var bottomY = startY + 1;
			var sideways = Math.floor(Math.random() * (width - 1));
			
			if(map[bottomX -1][bottomY] == 1){
				while(bottomX > 1 && map[bottomX -2][bottomY] == 1 && sideways > 0){
					bottomX--;
					sideways--;
				}
			}
			
			if(bottomX+ width < this.width - 1 && bottomY + height < this.height -1)
				this.hollow(bottomX, bottomY, bottomX + width, bottomY + height, map);
		}
		else{
			var bottomX = startX;
			var bottomY = startY;
			var sideways = Math.floor(Math.random() * (width - 1));
			
			if(map[bottomX -1][bottomY] == 1){
				while(bottomX > 1 && map[bottomX -2][bottomY] == 1 && sideways > 0){
					bottomX--;
					sideways--;
				}
			}
			var down = height;
			if(map[bottomX][bottomY - 1] == 1){
				while(bottomX > 1 && map[bottomX][bottomY -2] == 1 && down > 0){
					bottomY--;
					down--;
				}
			}
			
			if(bottomX+ width < this.width - 1 && bottomY + height < this.height -1)
				this.hollow(bottomX, bottomY, bottomX + width, bottomY + height, map);
		}
	}
}

//Input the bottom left and top right corner of the rectangle.
MapGenerator.prototype.hollow = function(x1, y1, x2, y2, map){
	var viable = true;
	for(var x = x1 - 1; x < x2 + 1; x++){
		if(x < this.width - 1){
			for(var y = y1 - 1; y < y2 + 1; y++){
				if(y < this.height -1){
					if(map[x][y] == 0){
						viable = false;
						}
				}
				else{
					viable = false;
				}
			}
		}
		else{
			viable = false;
		}
	}
	if(viable){
		for(var x = x1; x < x2; x++){
			for(var y = y1; y < y2; y++){
				map[x][y] = 0
			}
		}
		this.createDoors(x1, y1, (x2 - x1), (y2 - y1), map);
		this.roomCount++;
	}
}

MapGenerator.prototype.createDoors = function(startX, startY, width, height, map){
	var exits = 1 + Math.ceil(Math.random() * 4);
	var maxRightExits = 1;
	var maxLeftExits = 1;
	var maxRoofExits = 1;
	var maxFloorExits = 1;
	
	var rightExits = 0;
	var leftExits = 0;
	var roofExits = 0;
	var floorExits = 0;
	
	var tries = 10;
	while(tries > 0){
	for(var i = 0; i < exits; i++){
		var x = Math.floor(Math.random() * width);
		var y = Math.floor(Math.random() * height);
		
		x += startX;
		y += startY;
				
		var dir = Math.random();
		if(dir < 0.25 && rightExits < maxRightExits){
			dir = 1;
			while(map[x][y] != 1){
				x++;
			}
			if(x > 1 && x < this.width - 2){
				var t = Math.floor(Math.random() * (height-1) ) + 2;
				
				var n = 0;
				for(n = t; n > 0 && map[x-1][y] != 1; n--){
					y++;
				}
				y -= t;
				
				this.createDoor(x, y, dir, t , map)
				rightExits++;
			}
		}
			
		else if(dir < 0.5 && leftExits < maxLeftExits){
			dir = 1;
			while(map[x][y] != 1){
				x--;
			}
			if(x > 1 && x < this.width - 2){
				var t = Math.floor(Math.random() * (height-1) ) + 2;
				
				var n = 0;
				for(n = t; n > 0 && map[x+1][y] != 1; n--){
					y++;
				}
				y -= t;
				
				this.createDoor(x, y, dir, t , map)
				leftExits++;
			}
		}
		else if(dir < 0.75 && roofExits < maxRoofExits){
			dir = 2;
			while(map[x][y] != 1){
				y++;
			}
			if(y > 1 && y < this.height - 2){
				this.createDoor(x, y, dir, 1 + Math.ceil(Math.random() * (width / 4 )) , map);
				roofExits++;
			}
		}
		else if(dir <= 1 && floorExits < maxFloorExits){
			dir = 2;
			while(map[x][y] != 1){
				y--;
			}
			if(y > 1 && y < this.height - 2){
				this.createDoor(x, y, dir, Math.ceil(Math.random() * (width / 4 ) + 1) , map)
				floorExits++;
			}
		}			
	}
	tries--;
	}
}

/* Direction is
1 = right and left
2 = top and bottom
*/
MapGenerator.prototype.createDoor = function(x, y, direction, size, map){
	if(direction == 1){
		this.createRoom(map, x, y, 1, 1);
		//Check to see if a door exists
		var exists = false;
		var j = y;
		//Check up
		while(map[x + 1][j] == 0 && map[x - 1][j] ==0){
			if(map[x][j] == 0)
				exists = true;
			j++;
		}
		//Check down
		j = y-1;
		while(map[x + 1][j] == 0 && map[x - 1][j] ==0){
			if(map[x][j] == 0)
				exists = true;
			j--;
		}
		
		if(!exists)
			for(var i = 0; i < size; i++){
				if(map[x+1][y] == 0 && map[x-1][y] == 0){
					map[x][y] = 0;
				}
				y++;
			}
	}
	else if(direction == 2){
		this.createRoom(map, x, y, 1, 2);
		//Check to see if a door exists
		var exists = false;
		var j = x;
		//Check right
		while(map[j][y+1] == 0 && map[j][y-1] ==0){
			if(map[j][y] == 0)
				exists = true;
			j++;
		}
		
		//Check left
		j = x-1;
		while(map[j][y+1] == 0 && map[j][y-1] ==0){
			if(map[j][y] == 0)
				exists = true;
			j--;
		}
		if(!exists)
			for(var i = 0; i < size; i++){
				if(y+1 <= this.height && y-1 >= 0 && x < this.width && x > 0)
				if(map[x][y+1] == 0 && map[x][y-1] == 0){
					map[x][y] = 0;
				}
				x++;
			}
	}
}