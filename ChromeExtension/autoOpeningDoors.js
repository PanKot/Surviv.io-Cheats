window.autoOpeningDoors = function(obfuscate, game, emitActionCb, interactionEmitter) {

	var binded = false;

	var pressButton = function(keyCode) {
		var keys = game.scope[obfuscate.input.main][obfuscate.input.input].keys;

		if(!keys[keyCode]) {
			setTimeout(function() {
				keys[keyCode] = true;
				setTimeout(function() {
					delete keys[keyCode];
				}, 50);
			}, 50);
		}
	};

	var interactionTypes = {
		Obstacle: 2,
		Loot: 3
	};

	var bind = function() {
		emitActionCb.scope = function() {
			if(interactionEmitter.scope) {
				switch(interactionEmitter.scope.__type) {
					case interactionTypes.Obstacle:
						if( interactionEmitter.scope.hasOwnProperty('door') &&
							!interactionEmitter.scope.door.open) {
							pressButton("70");
						}
					break;
				}
			}
		};
		binded = true;
	};

	var unbind = function() {
		emitActionCb.scope = function() {};
		binded = false;
	};

	var isBinded = function() {
		return binded;
	}

	return {
		bind: bind,
		unbind: unbind,
		isBinded: isBinded
	}
}