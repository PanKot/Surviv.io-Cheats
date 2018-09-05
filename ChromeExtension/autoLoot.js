window.autoLoot = function(obfuscate, game, variables) {

	var lootBarn = variables.lootBarn;
	var bagSizes = variables.bagSizes;
	var items = variables.items;
	var uiModule = variables.uiModule;
	var binded = false;
	var options = {};
	var lastTimeDropItem = window.performance.now();

	if(!!!lootBarn || !!!bagSizes || !!!items || !!!uiModule) {
		console.log("Cannot init autoloot");
		return;
	}

	var pressKey = function(keyCode) {
		var keys = game.scope[obfuscate.input.main][obfuscate.input.input].keys;

		if(!keys[keyCode]) {
			setTimeout(function() {
				keys[keyCode] = true;
				setTimeout(function() {
					delete keys[keyCode]
				}, 90);
			}, 0);
		}
	}

	var getMillisecondsElapsed = function(time) {
		return (window.performance.now() - time);
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
				(!playersData[player].N.dead) && 
				(!playersData[player].N.downed) &&
				players[player].teamId != selfTeamId) {
				
				return false;
			}
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

	var getItemByTypes = function(name, types) {
		var _items = Object.keys(items)
 		for(let i of _items) {
 			let item = items[i];
 			for(let type of types) {
				if(item.type === type) {
					if(i === name) {
						return i
					}
				}
			}
		}
		return null
	}

	var getItemsByType = function(type) {
		var itemsList = [];

		var _items = Object.keys(items)
 		for(let i of _items) {
 			let item = items[i];
			if(item.type === type) {
				itemsList.push({name: items[i].name, key: i});
			}
		}

		return itemsList;
	}

	/*
		Ammo
		Heal
		Boost
		Throwable
	*/
	var isBasicItems = function(item, inventory, backpack) {
		let anyOfType = getItemByTypes(item.name, ['ammo', 'heal', 'boost', 'throwable']);
		if(anyOfType !== null) {
			var ownBagIndex = !!backpack ? parseInt(backpack.slice(-2), 10) : 0;
			var bagSize = bagSizes[item.name][ownBagIndex];

			if(inventory[item.name] !== bagSize) {
				pressKey("70");
			}
			return true;
		}
		return false;
	}

	/*
		Scope
	*/
	var isScope = function(item, inventory) {
		if(/scope/.test(item.name)) {
			var scopeLevel = parseInt(item.name.slice(0, -6), 10);
			if(!inventory[item.name]) {
				pressKey("70");
			}
			return true;
		}
		return false;
	}

	/*
		Helmet
		Chest
		Backpack
	*/
	var isPlayerEq = function(item, backpack, netData) {
		if(	/helmet/.test(item.name) ||
			/chest/.test(item.name) ||
			/backpack/.test(item.name)) {

			var lootname = item.name.slice(0, -2);
			var lootLevel = parseInt(item.name.slice(-2), 10);

			if(!game.scope[obfuscate.activePlayer.main][obfuscate.activePlayer.netData][lootname]) {
				pressKey("70");
				return true;
			};

			var ownLootLevel = parseInt(netData[lootname].slice(-2), 10);
			if( ownLootLevel < lootLevel) {
				pressKey("70");
			}
			return true;
		}
		return false;
	}

	/*
		Gun
	*/
	var isGun = function(item, weapons) {
		let gun = getItemByTypes(item.name, ['gun']);
		/* Auto pick up */
		if(options.autoPickUp.allow) {
			if(options.autoPickUp.weapon1 === gun && weapons[0].name !== gun) {
				pressKey("49");
				pressKey("70");
				return true;
			}
			if(options.autoPickUp.weapon2 === gun && weapons[1].name !== gun) {
				pressKey("50");
				pressKey("70");
				return true;
			}
		}

		/* Default */
		if((weapons[0].name === "" ||
			weapons[1].name === "") &&
			gun !== null) {
			pressKey("70");
			return true;
		}
		return false;
	}

	/*
		Melee
	*/
	var isMelee = function(item, weapons) {
		let melee = getItemByTypes(item.name, ['melee']);
		/* Auto pick up */
		if(options.autoPickUp.allow) {
			if(options.autoPickUp.weapon3 === melee
				&& weapons[2].name !== melee) {
				pressKey("51");
				pressKey("70");
				return true;
			}
		}

		/* Default */
		if(weapons[2].name === "fists" &&
			melee !== null) {
			pressKey("70");
			return true;
		}
		return false;
	}

	/*
		Skin
	*/
	var isSkin = function(item, netData) {
		let skin = getItemByTypes(item.name, ['skin']);
		/* Auto pick up */
		if(options.autoPickUp.skin === skin
			&& netData.skin !== skin) {
			pressKey("70");
			return true;
		}

		/* Default */
		if(netData.skin === "outfitBase" &&
			options.autoPickUp.skin !== "outfitBase" &&
			skin !== netData.skin &&
			skin !== "outfitBase" &&
			skin !== null) {
			pressKey("70");
			return true;
		}
		return false;
	}

	var getDistance = function(p1, p2) {
		var dx = p2.x - p1.x, dy = p2.y - p1.y;
		return Math.sqrt( dx*dx + dy*dy );
	};

	var getLootRange = function(loot, netData) {
		return getDistance(loot.pos, netData.pos);
	}

	var isSafe = function(netData) {
		var itemsNearBy = game.scope[obfuscate.lootBarn.main][obfuscate.lootBarn.lootPool][obfuscate.lootBarn.pool].filter(function(l) {
			return l.active &&
				getLootRange(l, netData) < options.safeDistance;
		});

		return itemsNearBy.length > 0;
	}

	var pickupLoot = function() {
		var item        = game.scope[obfuscate.lootBarn.main][obfuscate.lootBarn.itemf]();
		var netData     = game.scope[obfuscate.activePlayer.main][obfuscate.activePlayer.netData];
		var localData   = game.scope[obfuscate.activePlayer.main][obfuscate.activePlayer.localData];

		if(item && item.active) {
			if(isSafe(netData) && getMillisecondsElapsed(lastTimeDropItem) > options.dropDelay) {
				if(isBasicItems(item, localData.inventory, netData.backpack))return;
				if(isScope(item, localData.inventory))return;
				if(isPlayerEq(item, netData.backpack, netData))return;

				options.autoPickUp.allow = isNoEnemy() && isNotReloading();

				if(isGun(item, localData.weapons))return;
				if(isMelee(item, localData.weapons))return;
				if(isSkin(item, netData))return;
			}
		}
	}

	var pushEvent = function(e) {
		if(e.action === "drop") {
			lastTimeDropItem = window.performance.now();
		}
	}

	var getItemsFromSlot = function(slotId) {
		let name;
		/* Weapons */
		if(slotId == 1 || slotId == 2)name = "gun";
		if(slotId == 3)name = "melee";
		/* Skins */
		if(slotId == 5)name = "skin";
		return getItemsByType(name).filter(function(item) {
			return item.key.toLowerCase() != "fists";
		});
	}

	var updateOptions = function(newOptions) {
		options.autoPickUp = newOptions.autoPickUp;
		options.safeDistance = newOptions.safeDistance;
		options.dropDelay = newOptions.dropDelay;
	}

	var setAutoPickUp = function(autoPickUpObj) {
		options.autoPickUp = autoPickUpObj;
	}

	var setSafeDistance = function(range) {
		options.safeDistance = range;
	}

	var setDropDelay = function(ms) {
		options.dropDelay = ms;
	}

	var defaultLootBarnUpdateFunction = function(e, t, a) {};
	var lootBarnUpdateContext = {};

	var defaultPushActionFunction = function(e) {};
	var pushActionContext = {};

	var bind = function(opt) {
		updateOptions(opt);

		defaultLootBarnUpdateFunction = lootBarn.prototype.l;
		lootBarn.prototype.l = function(e, t, a) {
			lootBarnUpdateContext = this;
			defaultLootBarnUpdateFunction.call(lootBarnUpdateContext, e, t, a);

			pickupLoot();
		}

		defaultPushActionFunction = uiModule.prototype.pushAction;
		uiModule.prototype.pushAction = function(e) {
			var pushActionContext = this;
			defaultPushActionFunction.call(pushActionContext, e);

			pushEvent(e);
		};

		binded = true;
	}

	var unbind = function() {
		lootBarn.prototype.l = defaultLootBarnUpdateFunction;
		uiModule.prototype.pushAction = defaultPushActionFunction;
		binded = false;
	}

	var isBinded = function() {
		return binded;
	}

	return {
		bind: bind,
		unbind: unbind,
		isBinded: isBinded,

		getItemsFromSlot: getItemsFromSlot,
		setAutoPickUp: setAutoPickUp,
		setSafeDistance: setSafeDistance,
		setDropDelay: setDropDelay
	}
}