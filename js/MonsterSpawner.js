MonsterSpawner = function(game, tileSize, tileScale){
	this.game = game;
	this.tileSize = tileSize;
	this.tileScale = tileScale;
}

MonsterSpawner.prototype.spawnRandom = function (map, amount, type, health, damage){
	var mobs = new Array();
	for(var i = 0; i < amount; i++){
		var x = Math.floor(Math.random() * map.length);
		var y = Math.floor(Math.random() * map[0].length); 
		while(map[x][y] != 0){
			var x = Math.floor(Math.random() * map.length);
			var y = Math.floor(Math.random() * map[0].length); 
		}
		mobs.push(this.spawn(x, y, type, health, damage));
	}
	return mobs;
}

MonsterSpawner.prototype.spawn = function(x, y, type, health, damage){
	var sprite = this.game.add.sprite(x * this.tileSize, this.game.height - this.tileSize - y * this.tileSize, type);
	sprite.scale.x = this.tileScale/2;
	sprite.scale.y = this.tileScale/2;
	sprite.anchor.setTo(0.5, 0.5);
	sprite.animations.add('walk', [2, 3, 4, 5]);
	this.game.physics.enable(sprite, Phaser.Physics.ARCADE);
	var mob = new Character(sprite, health, damage, this.tileSize);
	return mob;
}

Character = function(sprite, health, damage, tileSize){
	this.health = health;
	this.damage = damage;
	this.sprite = sprite;
	this.sprite.health = health;
	this.mapPositionX;
	this.mapPositionY;
	this.tileSize = tileSize;
	this.lastTimeTakingDamage = 0;
	
	this.pathTarget;
	this.directPath = true;
};

Character.prototype.moveTo = function(target, speed, map){
	var distance = Math.sqrt(Math.pow((this.sprite.x - target.x), 2) + Math.pow((this.sprite.y - target.y), 2));
	distance /= speed;
	
	this.sprite.body.velocity.x = 0;
	this.sprite.body.velocity.y = 0;
	
	if(distance < 1.5){
		
/*		var y =	this.tileSize * Math.sin((this.sprite.angle) * Math.PI / 180);
		var x = this.tileSize * Math.cos((this.sprite.angle) * Math.PI / 180);
		x = Math.floor(x);
		y = Math.floor(y);
		
		var checkX = this.calculateMapPositionX(x);
		var checkY = this.calculateMapPositionY(y);
		
		this.directPath = true;
		if(checkX < map.length && checkX > 0 && checkY > 0 && checkY < map[checkX].length && map[checkX][checkY] == 1){
			this.directPath = false;
		}
		
		if(this.directPath){*/
			this.sprite.rotation = this.sprite.game.physics.arcade.angleToXY(this.sprite, target.x, target.y);
			this.sprite.game.physics.arcade.moveToXY(this.sprite, target.x, target.y, (speed * 0.9));
			this.sprite.animations.play('walk', 7, false);
	//	}
	}
}

Character.prototype.takeDamage =  function(amount){
	if(this.lastTimeTakingDamage < this.sprite.game.time.now - 200){
		this.lastTimeTakingDamage = this.sprite.game.time.now;
		this.health -= amount;
		if(this.health <= 0)
			this.death();
	}
}

Character.prototype.death = function(){
	this.sprite.kill();
}

Character.prototype.dealDamage = function(target){
	target.takeDamage(this.damage);
}

Character.prototype.calculateSpriteMapPosition = function(){
	this.mapPositionX = this.sprite.x % this.tileSize;
	this.mapPositionY = (this.sprite.game.height - this.sprite.y) % this.tileSize;
	this.mapPositionX = (this.sprite.x - this.mapPositionX) / this.tileSize;
	this.mapPositionY = (this.sprite.game.height - this.sprite.y - this.mapPositionY) / this.tileSize;
}

Character.prototype.calculateMapPositionX = function(x){
	x += this.sprite.x;
	var delta = x % this.tileSize;
	return (x - delta) / this.tileSize;
}

Character.prototype.calculateMapPositionY = function(y){
	y += this.sprite.y;
	var delta = (this.sprite.game.height - y) % this.tileSize;
	return (this.sprite.game.height - y - delta) / this.tileSize;
}    