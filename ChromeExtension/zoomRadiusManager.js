window.zoomRadiusManager = function(obfuscate, game, variables) {

	var scopeZoomRadius = variables.scopeZoomRadius;
	var defaultZoomRadius = Object.assign({}, scopeZoomRadius);
	var binded = false;

	if(!!!scopeZoomRadius) {
		console.log("Cannot init zoom radius manager");
		return;
	}

	var setZoomRadius = function(radius) {
		if(scopeZoomRadius) {
			let scopes = Object.keys(scopeZoomRadius);

			scopes.map(function(name) {
				if(name.replace(/[0-9]/g, '').slice(1) === "scope")
					scopeZoomRadius[name] = radius;
			});
		} else {
			console.log("Scope zoom and radius not patched");
		}
	};

	var resetZoomRadius = function() {
		if(scopeZoomRadius) {
			let scopes = Object.keys(scopeZoomRadius);

			scopes.map(function(name) {
				if(name.replace(/[0-9]/g, '').slice(1) === "scope")
					scopeZoomRadius[name] = defaultZoomRadius[name];
			});
		} else {
			console.log("Scope zoom and radius not patched");
		}
	}

	var zoomRadius = 68;

	var defaultBOnMouseWheel = function(e) {};

	var mouseListener = {
		wheel: function(e) {
			if(e.shiftKey) {
				var delta = e.deltaY || e.detail || e.wheelDelta;
				zoomRadius += Math.sign(delta) * 10;
				if(zoomRadius < 10) zoomRadius = 10;
				if(zoomRadius > 1000) zoomRadius = 1000;
				setZoomRadius(zoomRadius);
			} else {
				defaultBOnMouseWheel(e);
			}
		}
	}

	var addMouseListener = function(e) {
		window.addEventListener('wheel', mouseListener.wheel);
	}

	var removeMouseListener = function(e) {
		window.removeEventListener('wheel', mouseListener.wheel);
	}

	var bind = function() {
		var input = game.scope[obfuscate.input.main][obfuscate.input.input];
		
		defaultBOnMouseWheel = input.bOnMouseWheel;
		window.removeEventListener('wheel', input.bOnMouseWheel);

		removeMouseListener();
		addMouseListener();

		setZoomRadius(zoomRadius);
		binded = true;
	}

	var unbind = function() {
		removeMouseListener();

		window.removeEventListener('wheel', defaultBOnMouseWheel);
		window.addEventListener('wheel', defaultBOnMouseWheel);

		resetZoomRadius();
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