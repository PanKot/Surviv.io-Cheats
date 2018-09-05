window.autoFire = function(obfuscate, game, variables) {

	var items = variables.items;
	var binded = false;
	var autoFire = false;
	var singleFireGuns = [];

	if(!!!items) {
		console.log("Cannot init autoFire");
		return;
	}

	var getWeaponsByType = function(type) {
		var weaponsList = [];
		var _items = Object.keys(items)

 		for(let i of _items) {
 			let item = items[i];
			if(item.type === type) {
				weaponsList.push(i);
			}
		}
		return weaponsList;
	}

	var getWeaponsByFireMode = function(fireMode) {
		var weaponsList = [];
		var _items = Object.keys(items)

 		for(let i of _items) {
 			let item = items[i];
			if(item.fireMode === fireMode) {
				weaponsList.push(i);
			}
		}
		return weaponsList;
	}

	var updateState = function() {
		var curPlayer = game.scope[obfuscate.activePlayer.main];
		var mouseButtons = game.scope[obfuscate.input.main][obfuscate.input.input].mouseButtons;

		if(mouseButtons[0] &&
			singleFireGuns.includes(curPlayer.weapType)) {
			autoFire = true;
		} else  {
			autoFire = false;
		}

		if(binded) {
			setTimeout(updateState);
		}
	}

	var defaultInputMousePressedBaseFunction = function(e) {};

	var bind = function() {
		var w1 = getWeaponsByFireMode("single");
		var w2 = getWeaponsByType("melee");
		singleFireGuns = w1.concat(w2, "fists");

		defaultInputMousePressedBaseFunction = game.scope[obfuscate.input.main][obfuscate.input.input][obfuscate.input.mousePressed];
		game.scope[obfuscate.input.main][obfuscate.input.input][obfuscate.input.mousePressed] = function(e) {
			if(autoFire)return true;

			return defaultInputMousePressedBaseFunction.call(game.scope[obfuscate.input.main][obfuscate.input.input], e);
		};

		setTimeout(function() {
			updateState();
		});

		binded = true;
	}

	var unbind = function() {
		binded = false;

		defaultInputMousePressedBaseFunction = function(e) {
            return !this.mouseButtonsOld[e] && !!this.mouseButtons[e]
        };
        game.scope[obfuscate.input.main][obfuscate.input.input][obfuscate.input.mousePressed] = defaultInputMousePressedBaseFunction;
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