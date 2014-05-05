MapRenderer = function(game, tileSize, tileScale, width, height){
	this.game = game;
	this.tileSize = tileSize;
	this.tileScale = tileScale;
	this.renderDistance = this.calculateRenderDistance();
	this.playerMapPositionX;
	this.playerMapPositionY;
	this.gameMap;
	this.height = height;
	this.width = width;
	this.colliders = new Array();
	this.wallSprites = new Array();
	this.shadows;
	this.shadow;
	
	this.lineMap = [];
	
	this.floor = new Array();
		for(var x = this.width-1; x >= 0; x--){
			this.floor[x] = new Array();
			for(var y = this.height -1; y >= 0; y--){
				this.floor[x][y] = this.game.add.sprite( x * this.tileSize, this.game.height - this.tileSize - y * this.tileSize, 'floor');
				this.floor[x][y].scale.x = this.tileScale;
				this.floor[x][y].scale.y = this.tileScale;
				this.floor[x][y].body = null;
				this.floor[x][y].kill();
			}
	 	}

}

MapRenderer.prototype.calculateRenderDistance = function(){
	var dist;
	
	if(this.game.width > this.game.height){
    	dist = this.game.width;
    }
    else{
    	dist = this.game.height;
    }
    dist = 2 + Math.ceil((dist / 2) / this.tileSize);
	
	return dist;
}

MapRenderer.prototype.drawScreen = function(player){
	this.calculatePlayerMapPosition(player);
    	for(var i = this.playerMapPositionX - this.renderDistance; i < this.playerMapPositionX + this.renderDistance; i++){	
    		for(var j = this.playerMapPositionY - this.renderDistance; j < this.playerMapPositionY + this.renderDistance; j++){
    			if(i > 0 && i < this.width && j > 0 && j < this.height){
    				if(i < this.width && i > 0 && j < this.height && j > 0){
    					if(this.gameMap[i][j] == 0){
    						this.floor[i][j].revive();
    					}
    				}
    			}
    		}
    	}
    	
    	for(var i = this.playerMapPositionX - this.renderDistance - 1; i < this.playerMapPositionX + this.renderDistance + 1; i++){
    		if( i > 0 && i < this.width && this.playerMapPositionY + this.renderDistance + 1 < this.height && this.playerMapPositionY + this.renderDistance + 1 > 0){
    			this.floor[i][this.playerMapPositionY+this.renderDistance + 1].kill();
    		}
    		if(i > 0 && i < this.width && this.playerMapPositionY-(this.renderDistance + 1) > 0 && this.playerMapPositionY- (this.renderDistance + 1) < this.height){
    			this.floor[i][this.playerMapPositionY-(this.renderDistance + 1)].kill();
    		}
    	}
    	for(var i = this.playerMapPositionY - this.renderDistance - 1; i < this.playerMapPositionY +this.renderDistance + 1; i++){
    		if(i > 0 && i < this.height && this.playerMapPositionX + this.renderDistance + 1 < this.width && this.playerMapPositionX + this.renderDistance + 1 > 0){
    			this.floor[this.playerMapPositionX+this.renderDistance + 1][i].kill();
    		}
    		if(i > 0 && i < this.height && this.playerMapPositionX - (this.renderDistance + 1) > 0 && this.playerMapPositionX - (this.renderDistance + 1) < this.width){
    			this.floor[this.playerMapPositionX-(this.renderDistance + 1)][i].kill();
    		}
    	}
    	
    	for(var i = 0; i < this.colliders.length; i++){
    		if((this.colliders[i].x / this.tileSize) >= (this.playerMapPositionX - this.renderDistance * 3) && (this.colliders[i].x / this.tileSize) <= this.playerMapPositionX + this.renderDistance * 3){
    			if(((this.game.height - this.colliders[i].y) / this.tileSize) >= (this.playerMapPositionY - this.renderDistance) && ((this.game.height - this.colliders[i].y) / this.tileSize) <= this.playerMapPositionY + this.renderDistance){
    				if(!this.colliders[i].alive){
    					this.colliders[i].revive();
    					//this.colliders[i].visible = false;
    				}
    			}
    		}
    		else if(this.colliders[i].alive){
    			this.colliders[i].kill();
    		}
    				 
    	}
    	
    	for(var i = 0; i < this.wallSprites.length; i++){
    		if((this.wallSprites[i].x / this.tileSize) >= (this.playerMapPositionX - this.renderDistance) && (this.wallSprites[i].x / this.tileSize) <= this.playerMapPositionX + this.renderDistance){
    			if(((this.game.height - this.wallSprites[i].y) / this.tileSize) >= (this.playerMapPositionY - this.renderDistance) && ((this.game.height - this.wallSprites[i].y) / this.tileSize) <= this.playerMapPositionY + this.renderDistance){
    				if(!this.wallSprites[i].alive){
    					this.wallSprites[i].revive();
    				}
    			}
    		}
    		else if(this.wallSprites[i].alive){
    			this.wallSprites[i].kill();
    		}
    				 
    	}
    }
    
