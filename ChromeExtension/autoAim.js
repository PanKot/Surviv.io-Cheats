window.autoAim = function(obfuscate, game, variables) {

	var bullets = variables.bullets;
	var items = variables.items;
	var playerBarn = variables.playerBarn;
	var binded = false;
	var state = null;
	var options = {};
	var targetTexture = window.PIXI.Texture.fromImage("img/gui/ping-team-coming.svg");
	var reloadingTexture = window.PIXI.Texture.fromImage("https://cdn.rawgit.com/Najlepszy56/Surviv.io-Cheats/master/ChromeExtension/images/reload.svg");
	var healingTexture = window.PIXI.Texture.fromImage("https://cdn.rawgit.com/Najlepszy56/Surviv.io-Cheats/master/ChromeExtension/images/heal.svg");

	if(!!!bullets || !!!items || !!!playerBarn) {
		console.log("Cannot init autoaim");
		return;
	}

	var pressButton = function(keyCode) {
		var keys = game.scope[obfuscate.input.main][obfuscate.input.input].keys;

		if(!keys[keyCode]) {
			setTimeout(function() {
				keys[keyCode] = true;
				setTimeout(function() {
					delete keys[keyCode]
				}, 50);
			}, 0);
		}
	}

	var calculateRadianAngle = function(cx, cy, ex, ey) {
		var dy = ey - cy;
		var dx = ex - cx;
		var theta = Math.atan2(dy, dx); // range (-PI, PI]
		// theta *= 180 / Math.PI; // rads to degs, range (-180, 180]
		// if (theta < 0) theta = 360 + theta; // range [0, 360)
		return theta;
	}

	var calculateDistance = function(cx, cy, ex, ey) {
		return Math.sqrt(Math.pow((cx - ex), 2) + Math.pow((cy - ey), 2));
	}

	var getSelfPos = function() {
		return game.scope[obfuscate.activePlayer.main].pos;
	}

	var getMouseScreenPos = function() {
		return game.scope[obfuscate.input.main][obfuscate.input.input].mousePos;
	}

	var getMousePointPos = function() {
		return game.scope[obfuscate.camera].screenToPoint(getMouseScreenPos());
	}

	var canSeeEnemy = function(playerObj, enemyObj) {
		var status = true;
		if(!options.detectOnDifferentLevels &&
			playerObj.layer != enemyObj.layer)status = false;

		return status;
	}

	var playerIsActive = function(playerObj) {
		if(playerObj.N.dead || 
			playerObj.N.downed) {
			return false;
		}
		return true;
	}

	var isTeammate = function(selfId, selfTeamId, enemy, enemyId) {
		return enemy.teamId == selfTeamId || enemyId == selfId;
	}

	var detectEnemies = function() {
		var result = [];
		if(!game.scope[obfuscate.playerBarn.main][obfuscate.playerBarn.players][game.scope[obfuscate.activeId]]) return result;

		var selfId = game.scope[obfuscate.activeId];
		var selfTeamId = game.scope[obfuscate.playerBarn.main][obfuscate.playerBarn.players][selfId].teamId;
		var playerIds = Object.keys(game.scope[obfuscate.playerBarn.main][obfuscate.playerBarn.players]);
		var activePlayer = game.scope[obfuscate.activePlayer.main];

		for(var i = 0; i < playerIds.length; i++) {
			var enemyObj = game.scope[obfuscate.objectCreator].idToObj[playerIds[i]];
			var enemy = game.scope[obfuscate.playerBarn.main][obfuscate.playerBarn.players][playerIds[i]];

			if( enemyObj && 
				playerIsActive(enemyObj) &&
				!isTeammate(selfId, selfTeamId, enemy, playerIds[i]) &&
				canSeeEnemy(activePlayer, enemyObj)) {
				options.showEnemiesActions && showPlayerAction(enemyObj);
				result[playerIds[i]] = enemyObj;
			}
		}

		return result;
	}

	var getMinimalDistanceIndex = function(enemyDistances) {
		return enemyDistances.indexOf(Math.min.apply(null, enemyDistances));
	}

	var calculateTargetMousePosition = function(enemyPos, enemyPosTimestamp, prevEnemyPos, prevEnemyPosTimestamp, distance) {
		var bulletSpeed = 0;
		var bulletApproachTime = Infinity;
		
		if(game.scope[obfuscate.activePlayer.main].weapType &&
			items[game.scope[obfuscate.activePlayer.main].weapType].bulletType) {
			bulletSpeed = bullets[items[game.scope[obfuscate.activePlayer.main].weapType].bulletType].speed * options.forwardFiringCoeff;
		} else {
			bulletSpeed = 1000;
		};

		var selfPos = getSelfPos();

		var predictionEnemyPos = {
			x: enemyPos.x,
			y: enemyPos.y
		}
		var predictionEnemyDistance = calculateDistance(selfPos.x, selfPos.y, enemyPos.x, enemyPos.y);
		
		var enemySpeed = {
			x: (enemyPos.x - prevEnemyPos.x)/((enemyPosTimestamp - prevEnemyPosTimestamp + 1)/1000.0),
			y: (enemyPos.y - prevEnemyPos.y)/((enemyPosTimestamp - prevEnemyPosTimestamp + 1)/1000.0)
		}

		for(var i = 0; i < 10; i++) {
			bulletApproachTime = predictionEnemyDistance/bulletSpeed;
			predictionEnemyPos = {
				x: enemyPos.x + enemySpeed.x * bulletApproachTime,
				y: enemyPos.y + enemySpeed.y * bulletApproachTime
			};
			predictionEnemyDistance = calculateDistance(selfPos.x, selfPos.y, predictionEnemyPos.x, predictionEnemyPos.y);
		}

		var halfScreenWidth = game.scope[obfuscate.camera].screenWidth/2;
		var halfScreenHeight = game.scope[obfuscate.camera].screenHeight/2;

		var minScreenCircleRadius = halfScreenHeight > halfScreenWidth ? halfScreenWidth : halfScreenHeight;
		minScreenCircleRadius = Math.floor(minScreenCircleRadius - 1);		

		// todo: remove angles
		var predictionRadianAngle = calculateRadianAngle(selfPos.x, selfPos.y, predictionEnemyPos.x, predictionEnemyPos.y);

		return {
			x: halfScreenWidth + minScreenCircleRadius * Math.cos(predictionRadianAngle),
			y: halfScreenHeight - minScreenCircleRadius * Math.sin(predictionRadianAngle),
		}		
	}

	var getNewState = function() {
		var state = [];
		for(var i = 0; i < options.smoothLevel; i++) {
			state.push({
				distance: null,
				radianAngle: null,
				pos: getMouseScreenPos(),
				targetMousePosition: getMouseScreenPos(),
				timestamp: 0
			});
		}
		state.new = null;
		state.player = {
			nameText: {
				visible: false,
				style: {
					fontSize: 22,
					fill: "#00FFFF"
				}
			}
		};
		state.averageTargetMousePosition = null;
		state.mouseRelPointPos = {
			x: 0,
			y: 0
		}
		return state;
	}

	var showTargetEnemyNick = function() {
		state.player.nameText.visible = true;
		state.player.nameText.style.fontSize = 100;
		state.player.nameText.style.fill = "#D50000";
	}

	var hideTargetEnemyNick = function() {
		state.player.nameText.visible = false;
		state.player.nameText.style.fontSize = 22;
		state.player.nameText.style.fill = "#00FFFF";
	}

	var stateNewTriggered = function(newStateNew) {
		if(!newStateNew) {
			options.targetEnemyNicknameVisibility && hideTargetEnemyNick();
		}
	}

	var lastTargetIndicator = null;

	var resetTargetIndicator = function(targetIndicator=false) {
		if(lastTargetIndicator != null &&
			lastTargetIndicator != targetIndicator) {
			lastTargetIndicator.visible = false;
		}

		if(lastTargetIndicator != false) {
			lastTargetIndicator = targetIndicator;
		} else {
			lastTargetIndicator = null;
		}
	}

	var updateTargetIndicator = function() {
		var player = state.player;
		var pos = player[obfuscate.activePlayer.netData].dir;

		if(!player || !player[obfuscate.activePlayer.netData].dir)
			return;

		var targetIndicator = player.targetIndicator;

		if(!targetIndicator)
		{
			targetIndicator = window.PIXI.Sprite.from(targetTexture);
			targetIndicator.visible = false;
			targetIndicator.scale.set(0.6, 0.6)
			targetIndicator.tint = 16711680;
			targetIndicator.alpha = 0.5;
			player.container.addChild(targetIndicator);
			player.targetIndicator = targetIndicator;
		}

		if(!targetIndicator)
			return;

		var p = {
			x: targetIndicator.width * -0.5 + pos.x,
			y: targetIndicator.height * -0.5 + pos.y
		}

		targetIndicator.position.set(p.x, p.y);

		targetIndicator.visible = true;

		resetTargetIndicator(targetIndicator);
	}

	var updateState = function(detectedEnemies) {
		var selfPos = getSelfPos();
		var mousePos = {
			x: selfPos.x + state.mouseRelPointPos.x,
			y: selfPos.y + state.mouseRelPointPos.y
		};
		var enemySelfDistances = [];
		var enemyMouseDistances = [];
		var enemySelfRadianAngles = [];
		var enemyAngleDif = [];
		var enemyStatus = [];
		var detectedEnemiesKeys = Object.keys(detectedEnemies);

		if(!detectedEnemiesKeys.length) {
			if(state.new) {
				state.new = false;
				stateNewTriggered(false);
			}
			resetTargetIndicator();
			delEnemyInformation();
			return;
		} else {
			for(var i = 0; i < detectedEnemiesKeys.length; i++) {
				var enemyPos = detectedEnemies[detectedEnemiesKeys[i]].N.pos;

				var selfDistance = calculateDistance(selfPos.x, selfPos.y, enemyPos.x, enemyPos.y);
				var mouseDistance = calculateDistance(mousePos.x, mousePos.y, enemyPos.x, enemyPos.y);
				var selfRadianAngle = calculateRadianAngle(selfPos.x, selfPos.y, enemyPos.x, enemyPos.y);
				var angleDif = Math.abs(selfRadianAngle - calculateRadianAngle(selfPos.x, selfPos.y, mousePos.x, mousePos.y));

				enemySelfDistances.push(selfDistance);
				enemyMouseDistances.push(mouseDistance);
				enemySelfRadianAngles.push(selfRadianAngle);
				enemyAngleDif.push(angleDif);
				enemyStatus.push(true);
			}

			var targetEnemyIndex = null;
			if(options.restirctions) {
				var minValueKey = null;

				enemyStatus = enemyStatus.map(function(enemy, key) {
					var status = enemyAngleDif[key] < options.restirctionAngle * Math.PI/180

					if(status) {
						if(minValueKey == null || enemyMouseDistances[minValueKey] > enemyMouseDistances[key]) {
							minValueKey = key;
						}
					}

					return status;
				});

				targetEnemyIndex = minValueKey;
			} else {
				targetEnemyIndex = getMinimalDistanceIndex(enemyMouseDistances);
			}

			if(targetEnemyIndex != null) {
				state.unshift({
					distance: enemySelfDistances[targetEnemyIndex],
					radianAngle: enemySelfRadianAngles[targetEnemyIndex],
					pos: detectedEnemies[detectedEnemiesKeys[targetEnemyIndex]].N.pos,
					timestamp: Date.now(),
				});
				state.pop();
				state[0].targetMousePosition = calculateTargetMousePosition(state[0].pos, state[0].timestamp, state[1].pos, state[1].timestamp, state.distance);
				state.averageTargetMousePosition = {
					x: 0,
					y: 0
				};

				for(var i = 0; i < state.length; i++) {
					state.averageTargetMousePosition.x += state[i].targetMousePosition.x;
					state.averageTargetMousePosition.y += state[i].targetMousePosition.y;
				}

				state.averageTargetMousePosition.x /= state.length;
				state.averageTargetMousePosition.y /= state.length;

				options.targetEnemyNicknameVisibility && hideTargetEnemyNick();

				state.player = detectedEnemies[detectedEnemiesKeys[targetEnemyIndex]];
				
				options.targetEnemyNicknameVisibility && showTargetEnemyNick();

				updateTargetIndicator();
				options.enemyExtendedInfo && updateEnemyExtendedInfo();
				
				state.new = true;
			} else {
				state.new = false;
				resetTargetIndicator();
			}
		}
	}

	var updateBasicContainer = function(name, curWeapon) {
		var enemyInfo = document.getElementById('ui-cheat-info');

		var nameElement = enemyInfo.getElementsByClassName('ui-cheat-team-member-name')[0];
		nameElement.innerHTML = name;
	}

	var getItemByName = function(name) {
		var _items = Object.keys(items)
 		for(let i of _items) {
 			let item = items[i];
			if(i === name) {
				return item;
			}
		}
		return null
	}

	var updateArmorContainer = function(netData) {
		var armorContainer = document.getElementById('ui-cheat-armor-container');

		let _items = ["helmet", "chest", "backpack", "curWeapType"];
		for(let itemName of _items) {
			var item = armorContainer.getElementsByClassName(itemName)[0];

			var counter = item.getElementsByClassName('ui-armor-counter-inner')[0];
			var level = item.getElementsByClassName('ui-armor-level')[0];
			var img = item.getElementsByTagName('img')[0];

			if(netData[itemName] != "") {
				var itemLevel = parseInt(netData[itemName].slice(-2), 10);

				/* Level */
				if(Number.isInteger(itemLevel) && itemName !== "curWeapType") {
					if(itemLevel == 3) {
						level.style.color = "rgb(255, 153, 0)";
					} else {
						level.style.color = "rgb(255, 255, 255)";
					}
					level.innerHTML = "P. " + itemLevel;
				} else {
					level.innerHTML = "";
				}

				/* Img */
				if(itemName === "backpack") {
					itemName = "pack";
				}
				if(itemName !== "curWeapType") {
					img.src = "img/loot/loot-" + itemName + "-0" + itemLevel + ".svg";
					img.style.display = "block";
				} else {
					var itemData = getItemByName(netData[itemName]);
					if(itemData) {
						var itemImg = itemData.lootImg.sprite.replace('.img', '.svg');
						img.src = "img/loot/" + itemImg;
						img.style.display = "block";
					}
				}
			} else {
				img.style.display = "none";
			}
		}
	}

	var updateEnemyExtendedInfo = function() {
		var player = state.player;
		var netData = player[obfuscate.activePlayer.netData];

		createEnemyExtendedInfo();

		updateBasicContainer(player.nameText._text, player.N.curWeapType);
		updateArmorContainer(netData);
	}

	var createBasicContainer = function() {
		var basicInfo = document.createElement('div');
		basicInfo.className = "ui-basic-info";

		var name = document.createElement('div');
		name.className = "ui-team-member-name ui-cheat-team-member-name";

		basicInfo.appendChild(name);

		return basicInfo;
	}

	var createArmorContainer = function() {
		var armorContainer = document.createElement('div');
		armorContainer.id = "ui-cheat-armor-container";
		armorContainer.className = "ui-armor-container"

		let _items = ["helmet", "chest", "backpack", "curWeapType"];
		for(let itemName of _items) {
			var item = document.createElement('div');
			item.id = itemName;
			item.className = ("ui-armor-counter ui-cheat-armor-counter ui-outline-hover " + itemName);

			var counter = document.createElement('div');
			counter.className = "ui-armor-counter-inner";

			var level = document.createElement('div');
			level.className = "ui-armor-level";

			var img = document.createElement('img');
			img.className = "ui-armor-image ui-cheat-armor-image ui-loot-image";

			item.appendChild(counter);
			item.appendChild(level);
			item.appendChild(img);

			armorContainer.appendChild(item);
		}

		return armorContainer;
	}

	var createEnemyExtendedInfo = function() {
		var uiGame = document.getElementById('ui-game');

		if(!document.getElementById('ui-cheat-info')) {
			var enemyInfo = document.createElement('div');
			enemyInfo.id = "ui-cheat-info";
			enemyInfo.className = "ui-cheat-enemy-info ui-bg-standard";

			enemyInfo.appendChild(createBasicContainer());
			enemyInfo.appendChild(createArmorContainer());
			uiGame.appendChild(enemyInfo);
		}
	}

	var removeElement = function(elementId) {
		var element = document.getElementById(elementId);
		element.parentNode.removeChild(element);
	}

	var delEnemyInformation = function() {
		var e = document.getElementById('ui-cheat-info');
		if(e)removeElement('ui-cheat-info');
	}

	var showPlayerAction = function(player) {
		var pos = player[obfuscate.activePlayer.netData].dir;
		var curAction = player.curAction.type;

		if(!player || !player[obfuscate.activePlayer.netData].dir)
			return;

		var targetAction = player.targetAction;

		if(!targetAction)
		{
			targetAction = window.PIXI.Sprite.from(reloadingTexture);
			targetAction.visible = false;
			targetAction.scale.set(0.15, 0.15);
			targetAction.tint = 16711680;
			targetAction.alpha = 0.5;
			player.container.addChild(targetAction);
			player.targetAction = targetAction;
			targetAction.actionType = 1;
		}

		if(!targetAction)
			return;

		if(curAction === 1 && targetAction.actionType !== curAction) {
			targetAction.texture = reloadingTexture;
		} else if(curAction === 2 && targetAction.actionType !== curAction) {
			targetAction.texture = healingTexture;
		}
		targetAction.actionType = curAction;

		var p = {
			x: targetAction.width * -0.5 + pos.x,
			y: targetAction.width * -1.5 + pos.y
		}

		targetAction.position.set(p.x, p.y);

		targetAction.visible = (curAction === 1 || curAction === 2);
	}

	var aim = function(averageTargetMousePosition) {
		game.scope[obfuscate.input.main][obfuscate.input.input].mousePos = averageTargetMousePosition;
	}

	var defaultPlayerBarnRenderFunction = function(e) {};
	var playerBarnRenderContext = {};

	var defaultBOnMouseDown = function(event) {};
	var defaultBOnMouseMove = function(event) {};

	var mouseListener = {
		mousedown: function(event) {
			if(event.button === 2) {
				var activePlayer = game.scope[obfuscate.activePlayer.main];

				if(activePlayer.curWeapIdx) {
					pressButton("49");
					return;
				}
				
				if(!activePlayer.curWeapIdx) {
					pressButton("50");
					return;
				}
			}

			if(((event.button === 0) || (event.button === 2)) && state.new) {
				var input = game.scope[obfuscate.input.main][obfuscate.input.input];
				var button = event.button;

				input.mousePos = state.averageTargetMousePosition;
				// ???
				input.mouseButtonsOld[button] = false;
				input.mouseButtons[button] = true;
			} else {
				defaultBOnMouseDown(event);
			}
		},
		mousemove: function(event) {
			var selfPos = getSelfPos();
			var eventPointPos = game.scope[obfuscate.camera].screenToPoint({
				x: event.clientX,
				y: event.clientY
			});

			state.mouseRelPointPos = {
				x: eventPointPos.x - selfPos.x,
				y: eventPointPos.y - selfPos.y,
			};

			if(!state.new) {
				defaultBOnMouseMove(event);
			}
		}
	}

	var addMouseListener = function() {
		window.addEventListener("mousedown", mouseListener.mousedown);
		window.addEventListener("mousemove", mouseListener.mousemove);
	}

	var removeMouseListener = function() {
		window.removeEventListener("mousedown", mouseListener.mousedown);
		window.removeEventListener("mousemove", mouseListener.mousemove);
	}

	var spaceKeyListeners = {
		keydown: function(event) {
			var mouseButtons = game.scope[obfuscate.input.main][obfuscate.input.input].mouseButtons;
			var button = 0;

			if(event.which == 32) {
				mouseButtons[button] = true;
			}
		},
		keyup: function(event) {
			var mouseButtons = game.scope[obfuscate.input.main][obfuscate.input.input].mouseButtons;
			var button = 0;

			if(event.which == 32) {
				mouseButtons[button] = false;
			}
		}
	}

	var addSpaceKeyListener = function() {
		window.addEventListener("keydown", spaceKeyListeners.keydown);
		window.addEventListener("keyup", spaceKeyListeners.keyup);
	}

	var removeSpaceKeyListener = function() {
		window.removeEventListener("keydown", spaceKeyListeners.keydown);
		window.removeEventListener("keyup", spaceKeyListeners.keyup);
	}

	var fixEmotes = function() {
		var binds = game.scope[obfuscate.input.main].binds;
		var boundKeys = game.scope[obfuscate.input.main].boundKeys;

		if(binds[31] != null) {
			if(binds[31].code === 2 &&
				binds[31].type === 2) {
				binds[31].type = 1;
				binds[31].code = 66;
				boundKeys[66] = true;
			}
		}
	}

	var updateOptions = function(newOptions) {
		options.targetEnemyNicknameVisibility = newOptions.targetEnemyNicknameVisibility;
		options.forwardFiringCoeff = newOptions.forwardFiringCoeff;
		options.smoothLevel = newOptions.smoothLevel;
		options.restirctionAngle = newOptions.restirctionAngle;
		options.restirctions = newOptions.restirctions;
		options.detectOnDifferentLevels = newOptions.detectOnDifferentLevels;
		options.enemyExtendedInfo = newOptions.enemyExtendedInfo;
		options.showEnemiesActions = newOptions.showEnemiesActions;
	}

	var setTargetEnemyNicknameVisibility = function(status) {
		options.setTargetEnemyNicknameVisibility = status;
	}

	var setForwardFiringCoeff = function(coeff) {
		options.forwardFiringCoeff = coeff;
	}

	var setSmoothLevel = function(level) {
		options.smoothLevel = level;
	}

	var setRestirctionAngle = function(angle) {
		options.restirctionAngle = angle;
	}

	var setRestirctions = function(status) {
		options.restirctions = status;
	}

	var setDetectOnDifferentLevels = function(status) {
		options.detectOnDifferentLevels = status;
	}

	var setEnemyExtendedInfo = function(status) {
		options.enemyExtendedInfo = status;
	}

	var setShowEnemiesActions = function(status) {
		options.showEnemiesActions = status;
	}

	var bind = function(opt) {
		var input = game.scope[obfuscate.input.main][obfuscate.input.input];
		updateOptions(opt);

		state = getNewState();

		defaultBOnMouseDown = input.bOnMouseDown;
		defaultBOnMouseMove = input.bOnMouseMove;

		defaultPlayerBarnRenderFunction = playerBarn.prototype.render;
		playerBarn.prototype.render = function(e) {
			var playerBarnRenderContext = this;

			updateState(detectEnemies());

			if(state.new) {
				aim(state.averageTargetMousePosition);
			}

			defaultPlayerBarnRenderFunction.call(playerBarnRenderContext, e);
		};

		window.removeEventListener("mousedown", input.bOnMouseDown);
		window.removeEventListener("mousemove", input.bOnMouseMove);

		removeMouseListener();
		removeSpaceKeyListener();

		addMouseListener();
		addSpaceKeyListener();

		fixEmotes();

		binded = true;		
	}

	var unbind = function() {
		removeMouseListener();
		removeSpaceKeyListener();

		window.removeEventListener("mousedown", defaultBOnMouseDown);
		window.removeEventListener("mousemove", defaultBOnMouseMove);

		window.addEventListener("mousedown", defaultBOnMouseDown);
		window.addEventListener("mousemove", defaultBOnMouseMove);

		playerBarn.prototype.render = defaultPlayerBarnRenderFunction;

		resetTargetIndicator();
		delEnemyInformation();

		binded = false;
	}

	var isBinded = function() {
		return binded;
	}

	return {
		bind: bind,
		unbind: unbind,
		isBinded: isBinded,

		setTargetEnemyNicknameVisibility: setTargetEnemyNicknameVisibility,
		setForwardFiringCoeff: setForwardFiringCoeff,
		setSmoothLevel: setSmoothLevel,
		setRestirctionAngle: setRestirctionAngle,
		setRestirctions: setRestirctions,
		setDetectOnDifferentLevels: setDetectOnDifferentLevels,
		setEnemyExtendedInfo: setEnemyExtendedInfo,
		setShowEnemiesActions: setShowEnemiesActions
	}
}