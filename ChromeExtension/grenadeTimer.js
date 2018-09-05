window.grenadeTimer = function(obfuscate, game) {

	var binded = false;
	var timerHidden = true;
	var duration = 4.2;
	var period = 0.1;
	var dead = true;

	var updateTimerState = function() {
		var activePlayer = game.scope[obfuscate.activePlayer.main];

		if(	activePlayer.curWeapIdx === 3 &&
			activePlayer.weapType === "frag" &&
			!dead) {

			setTimeout(updateTimerState, period * 1000);
		} else {
			freeTimer();
		}
	}

	var initTimer = function() {
		game.scope[obfuscate.notifications].a(function onElapsed() {
			freeTimer();
		}, duration, "Grenade", true);
		dead = false;

		updateTimerState();
	}

	var freeTimer = function() {
		game.scope[obfuscate.notifications] && game.scope[obfuscate.notifications].o(true);
		dead = true;
	}

	var mouseListener = {
		mousedown: function(event) {
			var activePlayer = game.scope[obfuscate.activePlayer.main];
			
			if(	activePlayer.curWeapIdx === 3 &&
				activePlayer.weapType === "frag" &&
				dead &&
				event.button === 0) {

				!game.scope.gameOver && initTimer();
			}
		},
		mouseup: function(event) {
			if(	event.button === 0 &&
				!dead) {

				freeTimer();
			}	
		}
	}

	var addMouseListener = function() {
		window.addEventListener("mousedown", mouseListener.mousedown);
		window.addEventListener("mouseup", mouseListener.mouseup);
	}

	var removeMouseListener = function() {
		window.removeEventListener("mousedown", mouseListener.mousedown);
		window.addEventListener("mouseup", mouseListener.mouseup);
	}

	var bind = function(opt) {
		addMouseListener();
		binded = true;
	}

	var unbind = function() {
		removeMouseListener();
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