MapRenderer.prototype.drawWalls = function(map){
		this.gameMap = map;
    	this.wallSprites = new Array();
    	var wallMap = new Array();
    	var i = 0;
    	for(var x = 0; x < this.width; x++){
    		wallMap[x] = new Array();
        	for(var y = 0; y < this.height; y++){
        		wallMap[x][y] = 0;
        		if(this.gameMap[x][y] == 1){
        			//create top wall
        			if(y > 0 && this.gameMap[x][y-1] == 0){
        				this.addSpriteToList(this.wallSprites, i, x, y, 'wall');
        				this.wallSprites[i].angle = -90;
        				this.wallSprites[i].y += this.tileSize;
        				i++;
        				wallMap[x][y] = 1;
        			}
        			//create bottom wall
        			if(y < this.height-1 && this.gameMap[x][y+1] == 0){
        				this.addSpriteToList(this.wallSprites, i, x, y, 'wall');
        				this.wallSprites[i].angle = 90;
        				this.wallSprites[i].x += this.tileSize;
        				i++;
        				wallMap[x][y] = 1;
        			}
        			//create right wall
        			if(x > 0 && this.gameMap[x-1][y] == 0){
        				this.addSpriteToList(this.wallSprites, i, x, y, 'wall');
        				i++;
        				wallMap[x][y] = 1;
        			}
        			//create left wall
        			if(x < this.width-1 && this.gameMap[x+1][y] == 0){
        				this.addSpriteToList(this.wallSprites, i, x, y, 'wall');
        				this.wallSprites[i].angle = 180;
        				this.wallSprites[i].x += this.tileSize;
        				this.wallSprites[i].y += this.tileSize;
        				i++;
        				wallMap[x][y] = 1;
        			}
        			
        			//create top left corner
        			if(this.checkBounds(x, y) && this.gameMap[x-1][y+1] == 0 && this.gameMap[x-1][y] == 0 && this.gameMap[x][y+1] == 0 || y < this.height-1 && x > 0 && this.gameMap[x-1][y+1] == 0 && this.gameMap[x-1][y] == 1 && this.gameMap[x][y+1] == 1){
        				this.addSpriteToList(this.wallSprites, i, x, y, 'corner');
        				i++;
        				wallMap[x][y] = 1;
        			}
        			//create top right corner
        			if(this.checkBounds(x, y) && this.gameMap[x+1][y+1] == 0 && this.gameMap[x][y+1] == 0 && this.gameMap[x+1][y] == 0 || y < this.height-1 && x < this.width-1 && this.gameMap[x+1][y+1] == 0 && this.gameMap[x][y+1] == 1 && this.gameMap[x+1][y] == 1){
        				this.addSpriteToList(this.wallSprites, i, x, y, 'corner');
        				this.wallSprites[i].angle = 90;
        				this.wallSprites[i].x += this.tileSize;
        				i++;
        				wallMap[x][y] = 1;
        			}
        			//create bottom right corner
        			if(this.checkBounds(x, y) && this.gameMap[x+1][y-1] == 0 && this.gameMap[x][y-1] == 0 && this.gameMap[x+1][y] == 0 || x < this.width-1 && y > 0 && this.gameMap[x+1][y-1] == 0 && this.gameMap[x][y-1] == 1 && this.gameMap[x+1][y] == 1){
        				this.addSpriteToList(this.wallSprites, i, x, y, 'corner');
        				this.wallSprites[i].angle = 180;
        				this.wallSprites[i].x += this.tileSize;
        				this.wallSprites[i].y += this.tileSize;
        				i++;
        				wallMap[x][y] = 1;
        			}
        			//create bottom left corner
        			if(this.checkBounds(x, y) && this.gameMap[x-1][y-1] == 0 && this.gameMap[x-1][y] == 0 && this.gameMap[x][y-1] == 0 || x > 0 && y > 0 && this.gameMap[x-1][y-1] == 0 && this.gameMap[x-1][y] == 1 && this.gameMap[x][y-1] == 1){
        				this.addSpriteToList(this.wallSprites, i, x, y, 'corner');
        				this.wallSprites[i].angle = -90;
        				this.wallSprites[i].y += this.tileSize;
        				i++;
        				wallMap[x][y] = 1;
        			}
    			}
    		}
    	}
    	
    	this.createColliders(wallMap);
    }
    
