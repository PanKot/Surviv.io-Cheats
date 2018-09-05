window.fpsCounter = function(obfuscate, game) {

	var binded = false;
	var stats = null;
	var scriptLoaded = false;

	var createMainElement = function() {
		if(stats) {
			stats.dom.style.top = "";
			stats.dom.style.bottom = "4px";
			stats.dom.style.left = "4px";
			stats.dom.id = "fpsCounter";
			document.body.appendChild(stats.dom);
		}
	}

	var removeElement = function(elementId) {
		var element = document.getElementById(elementId);
		element.parentNode.removeChild(element);
	}

	var removeOldMainElement = function() {
		var e = document.getElementById('fpsCounter');
		if(e)removeElement('fpsCounter');
	}

	var mainElementExists = function() {
		var e = document.getElementById('fpsCounter');
		return (e) ? true : false;
	}

	var appendScript = function() {
		var script = document.createElement('script');

		script.onload = function() {
			stats = new Stats();
			createMainElement();
			scriptLoaded = true;
		};

		script.src = '//rawgit.com/mrdoob/stats.js/master/build/stats.min.js';
		document.head.appendChild(script);
	}

	var updateState = function() {
		stats && scriptLoaded && stats.update();

		if(binded) {
			requestAnimationFrame( updateState );
		}
	}

	var bind = function() {
		binded = true;

		!scriptLoaded && appendScript();
		!mainElementExists() && createMainElement();

		requestAnimationFrame( updateState );
	}

	var unbind = function() {
		binded = false;

		removeOldMainElement();
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