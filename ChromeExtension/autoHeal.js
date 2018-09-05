window.autoHeal = function(obfuscate, game, variables) {

	var key = variables.key;
	var binded = false;
	var timer = null;

	var pressKey = function(key) {
		var keys = game.scope[obfuscate.input.main][obfuscate.input.input].keys;

		if(!keys[key]) {
			setTimeout(function() {
				keys[key] = true;
				setTimeout(function() {
					delete keys[key];
				}, 90);
			}, 0);
		}
	}

	var isNoEnemy = function() {
		var players = game.scope[obfuscate.playerBarn.main][obfuscate.playerBarn.players];
		var selfId  = game.scope[obfuscate.activeId];

		if(!players[selfId]) return false;

		var selfTeamId  = players[game.scope[obfuscate.activeId]].teamId;
		var playersId   = Object.keys(players);
		var playersData = game.scope[obfuscate.objectCreator].idToObj;

		for(var i = 0; i < playersId.length; i++) {
			var player = playersId[i];
			if( playersData[player] && 
				(!playersData[player][obfuscate.activePlayer.netData].dead) && 
				(!playersData[player][obfuscate.activePlayer.netData].downed) &&
				players[player].teamId != selfTeamId) {
				
				return false;
			}
		}

		return true;
	}

	var isNoMotion = function() {
		var keys = game.scope[obfuscate.input.main][obfuscate.input.input].keys;

		if(	keys[key.W] ||
			keys[key.D] ||
			keys[key.S] ||
			keys[key.A]) {

			return false;
		}

		return true;
	}
	
	var isNotReloading = function(){
		var pieTimer = game.scope[obfuscate.menu].pieTimer;
		if (pieTimer.clientData.label == "Reloading" && pieTimer.active){	
			return false;
		}
		return true;
	}

	var heal = function() {
		if(isNoEnemy() && isNoMotion() && isNotReloading()) {
			var activePlayerLocalData = game.scope[obfuscate.activePlayer.main][obfuscate.activePlayer.localData];

			if(activePlayerLocalData.health < 30) {
				if(activePlayerLocalData.inventory["healthkit"] > 0 ) {
					pressKey(key.Eight);
					return;
				}
			}

			if(activePlayerLocalData.health < 70 && activePlayerLocalData.boost < 40) {
				if(activePlayerLocalData.inventory["bandage"] > 0 ) {
					pressKey(key.Seven);
					return;
				}
			}

			if(activePlayerLocalData.boost < 50) {
				if(activePlayerLocalData.inventory["painkiller"] > 0 ) {
					pressKey(key.Zero);
					return;
				}
			}

			if(activePlayerLocalData.boost < 75) {
				if(activePlayerLocalData.inventory["soda"] > 0 ) {
					pressKey(key.Nine);
					return;
				}
			}
		}
	}

	var runHeal = function() {
		heal();
		timer = setTimeout(runHeal, 1000);
	}

	var stopHeal = function() {
		clearTimeout(timer);
		timer = null;
	}	

	var bind = function() {
		runHeal();
        binded = true;
	}

	var unbind = function() {
		stopHeal();
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