MapRenderer.prototype.createColliders = function(wallMap){
		this.lineMap = new Array();
		for(var i = 0; i < this.colliders.length; i++){
    		this.colliders[i].body = null;
    		this.colliders[i].destroy();
    	}
    	
    	this.colliders = new Array();
    	var i = 0;
    	for(var x = 0; x < this.width; x++){
    		for(var y = 0; y < this.height; y++){
    			var upY = y+1;
    			if(wallMap[x][y] == 1){
					var count = 0;
					var tempX = x;
					while(wallMap[tempX][y] == 1){
						wallMap[tempX][y] = 0;
						i = this.checkUp(wallMap, i, tempX, y);
						count++;
						tempX++;
					}
					this.addSpriteToList(this.colliders, i, x, y, 'invisible');
					this.colliders[i].scale.x *= count;
					this.game.physics.enable(this.colliders[i], Phaser.Physics.ARCADE);
					this.colliders[i].body.immovable = true;
					//this.colliders[i].visible = false;
    				i++;
    			}
    		}
    	}
		this.lineCastWalls();
    }
    
MapRenderer.prototype.checkUp = function(wallMap, pos, x, y){
    	y++;
    	if(wallMap[x][y] == 1){
    		this.addSpriteToList(this.colliders, pos, x, y, 'invisible');
						
			var count = 0;
			while(wallMap[x][y] == 1){
				wallMap[x][y] = 0;
				count++;
				y++;
			}
			this.colliders[pos].scale.y *= count;
			this.colliders[pos].y -= (this.tileSize * (count-1));
			this.game.physics.enable(this.colliders[pos], Phaser.Physics.ARCADE);
			this.colliders[pos].body.immovable = true;
			//this.colliders[pos].visible = false;
			pos++;
    	}
    	return pos;
    }
    
MapRenderer.prototype.addSpriteToList = function(target, pos, x, y, type){
    	if(pos >= target.length)
    		target.push( this.game.add.sprite(x * this.tileSize, this.game.height - this.tileSize - y * this.tileSize, type));
    	else
    		target[pos] = this.game.add.sprite(x * this.tileSize, this.game.height - this.tileSize - y * this.tileSize, type);
    	target[pos].scale.x = this.tileScale;
    	target[pos].scale.y = this.tileScale;
    }
    
MapRenderer.prototype.checkBounds = function(x, y){
    	return x > 0 && x < this.width -1 && y > 0 && y < this.height -1;
    }
    
MapRenderer.prototype.calculatePlayerMapPosition = function(player){
    	this.playerMapPositionX = player.x % this.tileSize;
    	this.playerMapPositionY = (this.game.height - player.y) % this.tileSize;
    	this.playerMapPositionX = (player.x - this.playerMapPositionX) / this.tileSize;
    	this.playerMapPositionY = (this.game.height - player.y - this.playerMapPositionY) / this.tileSize;
    }
    
MapRenderer.prototype.clear = function(){
	for(var i = 0; i < this.width; i++){	
    	for(var j = 0; j < this.height; j++){
    		if(this.floor[i][j].alive)
    			this.floor[i][j].kill();
    	}
    }
    for(var i = 0; i < this.wallSprites.length; i++){
    	this.wallSprites[i].destroy();
    }
}

