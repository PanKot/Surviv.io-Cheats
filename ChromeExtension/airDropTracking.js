window.airDropTracking = function(obfuscate, game) {

	var binded = false;
	var PlanesLines = {
		draw: [],
		lastPlaneId: -1
	};
	var airDrops = {};
	var targetTexture = window.PIXI.Texture.fromImage('img/map/map-plane-01.svg');

	var getMapPosFromWorldPos = function(map, point) {
		return {
			x: map.mapSprite.x - map.mapSprite.width / 2 + point.x / map.mapWidth * map.mapSprite.width,
			y: map.mapSprite.y + map.mapSprite.height / 2 - point.y / map.mapHeight * map.mapSprite.height
		};
	}

	var updateLocation = function(plane) {
		var map = game.scope[obfuscate.menu];
		if(!map || !map.container)
			return;

		var targetIndicator = null;
		if(isset(PlanesLines.draw[plane.id])) {
			targetIndicator = PlanesLines.draw[plane.id]
		}
		
		if(!targetIndicator)
		{
			targetIndicator = window.PIXI.Sprite.from(targetTexture);
			targetIndicator.visible = false;
			targetIndicator.scale.set(0.4, 0.4)
			targetIndicator.tint = 16711680;
			targetIndicator.alpha = 0.6;
			targetIndicator.anchor.set(0.5, 0.5)
			map.display.player.addChild(targetIndicator);
			PlanesLines.draw[plane.id] = targetIndicator;
		}
		
		if(!targetIndicator)
			return;

		var mapPos = getMapPosFromWorldPos(game.scope[obfuscate.menu], plane.pos, targetIndicator)

		targetIndicator.position.set(mapPos.x, mapPos.y);
		targetIndicator.rotation = plane.sprite.rotation;
		targetIndicator.visible = plane.active;
	}

	var updatePoints = function() {
		var planes = game.scope[obfuscate.planes].planes;

		var len = planes.length;
		if(len > 0) {
			for(var i=0;i<len;i++) {
				updateLocation(planes[i]);
			}

			if(planes[len-1].id != PlanesLines.lastPlaneId) {
				PlanesLines.lastPlaneId = planes[len-1].id;
				showAttention();
			}
		}
	}

	var draw = function() {
		if(binded && game.scope.initialized) {
			extendAnimationTime();
			updatePoints();

			setTimeout(draw);
		}
	}

	var extendAnimationTime = function() {
		var airdropSprites = game.scope[obfuscate.menu].airdropSprites;
		for(var i=0;i<airdropSprites.length;i++) {
			let airDrop = airdropSprites[i];
			if(airDrop.pingPulseWave.position.x != 0 &&
				airDrop.pingPulseWave.displayed === true &&
				!airDrops[i] == true) {

				airDrop.mapSprite.maxLife = 100;
				airDrop.mapSprite.life = 100;

				airDrops[i] = true;
			}
		}
	}

	var removeElement = function(elementId) {
		var element = document.getElementById(elementId);
		element.parentNode.removeChild(element);
	}

	var createNotification = function(message) {
		var uiGame = document.getElementById('ui-game');

		var notficiation = document.createElement('div');
		notficiation.id = "plane-notification"
		notficiation.className = "notification";
		notficiation.innerHTML = message;

		uiGame.appendChild(notficiation);
	}

	var showAttention = function() {
		var element = document.getElementById('plane-notification')
		element.classList.add('fadeInAndOut');

		element.style.webkitAnimation = 'none';
		setTimeout(function() {
			element.style.webkitAnimation = '';
		}, 10);
	}

	var resetVariables = function() {
		PlanesLines.draw = [];
		PlanesLines.lastPlaneId = -1;

		airDrops = {};
		for(var i=0;i<20;i++)airDrops[i] = false;
	}

	var bind = function() {
		resetVariables();

		createNotification("Attention, the next plane is comming!");

		binded = true;

		setTimeout(function() {
			draw();
		});
	}

	var unbind = function() {
		binded = false;

		removeElement('plane-notification');
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