//BILAL CHAUDHRY'S TOWER DEFENSE GAME

$(document).ready(function(){
	
document.body.onmousedown = function() { return false; } //so page is unselectable

	//Canvas stuff
	var canvas = $("#canvas")[0];
	var ctx = canvas.getContext("2d");
	var w = $("#canvas").width();
	var h = $("#canvas").height();
	
	
	var mx, my;			//mouse coordinate variables
	var menu;			//boolean variables used to determine which part of the game to display (menu or game)
	var game;
	var gameOver;
	var round;
	
	//all images/graphics used in game
	var menuBack = new Image;
	menuBack.src = 'resources/background3.jpg';
	var gameBack = new Image;
	gameBack.src = 'resources/path.png';
	var enemy = new Image;
	enemy.src = 'resources/monkey.png';
	var archer = new Image;
	archer.src = 'resources/archerTower.png';
	var freezer = new Image;
	freezer.src = 'resources/freezeTower.png';
	var ice = new Image;
	ice.src = 'resources/ice.png';
	var cannon = new Image;
	cannon.src = 'resources/cannon.png';
	var tack = new Image;
	tack.src = 'resources/tackShooter.png';
	var bomb = new Image;
	bomb.src = 'resources/bomb.png';
	var nuke = new Image;
	nuke.src = 'resources/nuke.png';
	var nukeExplosion = new Image;
	nukeExplosion.src = 'resources/nukeExplosion.png';
	var radius50 = new Image;
	radius50.src = 'resources/radius50.png';
	var radius75 = new Image;
	radius75.src = 'resources/radius75.png';
	var radius100 = new Image;
	radius100.src = 'resources/radius100.png';
	var radius150 = new Image;
	radius150.src = 'resources/radius150.png';
	var explosion = new Image;
	explosion.src = 'resources/explosion2.png';
	var castle1 = new Image;
	castle1.src = 'resources/castle1.png';
	var castle2 = new Image;
	castle2.src = 'resources/castle2.png';
	var coins = new Image;
	coins.src = 'resources/coins.png';
	var coin = new Image;
	coin.src = 'resources/coin.png';
	
	//array of enemies, towers, buttons etc.
	var buttons;
	var enemies;
	var archers;
	var freezers;
	var cannons;
	var tacks;
	var bombs;
	
	//nuke variables
	var nukeCountdown;
	var nukeFrequency;
	var nukeEm;
	
	//important variables used to increase difficulty of each round
	var level;
	var enemyNum;
	
	//castle health and gold variables, if castleHP == 0, game over, gold is used to buy towers and upgrades
	var castleHP;
	var gold;
	var kills;
	
	//boolean variables used to add and create drag effect for towers into the battlefield
	var archerDrag;
	var freezerDrag;
	var bombDrag;
	var cannonDrag;
	var tackDrag;
	
	//paint function runs every 15ms and spawn function runs every 1s
	var paint = setInterval(paint, 15);
	var spawn = setInterval(spawner, 1000);
	
	//game initiates through this function where all variables are set to appropriate values (example: menu = true so that the game starts at main menu)
	//when game restarts, this function resets every variable
	function reset(){
		menu = true;
		game = false;
		gameOver = false;
		round = false;
		level = 1;
		enemyNum = 0;
		castleHP = 100;
		gold = 100;
		buttons = [];
		enemies = [];
		archers = [];
		freezers = [];
		cannons = [];
		tacks = [];
		bombs = [];
		nukeCountdown = 3.3;
		nukeFrequency = 220;
		nukeEm = false;
		kills = 0;
		buttons[0] = makeButton(1000, 50, 'Play Game', 190, 50, '24pt Impact', 'grey');			//button in main menu to start game
		buttons[1] = makeButton(15, 470, 'Start Round', 150, 40, '18pt Arial', 'grey');			//in game button to start the next round
		buttons[2] = makeButton(1050, 620, 'End Game', 150, 45, '18pt Arial', 'grey');			//button to end game
		buttons[3] = makeButton(500, 520, 'Restart', 245, 80, '36pt Impact', 'grey');
		//makeButton(x,y,text,w,h,font,buttonCol)
	}
	reset();
	
	//--------------------------------------------------------------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------------------------------------------------------------
	//----------------------------------------------------------------CONSTRUCTOR FUNCTIONS-------------------------------------------------------------
	
	//constructor function for creating buttons
	function makeButton(bx, by, bText, bWid, bHei, bFont, color){
		return{
			x:bx,						//important variables to make button
			y:by,
			text:bText,
			w:bWid,
			h:bHei,
			font:bFont,
			col:color,
			drawButton:function(adjX, adjY, alpha){			//draws button
				ctx.globalAlpha = alpha;
				ctx.fillStyle = this.col;
				ctx.font = this.font;
				ctx.fillRect(this.x, this.y, this.w, this.h);
				ctx.fillStyle = 'black';
				ctx.globalAlpha = 1;
				ctx.fillText(this.text, this.x + adjX, this.y + adjY);
			}
		}
	}
	reset();
	
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	//constructor function to create enemies (monkeys)
	function makeEnemy(spd, health){
		var ex = -30;					//each enemy starts at same x,y coordinates
		var ey = 410;
		return{
			x:ex,
			y:ey,
			speed:spd,
			hp:health,
			slowed:false,
			freezerHit:-1,
			arrX:[240, 240, 410, 410, 645, 645, 245, 245, 775, 775, 925, 925, 775, 775, 240, 240],	//arrX and arrY give the monkeys a path to follow
			arrY:[410, 295, 295, 660, 660, 195, 195, 85, 85, 190, 190, 310, 310, 525, 525, 700],
			drawEnemy:function(){																//function that draws enemy and its health bar above it
				ctx.drawImage(enemy, this.x - 15, this.y - 15);
				ctx.fillStyle = 'red';
				ctx.fillRect(this.x - 20, this.y - 20, 40, 5);
				ctx.fillStyle = 'green';
				if(level < 8) ctx.fillRect(this.x - 20, this.y - 20, this.hp/(Math.pow(1.05, level) * 90) * 40, 5);
				else if(level >= 8 && level <= 15) ctx.fillRect(this.x - 20, this.y - 20, this.hp/(Math.pow(1.15, level) * 50) * 40, 5);
				else ctx.fillRect(this.x - 20, this.y - 20, this.hp/(Math.pow(1.2, level) * 20) * 40, 5);
				if(this.slowed == true){
					ctx.globalAlpha = 0.3;
					ctx.drawImage(ice, this.x-20, this.y-20);
					ctx.globalAlpha = 1;
				}
			},
			move:function(){						//function that makes each monkey move towards the next coordinate in arrX and arrY
				if(this.x < this.arrX[0]){			//each time a pair of coordinates is reached, the first element in arrX and arrY is removed with splice
					this.x += this.speed;
					if(this.x == this.arrX[0] && this.y == this.arrY[0]){
						this.arrX.splice(0,1);
						this.arrY.splice(0,1);
					}
					else if(this.arrX[0] - this.x < 2.5){
						this.x = this.arrX[0];
						this.arrX.splice(0,1);
						this.arrY.splice(0,1);
					}
				}
				else if(this.x > this.arrX[0]){
					this.x -= this.speed;
					if(this.x == this.arrX[0] && this.y == this.arrY[0]){
						this.arrX.splice(0,1);
						this.arrY.splice(0,1);
					}
					else if(this.x - this.arrX[0] < 2.5){
						this.x = this.arrX[0];
						this.arrX.splice(0,1);
						this.arrY.splice(0,1);
					}
				}
				
				if(this.y < this.arrY[0]){
					this.y += this.speed;
					if(this.x == this.arrX[0] && this.y == this.arrY[0]){
						this.arrX.splice(0,1);
						this.arrY.splice(0,1);
					}
					else if(this.arrY[0] - this.y < 2.5){
						this.y = this.arrY[0];
						this.arrX.splice(0,1);
						this.arrY.splice(0,1);
					}
				}
				else if(this.y > this.arrY[0]){
					this.y -= this.speed;
					if(this.x == this.arrX[0] && this.y == this.arrY[0]){
						this.arrX.splice(0,1);
						this.arrY.splice(0,1);
					}
					else if(this.y - this.arrY[0] < 2.5){
						this.y = this.arrY[0];
						this.arrX.splice(0,1);
						this.arrY.splice(0,1);
					}
				}
			},
			attackHome:function(i){	//if the monkey travels all the way to home base, the castle gets damaged and the monkey dies through splice
				if(this.arrX.length == 0 && this.arrY.length == 0){
					enemies.splice(i, 1);
					if(level < 8) castleHP -= 5;
					else castleHP -= 8;
				}
			},
			death:function(i){		//if the health of an enemy reaches 0, it dies and you get gold
				if(this.hp <= 0){
					enemies.splice(i, 1);
					gold += 5;
					kills += 1;
				}
			}
		}
	}
	
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	//function to create an archer tower
	function makeArcher(mx, my){
		gold -= 85;			//costs money each time
		return{
			x:mx,
			y:my,					//frequency is very important as it determines how fast each attack is
			frequency:0,			//67 means that every 15x67=1005ms, the archer will attack
			drawArcher:function(){	//draws archer in battlefield
				ctx.drawImage(archer, this.x, this.y);
			},
			archerAttack:function(j, found){		//attack function
				if(round == true) ctx.fillRect(this.x, this.y + 40, (this.frequency/67) * 50, 5);
				if(this.frequency == 67){			//no attack occurs until frequency = 67
					while(found == false && j < enemies.length){
						if(Math.sqrt(Math.pow(this.x - (enemies[j].x - 15), 2) + Math.pow(this.y - (enemies[j].y - 15), 2)) < 100){
							enemies[j].hp -= 75;
							found = true;
						}									//the archer attacks only one enemy at a time hence the while loop
						j++									//tower searches for an enemy until it finds one, if multiple enemies are within
					}										//its radius, the first one in line is attacked
					this.frequency = 0;						//to find whether an enemy is within its 100px attacking radius, distance formula is used
				}
				else this.frequency += 1;			//frequency decreases by 1 every 15ms
			}
		}
	}
	
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	//constructor function to create freeze tower
	function makeFreezer(mx, my){
		gold -= 70;			//costs money
		return{
			x:mx,
			y:my,
			frequency:0,	//attack occurs every 1005ms
			drawFreezer:function(){	//draws tower
				ctx.drawImage(freezer, this.x, this.y);
			},
			freezerAttack:function(found, tNum){	//attack function
				if(round == true) ctx.fillRect(this.x, this.y + 40, (this.frequency/34) * 50, 5);
				if(this.frequency == 34){
					for(var i = 0; i < enemies.length; i++){
						if(Math.sqrt(Math.pow(this.x - (enemies[i].x - 15), 2) + Math.pow(this.y - (enemies[i].y - 15), 2)) < 75){
							enemies[i].hp -= 15;
							if(enemies[i].slowed == false){			//freeze tower slows and does small damage to any enemy within its 100px attack radius
								enemies[i].speed /= 1.5;			//distance formula used to determine if any enemy is within the radius
								enemies[i].slowed = true;			//the freeze tower's index value is recorded to each enemy with freezerHit
								enemies[i].freezerHit = tNum;
							}
						}
					}
					this.frequency = 0;
				}
				else this.frequency += 1;
			},
			unfreeze:function(tNum){				//if an enemy is outside the freeze radius of the freeze tower it was last attack from (tNum/freezerHit)
				for(var i = 0; i < enemies.length; i++){	//the enemy speeds back up to normal speed
					if(Math.sqrt(Math.pow(this.x - (enemies[i].x - 15), 2) + Math.pow(this.y - (enemies[i].y - 15), 2)) > 100 && enemies[i].slowed == true && enemies[i].freezerHit == tNum){
						enemies[i].speed *= 1.5;
						enemies[i].slowed = false;
						enemies[i].freezerHit = -1;
					}
				}
			}
		}
	}
	
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	//constructor function to create cannon towers
	function makeCannon(mx, my){
		gold -= 175;				//costs money
		return{
			x:mx,
			y:my,
			frequency:0,			//attacks every 2505ms
			expFrequency:5,			//explosion graphic appears for 75ms
			expX:-1,				//at these coordinates which get updated when attack occurs
			expY:-1,
			drawCannon:function(){	//to draw cannon in battlefield
				ctx.drawImage(cannon, this.x, this.y);
			},
			cannonAttack:function(j, found){	//attack function
				if(round == true) ctx.fillRect(this.x, this.y + 40, (this.frequency/167) * 50, 5);
				if(this.frequency == 167){		//same idea as other towers
					while(found == false && j < enemies.length){
						if(Math.sqrt(Math.pow(this.x - (enemies[j].x - 15), 2) + Math.pow(this.y - (enemies[j].y - 15), 2)) < 150){
							found = true;
							this.expX = enemies[j].x;
							this.expY = enemies[j].y;
							for(var i = 0; i < enemies.length; i++){
								if(Math.sqrt(Math.pow(this.expX - (enemies[i].x - 15), 2) + Math.pow(this.expY - (enemies[i].y - 15), 2)) < 200){
									enemies[i].hp -= 25;
								}							//cannon towers attack one enemy at a time which is why while loop is used
							}								//once an enemy is found, that enemy is dealt with heavy damage
							enemies[j].hp -= 200;			//BUT there is also splash damage which is why the for loop is used				
						}									//any other enemy within a 200px radius of explosion also gets some damage
						j++
					}
					this.frequency = 0;
				}
				else this.frequency += 1;
				if(this.expX != -1 && this.expY != -1 && this.expFrequency > 0){		//once attack occurs, expX and expY update to enemy that is attacked
					ctx.drawImage(explosion, this.expX - 120, this.expY-120);			//explosion graphic is drawn at those coordinates for 75ms
					this.expFrequency -= 1;
				}
				else{																	//expX and expY reset after 75ms
					this.expFrequency = 5;
					this.expX = -1;
					this.expY = -1;
				}
			}
		}
	}
	
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	//constructor function to create tack towers
	function makeTackShooter(mx, my){
		gold -= 125;
		return{
			x:mx,
			y:my,
			frequency:0,
			drawTack:function(){
				ctx.drawImage(tack, this.x, this.y);
			},
			tackAttack:function(){
				if(round == true) ctx.fillRect(this.x, this.y + 40, (this.frequency/34) * 50, 5);
				if(this.frequency == 34){
					for(var i = 0; i < enemies.length; i++){
						if(Math.sqrt(Math.pow(this.x - (enemies[i].x - 15), 2) + Math.pow(this.y - (enemies[i].y - 15), 2)) < 75){
							enemies[i].hp -= 20;
						}
					}
					this.frequency = 0;
				}
				else this.frequency += 1;
			}
		}
	}
	
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	//constructor function to create a bomb
	function makeBomb(mx, my){
		gold -= 30;		//costs money
		return{
			x:mx,
			y:my,
			drawBomb:function(){		//draws bomb on battlefield
				ctx.drawImage(bomb, this.x, this.y);
			},
			explode:function(n){		//explosion hurts enemies
				for(var i = 0; i < enemies.length; i++){
					if(Math.sqrt(Math.pow(this.x - (enemies[i].x - 15), 2) + Math.pow(this.y - (enemies[i].y - 15), 2)) < 50){
						ctx.drawImage(explosion, this.x-120, this.y-120);
						enemies.splice(i, 1);
						kills += 1;
						gold += 5;
						for(var j = 0; j < enemies.length; j++){
							if(Math.sqrt(Math.pow(this.x - (enemies[j].x - 15), 2) + Math.pow(this.y - (enemies[j].y - 15), 2)) < 200){
								enemies[j].hp -= 75;
							}								//any enemy that enters the bomb's 50px radius dies instantly
						}									//plus any enemy within the 200px radius of the explosion also gets damaged
					bombs.splice(n, 1);						//one time use, once bomb explodes, its gone
					}
				}
			}
		}		
	}
	
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//------------------------------------------------------------------SPAWN FUNCTION-----------------------------------------------------------------
	
	function spawner(){
		if(enemyNum > 0){
			if(level < 7){				//spawns enemies through makeEnemy function
				enemies.push(makeEnemy(1.25, Math.pow(1.05, level) * 90));
				enemyNum -= 1;												//enemies speed and health increases every round
			}																//level 0-7 speed is 1.25px per 15ms
			else if(level >= 7 && level <= 15){								//8-15 1.75px per 15ms
				enemies.push(makeEnemy(1.75, Math.pow(1.15, level) * 50));	//15+ 2.5px per 15ms
				enemyNum -= 1;												//health increases each round
			}
			else if(level > 15){
				enemies.push(makeEnemy(2.5, Math.pow(1.2, level) * 15));
				enemyNum -= 1;
			}
			
			
		}
		else if(round == true && enemies.length == 0){						//once there are no more enemies, round ends
			level += 1;
			round = false;
		}
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//----------------------------------------------------------------PAINT FUNCTION-------------------------------------------------------------

	function paint(){
		if(menu == true){						//menu screen displayed when menu = true
			ctx.drawImage(menuBack, 0, 0);
			if(mx > 1000 && mx < 1190 && my > 50 && my < 100) buttons[0].drawButton(25, 35, 0.75);
			else buttons[0].drawButton(25, 35, 0.5);
		}
		
		else if(game == true){					//game screen displayed when game = true
			ctx.fillStyle = 'gold';
			ctx.fillRect(1000, 0, 245, 700);
			ctx.fillStyle = 'black';
			ctx.drawImage(gameBack, 0, 0);
			ctx.fillRect(1015, 15, 215, 670);
			
			if(round == true){								//once round = true, enemies start spawning, moving and attacking
				for(var i = 0; i < enemies.length; i++){
					enemies[i].drawEnemy();
					enemies[i].move();
					enemies[i].attackHome(i);
					enemies[i].death(i);
				}
			}
			
			if(round == false){			//whenever the round ends, "Start Round" button appears
				if(mx > 15 && mx < 165 && my > 470 && my < 510) buttons[1].drawButton(10, 25, 0.75);
				else buttons[1].drawButton(10, 25, 0.5);
			}
			
			ctx.drawImage(castle2, 80, 580);					//everything in the right hand side tower shop/info bar is drawn
			ctx.fillStyle = 'red';
			ctx.fillRect(90, 565, 100, 10);
			ctx.fillStyle = 'green';							//such as gold, enemies remaining and castle health
			ctx.fillRect(90, 565, castleHP, 10);
			ctx.fillStyle = 'red';
			ctx.font = '18pt Impact';
			ctx.drawImage(castle1, 1060, 25);
			ctx.fillText(castleHP, 1140, 50);
			ctx.drawImage(enemy, 1060, 70);
			ctx.fillText(enemies.length, 1140, 95);
			ctx.drawImage(coins, 1065, 115);
			ctx.fillText(gold, 1140, 140);
			
			ctx.fillText('Towers/Weapons', 1035, 190);			//all turrets and their costs are displayed as well
			ctx.drawImage(archer, 1050, 205);
			ctx.drawImage(freezer, 1050, 275);
			ctx.drawImage(cannon, 1050, 345);
			ctx.drawImage(tack, 1050, 415);
			ctx.drawImage(bomb, 1055, 485);
			ctx.drawImage(nuke, 1050, 555);
			for(var i = 0; i < 6; i++){
				ctx.drawImage(coin, 1130, 220 + (i * 70));
			}
			ctx.fillText('85', 1155, 240);
			ctx.fillText('70', 1155, 310);
			ctx.fillText('175', 1155, 380);
			ctx.fillText('125', 1155, 450);
			ctx.fillText('30', 1155, 520);
			ctx.fillText('300', 1155, 590)
			if(mx > 1050 && mx < 1200 && my > 620 && my < 660) buttons[2].drawButton(15, 30, 0.75);
			else buttons[2].drawButton(15, 30, 0.5);
			
			if(archerDrag == true){
				ctx.drawImage(archer, mx-25, my-25);	//whenever a turret is clicked down on, it is drawn wherever the mouse is
				ctx.globalAlpha = 0.2;
				ctx.drawImage(radius100, mx-100, my-100);
			}
			else if(freezerDrag == true){
				ctx.drawImage(freezer, mx-25, my-25);	//so that it creates a drag and drop effect
				ctx.globalAlpha = 0.2;
				ctx.drawImage(radius75, mx-75, my-75);
			}
			else if(bombDrag == true){
				ctx.drawImage(bomb, mx-24, my-24);
				ctx.globalAlpha = 0.2;
				ctx.drawImage(radius50, mx-50, my-50);
			}
			else if(cannonDrag == true){
				ctx.drawImage(cannon, mx-25, my-25);
				ctx.globalAlpha = 0.2;
				ctx.drawImage(radius150, mx-150, my-150);
			}
			else if(tackDrag == true){
				ctx.drawImage(tack, mx-25, my-25);
				ctx.globalAlpha = 0.2;
				ctx.drawImage(radius75, mx-75, my-75);
			}
			ctx.globalAlpha = 1;
			
			for(var i = 0; i < archers.length; i++){	//all functions for archer towers are run
				archers[i].drawArcher();
				archers[i].archerAttack(0, false);
			}
			
			for(var i = 0; i < freezers.length; i++){	//all functions for freeze towers are run
				freezers[i].drawFreezer();
				freezers[i].freezerAttack(false, i);
				freezers[i].unfreeze(i);
			}
			
			for(var i = 0; i < cannons.length; i++){	//all functions for cannon towers are run
				cannons[i].drawCannon();
				cannons[i].cannonAttack(0, false);
			}
			
			for(var i = 0; i < tacks.length; i++){	//all functions for tack towers are run
				tacks[i].drawTack();
				tacks[i].tackAttack();
			}
			
			for(var i = 0; i < bombs.length; i++){		//all functions for bombs are run
				bombs[i].drawBomb();
				bombs[i].explode(i);
			}
			if(nukeEm == true){
				if(nukeFrequency == 20){
					gold += 5 * enemies.length;
					enemies.splice(0, enemies.length);
				}
				else if(nukeFrequency < 20){
					ctx.globalAlpha = ((nukeFrequency/100) * 5);
					ctx.drawImage(nukeExplosion, 0, 0);
				}
				if(nukeFrequency == 0){
					nukeEm = false;
					nukeFrequency = 220;
					nukeCountdown = 3.3;
				}
				if(nukeCountdown > 0){
					ctx.drawImage(nuke, 900, 10);
					nukeCountdown -= 0.015;
					ctx.fillText(Math.ceil(nukeCountdown - 0.015), 950, 20);
					nukeFrequency -= 1;
				}
			}
			ctx.globalAlpha = 1;
			if(castleHP <= 0){
				game = false;
				gameOver = true;
			}
		}
		else if(gameOver == true){
			ctx.fillStyle = 'black';
			ctx.fillRect(0, 0, 1245, 700);
			ctx.font = '60pt Impact';
			ctx.fillStyle = 'red';
			ctx.fillText('GAME OVER!', 450, 100);
			ctx.font = '24pt Arial';
			ctx.fillText('Gold', 425, 200);
			ctx.fillText('Kills', 425, 230);
			ctx.fillText('Archer Towers', 425, 260);
			ctx.fillText('Freeze Towers', 425, 290);
			ctx.fillText('Cannon Towers', 425, 320);
			ctx.fillText('Tack Shooters', 425, 350);
			ctx.fillText('Castle HP', 425, 380);
			ctx.fillText(gold, 775, 200);
			ctx.fillText(kills + ' X 10', 775, 230);
			ctx.fillText(archers.length + ' X 85', 775, 260);
			ctx.fillText(freezers.length + ' X 70', 775, 290);
			ctx.fillText(cannons.length + ' X 175', 775, 320);
			ctx.fillText(tacks.length + ' X 125', 775, 350);
			ctx.fillText(castleHP + ' X 5', 775, 380);
			ctx.beginPath();
			ctx.moveTo(415,390);
			ctx.lineTo(890,390);
			ctx.lineWidth = 3;
			ctx.strokeStyle = 'red';
			ctx.stroke();
			ctx.fillText('Score', 425, 425);
			ctx.fillText((kills*10) + (archers.length*85) + (freezers.length*70) + (cannons.length*175) + (tacks.length*125) + (castleHP*5) + gold, 775, 425);
			if(mx > 500 && mx < 745 && my > 520 && my < 600) buttons[3].drawButton(45, 55, 0.75);
			else buttons[3].drawButton(45, 55, 0.5);
		}
	}
	
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//---------------------------------------------------------------MOUSE LISTENER-------------------------------------------------------------------
	
	
	canvas.addEventListener('click', function (evt){				//MOUSE CLICK
		if(menu == true){											//if the 'play game' button is clicked in the main menu, menu = false, game = true
			if(mx > 1000 && mx < 1190 && my > 50 && my < 100){		//game screen is then displayed
				menu = false;
				game = true;
			}
		}
		if(game == true){											//when the round ends, 'start round' button appears and can be clicked to start next round
			if(mx > 15 && mx < 165 && my > 470 && my < 510 && round == false){
				round = true;										//enemyNum updates according to level
				enemyNum = level * 2;
			}
			if(mx > 1050 && mx < 1100 && my > 555 && my < 605 && round == true && gold >= 300){	//if nuke is clicked, nukeEm = true, nuke counts down
				gold -= 300;
				nukeEm = true;
			}
		}
		if(mx > 1050 && mx < 1200 && my > 620 && my < 660 && game == true){			//'end game' button ends game, brings you to game over screen
			game = false;
			gameOver = true;
		}
		if(mx > 500 && mx < 745 && my > 520 && my < 600 && gameOver == true){		//'restart' button in game over screen resets whole game
			gameOver = false;
			menu = true;
			reset();
		}
		
	}, false);
	
	canvas.addEventListener('mousedown', function (evt){	//MOUSE DOWN
		if(mx > 1050 && mx < 1100 && my > 205 && my < 255){			//whenever a tower is is clicked down on, a drag effect occurs
			archerDrag = true;
		}
		if(mx > 1050 && mx < 1100 && my > 275 && my < 325){
			freezerDrag = true;
		}
		if(mx > 1050 && mx < 1100 && my > 345 && my < 395){
			cannonDrag = true;
		}
		if(mx > 1050 && mx < 1100 && my > 415 && my < 465){
			tackDrag = true;
		}
		if(mx > 1050 && mx < 1098 && my > 485 && my < 533){
			bombDrag = true;
		}
	}, false);

	canvas.addEventListener('mouseup', function (evt){	//MOUSE UP
		if(archerDrag == true && my < 700 && my > 0 && mx < 1000 && mx > 0 && gold >= 85){		//when the mouse is released in the battlefield
			archers.push(makeArcher(mx-25, my-25));												//the tower that is dragged is bought and created at
			archerDrag = false;																	//the mouse coordinates it was released at
		}
		if(freezerDrag == true && my < 700 && my > 0 && mx < 1000 && mx > 0 && gold >= 70){
			freezers.push(makeFreezer(mx-25, my-25));
			freezerDrag = false;
		}
		if(cannonDrag == true && my < 700 && my > 0 && mx < 1000 && mx > 0 && gold >= 175){
			cannons.push(makeCannon(mx-25, my-25));
			cannonDrag = false;
		}
		if(tackDrag == true && my < 700 && my > 0 && mx < 1000 && mx > 0 && gold >= 125){
			tacks.push(makeTackShooter(mx-25, my-25));
			tackDrag = false;
		}
		if(bombDrag == true && my < 700 && my > 0 && mx < 1000 && mx > 0 && gold >= 30){
			bombs.push(makeBomb(mx-24, my-24));
			bombDrag = false;
		}
		
		archerDrag = false;							//drag effects stop after mouse up
		freezerDrag = false;
		cannonDrag = false;
		tackDrag = false;
		bombDrag = false;
		
	}, false);
	
	
	//----------------------------------------------------------------------| E N D |-------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------------------------------------------------------------
	//----------------------------------------------------------------------EXTRA CODE------------------------------------------------------------------
	
	
	canvas.addEventListener ('mouseout', function(){pause = true;}, false);
	canvas.addEventListener ('mouseover', function(){pause = false;}, false);

      	canvas.addEventListener('mousemove', function(evt) {
        	var mousePos = getMousePos(canvas, evt);

		mx = mousePos.x;
		my = mousePos.y;

      	}, false);


	function getMousePos(canvas, evt) {
	        var rect = canvas.getBoundingClientRect();
        	return {
          		x: evt.clientX - rect.left,
          		y: evt.clientY - rect.top
        		};
      	}
      

	///////////////////////////////////
	//////////////////////////////////
	////////	KEY BOARD INPUT
	////////////////////////////////


	

	window.addEventListener('keydown', function(evt){
		var key = evt.keyCode;
		
	//p 80
	//r 82
	//1 49
	//2 50
	//3 51
		
	}, false);




})
