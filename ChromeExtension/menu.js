window.menu = function(obfuscate, game, options, callbacks) {
	
	var binded = false;
	var menuOpened = false;
	var isMainScreen = false;
	var lastActiveContainer = null;
	var backToGameListener = false;
	var tabs = [
		{
			"name": "Modules",
		},
		{
			"name": "Config"
		}
	];
	var elements = [
		{
			"type": "checkbox",
			"description": "Auto aim enabled",
			"inputProps": {
				"value": "autoAim.enabled"
			},
			"callbacks": {
				"value": "autoAimEnableCb"
			},
			"tabId": 0
		},
		{
			"type": "checkbox",
			"description": "Auto loot enabled",
			"inputProps": {
				"value": "autoLoot.enabled"
			},
			"callbacks": {
				"value": "autoLootEnableCb"
			},
			"tabId": 0
		},
		{
			"type": "checkbox",
			"description": "Auto heal enabled",
			"inputProps": {
				"value": "autoHeal.enabled"
			},
			"callbacks": {
				"value": "autoHealEnableCb"
			},
			"tabId": 0
		},
		{
			"type": "checkbox",
			"description": "Auto opening doors enabled",
			"inputProps": {
				"value": "autoOpeningDoors.enabled"
			},
			"callbacks": {
				"value": "autoOpeningDoorsEnableCb"
			},
			"tabId": 0
		},
		{
			"type": "checkbox",
			"description": "Grenade timer enabled",
			"inputProps": {
				"value": "grenadeTimer.enabled"
			},
			"callbacks": {
				"value": "grenadeTimerEnableCb"
			},
			"tabId": 0
		},
		{
			"type": "checkbox",
			"description": "Laser pointer enabled",
			"inputProps": {
				"value": "laserPointer.enabled"
			},
			"callbacks": {
				"value": "laserPointerEnableCb"
			},
			"tabId": 0
		},
		{
			"type": "checkbox",
			"description": "Lines to players enabled",
			"inputProps": {
				"value": "linesToPlayers.enabled"
			},
			"callbacks": {
				"value": "linesToPlayersEnableCb"
			},
			"tabId": 0
		},
		{
			"type": "checkbox",
			"description": "Repeat fire enabled",
			"inputProps": {
				"value": "autoFire.enabled"
			},
			"callbacks": {
				"value": "autoFireEnableCb"
			},
			"tabId": 0
		},
		{
			"type": "checkbox",
			"description": "Zoom changing enabled",
			"inputProps": {
				"value": "zoomRadiusManager.enabled"
			},
			"callbacks": {
				"value": "zoomRadiusManagerEnableCb"
			},
			"tabId": 0
		},
		{
			"type": "checkbox",
			"description": "Air drop tracking enabled",
			"inputProps": {
				"value": "airDropTracking.enabled"
			},
			"callbacks": {
				"value": "airDropTrackingEnableCb"
			},
			"tabId": 0
		},
		{
			"type": "checkbox",
			"description": "FPS counter enabled",
			"inputProps": {
				"value": "fpsCounter.enabled"
			},
			"callbacks": {
				"value": "fpsCounterEnableCb"
			},
			"tabId": 0
		},
		{
			"type": "info",
			"description": "Transparency",
			"tabId": 1
		},
		{
			"type": "slider",
			"description": "Particles transparency level",
			"inputProps": {
				"min": "0",
				"max": "1",
				"step": "0.01",
				"value": "particlesTransparency"
			},
			"callbacks": {
				"value": "particlesTransparencyCb"
			},
			"tabId": 1
		},
		{
			"type": "slider",
			"description": "Ceiling transparency level",
			"inputProps": {
				"min": "0",
				"max": "1",
				"step": "0.01",
				"value": "ceilingTransparency"
			},
			"callbacks": {
				"value": "ceilingTransparencyCb"
			},
			"tabId": 1
		},
		{
			"type": "slider",
			"description": "Big map transparency level",
			"inputProps": {
				"min": "0",
				"max": "1",
				"step": "0.01",
				"value": "bigMapTransparency"
			},
			"callbacks": {
				"value": "bigMapTransparencyCb"
			},
			"tabId": 1
		},
		{
			"type": "slider",
			"description": "Grenade color",
			"inputProps": {
				"min": "0",
				"max": "16777216",
				"step": "1",
				"value": "fragGrenadeColor"
			},
			"callbacks": {
				"value": "grenadePropertiesCb",
				"useInputValueFrom": "fragGrenadeSize",
				"position": 0
			},
			"tabId": 1
		},
		{
			"type": "slider",
			"description": "Grenade size",
			"inputProps": {
				"min": "0.1",
				"max": "0.5",
				"step": "0.01",
				"value": "fragGrenadeSize"
			},
			"callbacks": {
				"value": "grenadePropertiesCb",
				"useInputValueFrom": "fragGrenadeColor",
				"position": 1
			},
			"tabId": 1
		},
		{
			"type": "resetButton",
			"description": "Reset grenade properties",
			"callbacks": {
				"value": "defaultGrenadePropertiesCb"
			},
			"tabId": 1
		},
		{
			"type": "slider",
			"description": "Smoke alpha",
			"inputProps": {
				"min": "0",
				"max": "1",
				"step": "0.01",
				"value": "smokeGrenadeAlpha"
			},
			"callbacks": {
				"value": "smokeGrenadePropertiesCb"
			},
			"tabId": 1
		},
		{
			"type": "info",
			"description": "AutoAim",
			"tabId": 1
		},
		{
			"type": "checkbox",
			"description": "Target enemy nickname visibility enabled",
			"inputProps": {
				"value": "autoAim.targetEnemyNicknameVisibility"
			},
			"callbacks": {
				"value": "autoAimTargetEnemyNicknameVisibilityCb"
			},
			"tabId": 1
		},
		{
			"type": "checkbox",
			"description": "Target enemy extended info enabled",
			"inputProps": {
				"value": "autoAim.enemyExtendedInfo"
			},
			"callbacks": {
				"value": "autoAimEnemyExtendedInfoCb"
			},
			"tabId": 1
		},
		{
			"type": "checkbox",
			"description": "Detect on different levels",
			"inputProps": {
				"value": "autoAim.detectOnDifferentLevels"
			},
			"callbacks": {
				"value": "autoAimDetectOnDifferentLevelsCb"
			},
			"tabId": 1
		},
		{
			"type": "checkbox",
			"description": "Show enemies actions",
			"inputProps": {
				"value": "autoAim.showEnemiesActions"
			},
			"callbacks": {
				"value": "autoAimShowEnemiesActionsCb"
			},
			"tabId": 1
		},
		{
			"type": "checkbox",
			"description": "Turn off permanent tracking",
			"inputProps": {
				"value": "autoAim.restirctions"
			},
			"callbacks": {
				"value": "autoAimRestirctionsCb"
			},
			"options": {
				"showOrHide": [
					"autoAimrestirctionAngle"
				]
			},
			"tabId": 1
		},
		{
			"type": "slider",
			"description": "Forward firing coeff",
			"inputProps": {
				"min": "0.9",
				"max": "1.1",
				"step": "0.01",
				"value": "autoAim.forwardFiringCoeff"
			},
			"callbacks": {
				"value": "autoAimForwardFiringCoeffCb"
			},
			"tabId": 1
		},
		{
			"type": "slider",
			"description": "Smooth level",
			"inputProps": {
				"min": "2",
				"max": "20",
				"step": "1",
				"value": "autoAim.smoothLevel"
			},
			"callbacks": {
				"value": "autoAimSmoothLevelCb"
			},
			"tabId": 1
		},
		{
			"type": "slider",
			"description": "Restirction angle",
			"inputProps": {
				"min": "1",
				"max": "60",
				"step": "1",
				"value": "autoAim.restirctionAngle"
			},
			"callbacks": {
				"value": "autoAimRestirctionAngleCb"
			},
			"options": {
				"display": {
					"value": "autoAim.restirctions"
				},
				"id": "autoAimrestirctionAngle",
			},
			"tabId": 1
		},
		{
			"type": "info",
			"description": "AutoLoot",
			"tabId": 1
		},
		{
			"type": "slider",
			"description": "Safe distance",
			"inputProps": {
				"min": "0.1",
				"max": "1.3",
				"step": "0.1",
				"value": "autoLoot.safeDistance"
			},
			"callbacks": {
				"value": "autoLootSafeDistanceCb"
			},
			"tabId": 1
		},
		{
			"type": "slider",
			"description": "Autoloot drop delay",
			"inputProps": {
				"min": "0",
				"max": "2000",
				"step": "10",
				"value": "autoLoot.dropDelay"
			},
			"callbacks": {
				"value": "autoLootDropDelayCb"
			},
			"tabId": 1
		},
		{
			"type": "select",
			"description": "Automatic weapon(slot 1) pick up",
			"inputProps": {
				"valuesFromFunction": "getAutoLootAutoPickUpCb",
				"functionValue": {
					"value": 1
				},
				"selected": "autoLoot.autoPickUp.weapon1"
			},
			"callbacks": {
				"value": "setAutoLootAutoPickUpCb",
				"functionValue": {
					"value": 1,
					"position": 0
				}
			},
			"tabId": 1
		},
		{
			"type": "select",
			"description": "Automatic weapon(slot 2) pick up",
			"inputProps": {
				"valuesFromFunction": "getAutoLootAutoPickUpCb",
				"functionValue": {
					"value": 2
				},
				"selected": "autoLoot.autoPickUp.weapon2"
			},
			"callbacks": {
				"value": "setAutoLootAutoPickUpCb",
				"functionValue": {
					"value": 2,
					"position": 0
				}
			},
			"tabId": 1
		},
		{
			"type": "select",
			"description": "Automatic weapon(slot 3) pick up",
			"inputProps": {
				"valuesFromFunction": "getAutoLootAutoPickUpCb",
				"functionValue": {
					"value": 3
				},
				"selected": "autoLoot.autoPickUp.weapon3"
			},
			"callbacks": {
				"value": "setAutoLootAutoPickUpCb",
				"functionValue": {
					"value": 3,
					"position": 0
				}
			},
			"tabId": 1
		},
		{
			"type": "select",
			"description": "Automatic skin pick up",
			"inputProps": {
				"valuesFromFunction": "getAutoLootAutoPickUpCb",
				"functionValue": {
					"value": 5
				},
				"selected": "autoLoot.autoPickUp.skin"
			},
			"callbacks": {
				"value": "setAutoLootAutoPickUpCb",
				"functionValue": {
					"value": 5,
					"position": 0
				}
			},
			"tabId": 1
		}
	];

	var fetchFromObject = function(obj, prop) {
		if(!isset(obj)) {
			return false;
		}

		var _index = prop.indexOf('.');
		if(_index > -1) {
			return fetchFromObject(obj[prop.substring(0, _index)], prop.substr(_index + 1));
		}

		return obj[prop];
	}

	var hasClass = function(el, className) {
		if (el.classList)
			return el.classList.contains(className);
		else
			return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
	}

	var addClass = function(el, className) {
		if (el.classList)
			el.classList.add(className);
		else if (!hasClass(el, className)) el.className += " " + className;
	}

	var removeClass = function(el, className) {
		if (el.classList)
			el.classList.remove(className);
	    else if (hasClass(el, className)) {
			var reg = new RegExp('(\\s|^)' + className + '(\\s|$)')
			el.className = el.className.replace(reg, ' ');
	    }
	}

	document.getElementsByAttribute=function(attrN, attrV, multi){
		attrV = attrV
			.replace(/\|/g,'\\|')
			.replace(/\[/g,'\\[')
			.replace(/\(/g,'\\(')
			.replace(/\+/g,'\\+')
			.replace(/\./g,'\\.')
			.replace(/\*/g,'\\*')
			.replace(/\?/g,'\\?')
			.replace(/\//g,'\\/');

		var multi = isset(multi) ? multi : false,
			cIterate = document.getElementsByTagName('*'),
			aResponse = [],
			attr,
			re = new RegExp(multi ? '\\b'+attrV+'\\b' : '^'+attrV+'$'),
			i = 0,
			elm;

		while (elm=cIterate.item(i++)) {
			attr = elm.getAttributeNode(attrN);
			if (attr && attr.specified && re.test(attr.value)) 
				aResponse.push(elm);
		}
		return aResponse;
	}

	var autoSave = function() {
		setTimeout(function() {
			callbacks["storeOptionsCb"].call();
		});
	}

	var addInfo = function(descriptionText) {
		var info = document.createElement('div');
		info.className = "info-container";

		var description = document.createElement('p');
		description.className = "info-text";
		description.innerHTML = descriptionText;

		info.appendChild(description);

		return info;
	}

	var addSelect = function(descriptionText, inputProps, callback) {
		var select = document.createElement('div');

		if(callbacks[callback.value]) {
			/* Description */
			var description = document.createElement('p');
			description.className = "slider-text";
			description.innerHTML = descriptionText;

			/* Select element */
			var selectList = document.createElement("select");
			selectList.className = "select-cheat";

			/* Options */
			var inputOptions = [];
			if(isset(inputProps.values)) {
				inputOptions = fetchFromObject(options, inputProps.values);
			} else {
				if(isset(inputProps.functionValue)) {
					var v1 = inputProps.functionValue.value;

					inputOptions = fetchFromObject(callbacks, inputProps.valuesFromFunction).call(this, v1);
				} else {
					inputOptions = fetchFromObject(callbacks, inputProps.valuesFromFunction).call(this);
				}
			}

			/* Create and append the options */
			inputOptions.unshift({name: "None", key: ""});
			for(var i = 0 ; i < inputOptions.length ; i++) {
				var option = document.createElement("option");
				option.value = inputOptions[i].key;
				option.text = inputOptions[i].name;
				if(fetchFromObject(options, inputProps.selected)===inputOptions[i].key)option.selected = true;
				selectList.appendChild(option);
			}

			/* Listener */
			selectList.addEventListener("change", function() {
				if(!isset(callback.functionValue)) {
					callbacks[callback.value].call(this);
				} else {
					let v = callback.functionValue.value;
					var val1 = (callback.functionValue.position === 0) ? v : this.value;
					var val2 = (callback.functionValue.position === 1) ? v : this.value;

					callbacks[callback.value].call(this, val1, val2);
				}
				autoSave();
			}, false);

			/* Append */
			select.appendChild(description);
			select.appendChild(selectList);
		}

		return select;
	}

	var addSlider = function(descriptionText, inputProps, callback, eOptions=false) {
		var slider = document.createElement('div');

		if(callbacks[callback.value]) {
			slider.className = "slider-container ui-slider-container center";
			if(isset(eOptions.id))slider.id = eOptions.id;
			if(isset(eOptions.display)) {
				if(!fetchFromObject(options, eOptions.display.value)) {
					slider.style = "display: none;";
				}
			}

			var description = document.createElement('p');
			description.className = "slider-text left";
			description.innerHTML = descriptionText;

			var value = fetchFromObject(options, inputProps.value);

			var currentValueElement = document.createElement('span');
			currentValueElement.className = "slider-current-value right";
			currentValueElement.innerHTML = value;

			var input = document.createElement('input');
			input.className = "slider";
			input.type = "range";
			input.min = inputProps.min;
			input.max = inputProps.max;
			input.step = inputProps.step;
			input.value = value;

			input.addEventListener("input", function() {
				if(!isset(callback.useInputValueFrom)) {
					callbacks[callback.value].call(this, this.value);
				} else {
					let v = fetchFromObject(options, callback.useInputValueFrom);
					var val1 = (callback.position === 0) ? v : this.value;
					var val2 = (callback.position === 1) ? v : this.value;

					callbacks[callback.value].call(this, val1, val2);
				}

				currentValueElement.innerHTML = this.value;
				autoSave();
			}, false);

			slider.appendChild(description);
			slider.appendChild(currentValueElement);
			slider.appendChild(input);
		}

		return slider;
	}

	var changeStatus = function(el, status) {
		if(status) {
			removeClass(el, 'btn-grey');
		} else {
			addClass(el, 'btn-grey');
		}
	}

	var addCheckBox = function(descriptionText, inputProps, callbackName, eOptions=false) {
		var checkbox = document.createElement('div');

		if(callbacks[callbackName]) {
			var button = document.createElement('button');
			button.className = "btn-game-menu btn-darken";
			button.style = "display: block";
			button.innerHTML = descriptionText;
			button.setAttribute('data', fetchFromObject(options, inputProps.value));
			changeStatus(button, fetchFromObject(options, inputProps.value));

			button.addEventListener("click", function() {
				callbacks[callbackName].call();
				var status = fetchFromObject(options, inputProps.value);
				changeStatus(this, status);
				autoSave();

				/* Show or hide */
				if(isset(eOptions.showOrHide)) {
					for(let option of eOptions.showOrHide) {
						let element = document.getElementById(option);
						if(status) {
							element.style.display = "block";
						} else {
							element.style.display = "none";
						}
					}
				}
			}, false);

			checkbox.appendChild(button);
		}

		return checkbox;
	}

	var addResetButton = function(descriptionText, callbackName, tabId) {
		var button = document.createElement('div');

		if(callbacks[callbackName]) {
			button.className = "menu-option btn-darken";
			button.innerHTML = descriptionText;

			button.addEventListener("click", function() {
				callbacks[callbackName].call();

				setTimeout(function() {
					hideMenu();
					showMenu();
					activeTab(tabId);
					autoSave();
				})
			}, false);
		}

		return button;
	}

	var createMainElement = function() {
		var cheatMenuContainer = document.createElement('div');
		cheatMenuContainer.className = "ui-game-menu ui-game-menu-desktop";
		if(isMainScreen) {
			addClass(cheatMenuContainer, 'ui-green');
		}
		cheatMenuContainer.style = "display: block; float: right;";
		cheatMenuContainer.id = "ui-cheat-menu";

		return cheatMenuContainer;
	}

	var createTabsContainer = function() {
		var cheatTabsContainer = document.createElement('div'); 
		cheatTabsContainer.className = "btn-game-tabs btns-game-double-row";
		cheatTabsContainer.style = "display: flex";

		return cheatTabsContainer;
	}

	var addTab = function(index, name=false, icon=false) {
		var tab = document.createElement('div');
		tab.className = "btn-game-container";

		var a = document.createElement('a');
		a.className = "btn-game-settings btn-game-tab-select btn-game-menu btn-darken";
		a.setAttribute("data-cheat-tab", "tab-" + index);
		if(name) {
			a.innerHTML = name;
		}

		var iconElement = document.createElement('div');
		if(icon) {
			iconElement.className = "btn-double-row game-menu-icon-static";
			addClass(iconElement, icon.className);
		}

		a.addEventListener("click", function() {
			var index = this.getAttribute('data-cheat-tab').split('-')[1];
			activeTab(index);
		});

		tab.appendChild(a);
		tab.appendChild(iconElement);

		return tab;
	}

	var getTabMenu = function() {
		var cheatTabsContainer = createTabsContainer();

		let i=0;
		for(let obj of tabs) {
			var name = isset(obj.name) ? obj.name : false;
			var icon = isset(obj.name) ? obj.icon : false;
			var element = addTab(i, name, icon);
			cheatTabsContainer.appendChild(element);
			i++;
		}

		return cheatTabsContainer;
	}

	var activeTab = function(index) {
		index = parseInt(index);
		if(lastActiveContainer === index)return;

		// Active button
		var button = document.getElementsByAttribute("data-cheat-tab", "tab-" + index)[0];
		addClass(button, 'btn-game-menu-selected');

		if(lastActiveContainer !== null) {
			var button2 = document.getElementsByAttribute("data-cheat-tab", "tab-" + lastActiveContainer)[0];
			removeClass(button2, 'btn-game-menu-selected');
		}

		// Active container
		var container = document.getElementById("ui-cheat-tab-" + index);
		container.style = "display: block";

		if(lastActiveContainer !== null) {
			var container2 = document.getElementById("ui-cheat-tab-" + lastActiveContainer);
			container2.style = "display: none";
		}
		lastActiveContainer = index;
	}

	var createElementsContainer = function(index) {
		var container = document.createElement('div'); 
		container.className = "ui-list ui-game-tab ui-game-tab-settings-desktop full-height";
		container.style = "display: none;";
		container.id = "ui-cheat-tab-" + index;

		var container2 = document.createElement('div');
		container2.style = "height: 100%;"
		container.appendChild(container2);

		return container;
	}

	var getMenuElement = function(obj) {
		var element = null;
		if(obj.type === "slider") {
			var eOptions = false;
			if(isset(obj.options))eOptions = obj.options;
			element = addSlider(obj.description, obj.inputProps, obj.callbacks, eOptions);
		} else if(obj.type === "checkbox") {
			var eOptions = false;
			if(isset(obj.options))eOptions = obj.options;
			element = addCheckBox(obj.description, obj.inputProps, obj.callbacks.value, eOptions);
		} else if(obj.type === "resetButton") {
			element = addResetButton(obj.description, obj.callbacks.value, obj.tabId);
		} else if(obj.type === "select") {
			element = addSelect(obj.description, obj.inputProps, obj.callbacks);
		} else if(obj.type === "info") {
			element = addInfo(obj.description);
		}

		return element;
	}

	var getTabsContainers = function() {
		var containers = [];
		for(let i=0 ; i < tabs.length ; i++) {
			var container = createElementsContainer(i);
			for(let j=0 ; j < elements.length ; j++) {
				if(elements[j].tabId === i) {
					var element = getMenuElement(elements[j])
					if(isset(element)) {
						container.firstChild.appendChild(element);
					}
				}
			}
			containers.push(container);
		}
		return containers;
	}

	var fixGameArea = function() {
		var gameAreaWrapper = document.getElementById('game-area-wrapper');
		gameAreaWrapper.style.display = "contents";
		gameAreaWrapper.style.opacity = "";
	}

	var showMenu = function() {
		isMainScreen && fixGameArea();
		removeOldMenu();
		detectMenuStatus();

		var cheatMenuContainer = createMainElement();

		/* Tabs menu */
		var cheatTabs = getTabMenu();
		cheatMenuContainer.appendChild(cheatTabs);

		/* Tabs containers */
		var tabsContainers = getTabsContainers();
		for(let container of tabsContainers) {
			cheatMenuContainer.appendChild(container);
		}

		/* Append all */
		let centerDiv = document.getElementById('ui-center');
		centerDiv.appendChild(cheatMenuContainer);

		/* Listen back to game button */
		document.getElementById('btn-game-resume').addEventListener('click', hideMenu);
		document.getElementById('btn-game-quit').addEventListener('click', hideMenu);
		var backToGameListener = true;

		lastActiveContainer = null;
		activeTab(0);
	}

	var hideMenu = function() {
		removeOldMenu();
		if(backToGameListener)document.getElementById('btn-game-resume').removeEventListener("click", hideMenu, false);
		if(backToGameListener)document.getElementById('btn-game-quit').removeEventListener("click", hideMenu, false);
		menuOpened = false;
		backToGameListener = false;
		cheatMenuContainer = document.createElement('div');
	}

	var bKeyListener = {
		keyup: function(e) {
			if(event.which == 27) {
				detectMenuStatus(true);
				menuOpened = !menuOpened;
				if(menuOpened) {
					showMenu();
				} else {
					hideMenu();
				}
			}
		}
	}

	var addBKeyListener = function() {
		window.addEventListener("keyup", bKeyListener.keyup);
	}

	var removeBKeyListener = function() {
		window.removeEventListener("keyup", bKeyListener.keyup);
	}

	var removeElement = function(elementId) {
		var element = document.getElementById(elementId);
		element.parentNode.removeChild(element);
	}

	var removeOldMenu = function() {
		var e = document.getElementById('ui-cheat-menu');
		if(e)removeElement('ui-cheat-menu');
	}

	var detectMenuStatus = function(before=false) {
		isMainScreen = !(isset(game.scope) &&
			game.scope.initialized === true);

		var newMenuStatus;
		if(!isMainScreen && before) {
			newMenuStatus = !game.scope[obfuscate.menu].escMenuDisplayed;
		} else if(!isMainScreen) {
			newMenuStatus = game.scope[obfuscate.menu].escMenuDisplayed;
		} else {
			newMenuStatus = menuOpened;
		}
		menuOpened = newMenuStatus;
	}

	var bind = function() {
		removeOldMenu();
		detectMenuStatus();

		removeBKeyListener();
		addBKeyListener();
		binded = true;
	}

	var unbind = function() {
		if(menuOpened) {
			hideMenu();
			menuOpened = false;
		}

		removeBKeyListener();
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