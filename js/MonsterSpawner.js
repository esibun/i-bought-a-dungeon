MonsterSpawner = function(game, tileSize, tileScale){
	this.game = game;
	this.tileSize = tileSize;
	this.tileScale = tileScale;
}

MonsterSpawner.prototype.spawnRandom = function (map, amount, type, health, damage, mapRenderer, avoid){
	var mobs = new Array();
	for(var i = 0; i < amount; i++){
		var x = avoid.x / this.tileSize;
		var y = avoid.y / this.tileSize; 
		while(x < (avoid.x / this.tileSize) + mapRenderer.renderDistance 
		&& x > (avoid.x / this.tileSize) - mapRenderer.renderDistance
		&& y < (avoid.y / this.tileSize) + mapRenderer.renderDistance
		&& y > (avoid.y / this.tileSize) - mapRenderer.renderDistance){
			x = Math.floor(Math.random() * map.length);
			y = Math.floor(Math.random() * map[0].length);
			while(map[x][y] != 0){
				x = Math.floor(Math.random() * map.length);
				y = Math.floor(Math.random() * map[0].length); 
			}
		}
		mobs.push(this.spawn(x, y, type, health, damage, mapRenderer));
	}
	return mobs;
}

MonsterSpawner.prototype.spawn = function(x, y, type, health, damage, mapRenderer){
	var sprite = this.game.add.sprite(x * this.tileSize + this.tileSize/2, this.game.height - this.tileSize/2 - y * this.tileSize, type);
	sprite.scale.x = this.tileScale/2;
	sprite.scale.y = this.tileScale/2;
	sprite.anchor.setTo(0.5, 0.5);
	sprite.animations.add('walk', [2, 3, 4, 5]);
	this.game.physics.enable(sprite, Phaser.Physics.ARCADE);
	sprite.body.setSize(50, 50, 0, 0);
	var mob = new Character(sprite, health, damage, this.tileSize, this.tileScale, this.game, type, mapRenderer);
	return mob;
}

Character = function(sprite, health, damage, tileSize, tileScale, game, type, mapRenderer){
	this.game = game;
	this.mapRenderer = mapRenderer;
	this.type = type;
	this.health = health;
	this.damage = damage;
	this.sprite = sprite;
	this.sprite.health = health;
	this.mapPositionX;
	this.mapPositionY;
	this.tileSize = tileSize;
	this.tileScale = tileScale;
	this.lastTimeTakingDamage = 0;
	
	this.pathTarget;
	this.directPath = true;
	
	this.knockedBack = false;
	this.knockbackX;
	this.knockbackY;
	
	this.clangSound = this.game.add.sound('swordClang');
	this.aggroed = false;
	
	this.attackTimer = 0;
	this.attackSpeed = 2;
	
	this.projectiles;
	this.weapon;
	if(this.type == 'archer'){
		this.weapon = this.game.add.sprite(0, 0, 'bow');
		this.weapon.scale.x = this.tileScale;
		this.weapon.scale.y = this.tileScale;
		this.weapon.anchor.x = -1;
		this.weapon.anchor.y = 0.5;
		this.weapon.kill();
	
		this.projectiles = this.game.add.group();
		this.projectiles.createMultiple(6, 'arrow');
		this.projectiles.setAll('anchor.x', 0.5);
		this.projectiles.setAll('anchor.y', 0.5);
		this.projectiles.setAll('scale.x', this.tileScale);
		this.projectiles.setAll('scale.y', this.tileScale);
		this.projectiles.setAll('lifespan', 6);
		//this.projectiles.setAll('alive', false);
		this.projectiles.forEach(function(sprite){ game.physics.enable(sprite, Phaser.Physics.ARCADE); });
		
		this.bowShotSound = this.game.add.sound('bowShot');
	}
	else if(this.type == 'mage'){
		this.weapon = this.game.add.sprite(0, 0, 'magearm');
		this.weapon.scale.x = this.tileScale/1.7;
		this.weapon.scale.y = this.tileScale/1.7;
		this.weapon.anchor.x = 0.5;
		this.weapon.anchor.y = -1.1;
		this.weapon.kill();
	
		this.projectiles = this.game.add.group();
		this.projectiles.createMultiple(6, 'mageball');
		this.projectiles.setAll('anchor.x', 0.5);
		this.projectiles.setAll('anchor.y', 0.5);
		this.projectiles.setAll('scale.x', this.tileScale / 2);
		this.projectiles.setAll('scale.y', this.tileScale / 2);
		this.projectiles.setAll('lifespan', 6);
		this.projectiles.forEach(function(sprite){ game.physics.enable(sprite, Phaser.Physics.ARCADE); });
		
		this.mageBallSound = this.game.add.sound('mageBallSound');
	}
	else if(this.type == 'bloodknight' || this.type == 'darkknight'){
		this.aggroSound = this.game.add.sound('monsterSound1');
	}
};

Character.prototype.update = function(target, speed, map){
	var distance = Math.sqrt(Math.pow((this.sprite.x - target.x), 2) + Math.pow((this.sprite.y - target.y), 2));
	distance /= speed;
	speed *= 0.9;
	this.sprite.body.velocity.x = 0;
	this.sprite.body.velocity.y = 0;
	
	if(distance < 2){
	
		if(this.type == 'archer'){
			this.archerUpdate(target, speed);
		}	
		else if(this.type =='mage'){
			this.mageUpdate(target, speed);
		}
		else{
			this.moveTo(target, speed, map);
			if(!this.aggroed)
				this.aggroSound.play('', Math.random()/2, 0.5);
		}
		this.aggroed = true;
	}
	
	return this.projectiles;
}

