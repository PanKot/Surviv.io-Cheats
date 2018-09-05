window.bigMapManager = function(obfuscate, game) {

	var binded = false;

	var bind = function(alpha) {
		setBigMapTransparency(alpha);
		binded = true;
	}

	var unbind = function() {
		binded = false;
	}

	var isBinded = function() {
		return binded;
	}

	var setBigMapTransparency = function(alpha) {
		game.scope[obfuscate.menu].container.alpha = alpha;
	}

	return {
		bind: bind,
		unbind: unbind,
		isBinded: isBinded,

		setBigMapTransparency: setBigMapTransparency
	}
}