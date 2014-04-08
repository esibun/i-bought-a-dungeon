Map = function(maxRoomSize, minRoomSize){
	this.maxRoomSize = maxRoomSize;
	this.minRoomSize = minRoomSize;
	
	this.width;
	this.height;
	
	this.characterSpawnX;
	this.characterSpawnY;
	
	this.walls;
	this.floor;
	this.colliders;
	
	this.roomCount = 0;
}

Map.prototype.createMap = function(width, height){
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
	 var spawnX = Math.random() * (width - Math.ceil(width * 0.25));
	 spawnX = parseInt(spawnX)+9;
	 var spawnY = Math.random() * (height - Math.ceil(height * 0.25));
	 spawnY = parseInt(spawnY)+1;
	 
	map = this.createRoom(map, spawnX, spawnY, 0);
	 
	 return map;
}
/*Types are:
	0 = spawn room
	1 = other
*/

//direct 1 is left and right, 2 is up and down
Map.prototype.createRoom = function(map, startX, startY, type, direction){
	if(type == 0){
		map = this.createStartingRoom(map, startX, startY);
	}
	else if(type == 1){
		this.createHorizontalRoom(map, startX, startY, direction);
	}
	
	return map;
	
}

//Starting room is a special, 1 time only case.	
Map.prototype.createStartingRoom = function(map, startX, startY){
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

Map.prototype.createHorizontalRoom = function(map, startX, startY, direction){

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
Map.prototype.hollow = function(x1, y1, x2, y2, map){
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

Map.prototype.createDoors = function(startX, startY, width, height, map){
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
Map.prototype.createDoor = function(x, y, direction, size, map){
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