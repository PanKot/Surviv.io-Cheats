window.linesToPlayers = function(obfuscate, game) {

	var binded = false;
	var EnemyLines = {
		draw: null,
		points: null
	};

	var detectEnemies = function() {
		var players = game.scope[obfuscate.playerBarn.main][obfuscate.playerBarn.players];
		var selfId = game.scope[obfuscate.activeId];

		var result = [];
		if(!players[selfId]) return result;

		var objects = game.scope[obfuscate.objectCreator].idToObj;
		var selfTeamId = players[selfId].teamId;
		var playerIds = Object.keys(players);

		for(var i = 0; i < playerIds.length; i++) {
			if( objects[playerIds[i]] && 
				(!objects[playerIds[i]][obfuscate.activePlayer.netData].dead) && 
				(!objects[playerIds[i]][obfuscate.activePlayer.netData].downed) &&
				players[playerIds[i]].teamId != selfTeamId) {
				
				if(playerIds[i] != selfId) {
					result[playerIds[i]] = objects[playerIds[i]];
				}
			}
		}

		return result;
	}

	var updatePoints = function(player) {
		var enemies = detectEnemies();
		var camera = game.scope[obfuscate.camera];

		EnemyLines.points = enemies.map((enemy) => {
			return {
				x: (enemy.pos.x - player.N.pos.x) * camera.ppu,
				y: (player.N.pos.y - enemy.pos.y) * camera.ppu
			};
		});
	}

	var updateLines = function(player) {
		if(!player || !player.container)
			return;

		var points = EnemyLines.points;
		var draw = EnemyLines.draw;
		
		if(!points && points.length>0)
			return;
	
		if(!draw)
		{
			draw = new window.PIXI.Graphics();
			
			EnemyLines.draw = draw;
			player.container.addChild(draw);
			player.container.setChildIndex(draw, 0);
		}
		
		if(!draw.graphicsData)
			return;
		
		draw.clear();
		
		draw.beginFill();
		draw.lineStyle(2, 0xFCB900);
		
		points.forEach(function(point) {
			draw.moveTo(0, 0);
			draw.lineTo(point.x, point.y);
		});
		
		draw.endFill();
	}

	var draw = function() {
		var player = game.scope[obfuscate.activePlayer.main];

		updatePoints(player);
		updateLines(player);

		if(binded) {
			setTimeout(draw);
		} else {
			resetLines();
		}
	}

	var resetLines = function() {
		if(EnemyLines.draw && game.scope.initialized) {
			EnemyLines.draw.clear();
		}
	}

	var bind = function() {
		binded = true;

		setTimeout(function() {
			EnemyLines.draw = null;
			resetLines();
			draw();
		});
	}

	var unbind = function() {
		binded = false;
	}

	var isBinded = function() {
		return binded;
	}

	return {
		bind: bind,
		unbind: unbind,
		isBinded: isBinded
	}
}