Character.prototype.moveTo = function(target, speed, map){
	
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
	
	
	if(this.knockedBack){
		this.sprite.body.velocity.x = this.knockbackX;
		this.sprite.body.velocity.y = this.knockbackY;
		var temp = Math.sqrt(Math.pow(this.knockbackX, 2) + Math.pow(this.knockbackY, 2));
		this.knockbackX -= this.game.time.physicsElapsed * 2000 *(this.knockbackX/ temp);
		this.knockbackY -= this.game.time.physicsElapsed * 2000 *(this.knockbackY/ temp);
		if(this.knockbackX < 30 && this.knockbackY < 30 && this.knockbackX > -30 && this.knockbackY > -30){
			this.knockedBack = false;
		}
	}
}


Character.prototype.takeDamage =  function(amount){
	if(this.lastTimeTakingDamage < this.sprite.game.time.now - 500){
		this.clangSound.play('', .2);
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

Character.prototype.knockback = function(source, force){
	var x = this.sprite.x - source.x;
	var y = this.sprite.y - source.y;
	var unit = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
	var angle = -Math.atan2(y, x) / Math.PI;
	this.knockbackX = force * (x/unit);
	this.knockbackY = force * (y/unit);
	this.knockedBack = true;
	
}

Character.prototype.shootProjectile = function(target, velocity){
	var arrow = this.projectiles.getFirstDead();
	arrow.revive();
	arrow.lifespan = 5000;
	arrow.x = this.sprite.x;
	arrow.y = this.sprite.y;

	arrow.rotation = this.sprite.game.physics.arcade.angleToXY(arrow, target.x, target.y);
	var x = target.x - arrow.x;
	var y = target.y - arrow.y;
	
	var unit = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
	var angle = -Math.atan2(y, x) / Math.PI;
	arrow.body.velocity.x = velocity * (x/unit);
	arrow.body.velocity.y = velocity * (y/unit);
	
}

Character.prototype.keepAtDistance = function(target, speed, distance){
	var dist = this.game.math.distance(this.sprite.x, this.sprite.y, target.x, target.y) / speed;
	if(this.type == 'archer'){ 
		speed *= 0.4; 
	} 
	else if( this.type == 'mage'){ 
		speed *= 0.25;
	}
	
	if(dist > distance + 0.1){
		this.moveTo(target, speed);
	}
	else if(dist < distance - 0.1){
		this.sprite.rotation = this.sprite.game.physics.arcade.angleToXY(this.sprite, target.x, target.y);
		this.sprite.animations.play('walk', 7, false);
		
		var x = this.sprite.x - target.x;
		var y = this.sprite.y - target.y;
		var unit = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
		var angle = -Math.atan2(y, x) / Math.PI;
		this.sprite.body.velocity.x = speed * (x/unit);
		this.sprite.body.velocity.y = speed * (y/unit);
	}
	else{
		this.sprite.rotation = this.sprite.game.physics.arcade.angleToXY(this.sprite, target.x, target.y);
		
		this.sprite.body.velocity.x = 0;
		this.sprite.body.velocity.y = 0;
	}
}

Character.prototype.archerUpdate = function(target, speed){
	this.keepAtDistance(target, speed, 0.8);
	if(this.attackTimer <= 0){
		this.weapon.revive();
		this.weapon.x = this.sprite.x;
		this.weapon.y = this.sprite.y;
		this.weapon.rotation = this.sprite.rotation;
		this.weapon.lifespan = 200;
		
		this.weapon.visible = true;
		var ray = new Phaser.Line(this.sprite.x, this.sprite.y, target.x, target.y);
		var intersection = this.mapRenderer.raycast(ray, this.sprite);
		if(!intersection){
			this.shootProjectile(target, 300);
			this.attackTimer = this.attackSpeed;
			this.bowShotSound.play();
		}
	}
	else{
		this.attackTimer -= this.game.time.physicsElapsed;
		this.weapon.x = this.sprite.x;
		this.weapon.y = this.sprite.y;
		this.weapon.rotation = this.sprite.rotation;
	}
}

Character.prototype.mageUpdate = function(target, speed){
	this.keepAtDistance(target, speed, 1.25);
	if(this.attackTimer <= 0){
		this.weapon.revive();
		this.weapon.x = this.sprite.x;
		this.weapon.y = this.sprite.y;
		this.weapon.rotation = this.sprite.rotation;
		this.weapon.lifespan = 200;
	
		var ray = new Phaser.Line(this.sprite.x, this.sprite.y, target.x, target.y);
		var intersection = this.mapRenderer.raycast(ray, this.sprite);
		if(!intersection){
			this.shootProjectile(target, 300);
			this.attackTimer = this.attackSpeed;
			this.mageBallSound.play('', 0, 0.5);
		}
	}
	else{
		this.attackTimer -= this.game.time.physicsElapsed;
		this.weapon.x = this.sprite.x;
		this.weapon.y = this.sprite.y;
		this.attackTimer -= this.game.time.physicsElapsed;
	}
}

