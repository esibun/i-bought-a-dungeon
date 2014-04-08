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
    					this.colliders[i].visible = false;
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
					this.colliders[i].visible = false;
    				i++;
    			}
    		}
    	}
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
			this.colliders[pos].visible = false;
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

MapRenderer.prototype.clearWalls = function(){
	
}