MapRenderer.prototype.setupShadowLayer = function(){
	this.shadows = this.game.add.bitmapData(this.game.width, this.game.height);
	//this.shadows.context.fillStyle = 'rgb(255, 255, 255)';
	this.shadows.context.strokeStyle = 'rgb(255, 255, 255)';
	this.shadow = this.game.add.image(0, 0, this.shadows);
	//this.shadow.fixedToCamera = true;
	
	this.shadow.blendMode = Phaser.blendModes.MULTIPLY;
	
}

MapRenderer.prototype.createWallLines = function(){
	this.colliders.forEach(function(wall){
		var x = wall.x - this.shadow.x;
		var y = wall.y - this.shadow.y;
		
		var lines = [
			new Phaser.Line(x, y, x + wall.width, y),
			new Phaser.Line(x, y, x, y + wall.height),
			new Phaser.Line(x + wall.width, y, x + wall.width, y + wall.height),
            new Phaser.Line(x, y + wall.height, x + wall.width, y + wall.height) ];
			
			
			
		this.shadows.context.beginPath();
		this.shadows.context.moveTo(x, y);
		this.shadows.context.lineTo(x + wall.width, y);
		this.shadows.context.stroke();
			
		this.shadows.context.beginPath();
		this.shadows.context.moveTo(x, y);
		this.shadows.context.lineTo(x, y + wall.height);
		this.shadows.context.stroke();
			
		this.shadows.context.beginPath();
		this.shadows.context.moveTo(x + wall.width, y);
		this.shadows.context.lineTo(x + wall.width, y + wall.height);
		this.shadows.context.stroke();
			
		this.shadows.context.beginPath();
		this.shadows.context.moveTo(x, y + wall.height);
		this.shadows.context.lineTo(x + wall.width, y + wall.height);
		this.shadows.context.stroke();
			
	}, this);
}

MapRenderer.prototype.cornerTest = function(emitter){
	var points = [];
	var ray = null;
	var intersect;
	var source = new Phaser.Point(emitter.x - this.shadow.x, emitter.y - this.shadow.y);
	this.colliders.forEach(function(wall){
	if((wall.x / this.tileSize) <= (emitter.x / this.tileSize) + this.renderDistance && (wall.x /this.tileSize) >= (emitter.x / this.tileSize) - this.renderDistance
		&& (wall.y / this.tileSize) <= (emitter.y / this.tileSize) + this.renderDistance && (wall.y / this.tileSize) >= (emitter.y/this.tileSize) - this.renderDistance){
		var x = wall.x - this.shadow.x;
		var y = wall.y - this.shadow.y;
		var corners = [
			new Phaser.Point(x + 0.1, y + 0.1),
			new Phaser.Point(x - 0.1, y - 0.1),
		
			new Phaser.Point(x + 0.1, y + wall.height + 0.1),
			new Phaser.Point(x - 0.1, y + wall.height - 0.1),
		
			new Phaser.Point(x + wall.width + 0.1, y + 0.1),
			new Phaser.Point(x + wall.width + 0.1, y + 0.1),
		
			new Phaser.Point(x + wall.width + 0.1, y + wall.height + 0.1),
			new Phaser.Point(x + wall.width - 0.1, y + wall.height - 0.1) ];
	
	
	for(var i = 0; i < corners.length; i++){
		var c = corners[i];
		
		var slope = (c.y - source.y) / (c.x - source.x);
		var b = source.y - slope * source.x;
		var end = null;
		
		if(c.x === source.x){
			if(c.y <= source.y){
				end = new Phaser.Point(source.x, 0);
			}
			else {
				end = new Phaser.Point(source.x, this.game.height);
			}
		}
		else if(c.y === source.y){
			if(c.x <= source.x){
				end = new Phaser.Point(0, source.y);
			}
			else{
				end = new Phaser.Point(this.game.width, source.y);
			}
		}
		else{
			var left = new Phaser.Point(0,b);
			var right = new Phaser.Point(this.game.width, slope * this.game.width + b);
			var top = new Phaser.Point(-b/slope,0);
			var bottom = new Phaser.Point((this.game.height-b)/slope, this.game.height);
			
			if(c.y <= source.y && c.x >= source.x){
				if(top.x >= 0 && top.x <= this.game.width){
					end = top;
				}
				else {
					end = right;
				}
			}
			else if(c.y <= source.y && c.x <= source.x){
				if(top.x >= 0 && top.x <= this.game.width){
					end = top;
				}
				else {
					end = left;
				}
			}
			else if(c.y >= source.y && c.x >= source.x){
				if(bottom.x >= 0 && bottom.x <= this.game.width){
					end = bottom;
				}
				else {
					end = right;
				}
			}
			else if(c.y >= source.y && c.x <= source.x){
				if(bottom.x >= 0 && bottom.x <= this.game.width){
					end = bottom;
				}
				else {
					end = left;
				}
			}
		}
		
		
		ray = new Phaser.Line(source.x, source.y, end.x, end.y);
		intersect = this.getWallIntersection(ray, emitter);
		
		if(intersect){
			points.push(intersect);
		}
		else{
			points.push(ray.end);
		}
		
	/*	var x = source.x;// - this.shadow.x;
		var y = source.y;// - this.shadow.y;
		var a = end.x;// - this.shadow.x;
		var b = end.y;// - this.shadow.y;
		
		this.shadows.context.beginPath();
		this.shadows.context.moveTo(x, y);
		this.shadows.context.lineTo(a, b);
		this.shadows.context.stroke();*/
		}
	}
	}, this);
	
	var stageCorners = [
		new Phaser.Point(0, 0),
		new Phaser.Point(this.game.width, 0),
		new Phaser.Point(this.game.width, this.game.height),
		new Phaser.Point(0, this.game.height) ];
	
	//Fill entire area
	this.shadows.context.beginPath();
	this.shadows.context.fillStyle = 'rgb(0, 0, 0)';
	this.shadows.context.moveTo(stageCorners[0].x, stageCorners[0].y);
	for(var i = 0; i < stageCorners.length; i++){
		this.shadows.context.lineTo(stageCorners[i].x, stageCorners[i].y);
	}
	this.shadows.context.closePath();
	//this.shadows.context.fill();
	var gradient = this.shadows.context.createRadialGradient(source.x, source.y, 0, source.x, source.y, 600)
	gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
	gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
	this.shadows.context.fill();
	this.shadows.context.fillStyle = gradient;
	this.shadows.context.fill();
	
	for(var i = 0; i < stageCorners.length; i++){
		ray = new Phaser.Line(source.x, source.y, stageCorners[i].x, stageCorners[i].y);
		intersect = this.getWallIntersection(ray, emitter);
		
		if(!intersect){
			points.push(stageCorners[i]);
		}
		
	/*	var x = source.x;
		var y = source.y;
		var a = stageCorners[i].x;
		var b = stageCorners[i].y;
		
		this.shadows.context.beginPath();
		this.shadows.context.moveTo(x, y);
		this.shadows.context.lineTo(a, b);
		this.shadows.context.stroke();*/
	}
	
	var center = { x: source.x, y: source.y };
	points = points.sort(function(a,b){
		if(a.x - center.x >= 0 && b.x - center.x < 0)
			return 1;
		if(a.x - center.x < 0 && b.x - center.x >= 0)
			return -1;
		if(a.x - center.x === 0 && b.x - center.x === 0){
			if(a.y - center.y >= 0 || b.y - center.y >= 0)
				return 1;
			return -1;
		}
		
		var det = (a.x - center.x) * (b.y - center.y) - (b.x - center.x) * (a.y - center.y);
		if(det < 0)
			return 1;
		if(det > 0)
			return -1;
			
		var d1 = (a.x - center.x) * (a.x - center.x) + (a.y - center.y) * (a.y - center.y);
		var d2 = (b.x - center.x) * (b.x - center.x) + (b.y - center.y) * (b.y - center.y);
		return 1;
	});
	
	this.shadows.context.beginPath();
	this.shadows.context.fillStyle = 'rgb(255, 255, 255)';
	this.shadows.context.moveTo(points[0].x, points[0].y);
	for(var i = 0; i < points.length; i++){
		this.shadows.context.lineTo(points[i].x, points[i].y);
	}
	this.shadows.context.closePath();
	var t = this.shadows.context.createRadialGradient(source.x, source.y, 100, source.x, source.y, 500);
	t.addColorStop(0, 'rgba(255, 255, 255, 1)');
	t.addColorStop(1, 'rgba(255, 255, 255, 0)');
	this.shadows.context.fillStyle = t;
	this.shadows.context.fill();
	
	
	
	this.shadows.dirty = true;
	this.shadows.render();
}

MapRenderer.prototype.getWallIntersection = function(ray, emitter){
	var distanceToWall = Number.POSITIVE_INFINITY;
	var closestIntersection = null;
	
	this.colliders.forEach(function(wall){
	
		if((wall.x / this.tileSize) <= (emitter.x / this.tileSize) + this.renderDistance && (wall.x /this.tileSize) >= (emitter.x / this.tileSize) - this.renderDistance
		&& (wall.y / this.tileSize) <= (emitter.y / this.tileSize) + this.renderDistance && (wall.y / this.tileSize) >= (emitter.y/this.tileSize) - this.renderDistance){

			var x = wall.x - this.game.camera.x;
			var y = wall.y - this.game.camera.y;
		
			var lines = [
				new Phaser.Line(x, y, x + wall.width, y),
				new Phaser.Line(x, y, x, y + wall.height),
				new Phaser.Line(x + wall.width, y, x + wall.width, y + wall.height),
				new Phaser.Line(x, y + wall.height, x + wall.width, y + wall.height) ];
			
			for(var i = 0; i < lines.length; i++){
				var intersect = Phaser.Line.intersects(ray, lines[i]);
				if(intersect){
					distance = this.game.math.distance(ray.start.x, ray.start.y, intersect.x, intersect.y);
					
					if(distance < distanceToWall){
						distanceToWall = distance;
						closestIntersection = intersect;
					}
				}
			}
		}
	}, this);
	
	return closestIntersection;
}

MapRenderer.prototype.raycast = function(ray, emitter){
	var distanceToWall = Number.POSITIVE_INFINITY;
	var closestIntersection = null;
	
		
		for(var i = 0; i < this.lineMap.length; i++){
			if((this.lineMap[i].x / this.tileSize) <= (emitter.x / this.tileSize) + this.renderDistance && (this.lineMap[i].x /this.tileSize) >= (emitter.x / this.tileSize) - this.renderDistance
			&& (this.lineMap[i].y / this.tileSize) <= (emitter.y / this.tileSize) + this.renderDistance && (this.lineMap[i].y / this.tileSize) >= (emitter.y/this.tileSize) - this.renderDistance){
				var intersect = Phaser.Line.intersects(ray, this.lineMap[i]);
				if(intersect){
					distance = this.game.math.distance(ray.start.x, ray.start.y, intersect.x, intersect.y);
						
					if(distance < distanceToWall){
						distanceToWall = distance;
						closestIntersection = intersect;
					}
				}
			}
		}
	return closestIntersection;
}

MapRenderer.prototype.lineCastWalls = function(){
	this.colliders.forEach(function(wall){

			var x = wall.x;
			var y = wall.y;
		
			this.lineMap.push(new Phaser.Line(x, y, x + wall.width, y));
			this.lineMap.push(new Phaser.Line(x, y, x, y + wall.height));
			this.lineMap.push(new Phaser.Line(x + wall.width, y, x + wall.width, y + wall.height));
			this.lineMap.push(new Phaser.Line(x, y + wall.height, x + wall.width, y + wall.height));
				
	}, this);
}

MapRenderer.prototype.shadowUpdate = function(source){
	this.shadows.context.clearRect(0,0, this.game.width, this.game.height);
	this.shadow.x = this.game.camera.x;
	this.shadow.y = this.game.camera.y;

	//this.shadows.x = this.game.camera.x;
	//this.shadows.y = this.game.camera.y;
	
	//this.createWallLines();
	this.cornerTest(source);
	
	//this.shadows.alphaMask(this.shadow, this.blackPic);
	
}

