/*
File: split-view.js

About: Version
	1.0

Project: DupliKit

Description:
	DupliKit's Split View Controller

Requires:
	- <duplikit.js>
	- <rivet.js>
	
*/

/*
Class: Dup
	Scoped to the Dup Global Namespace
*/
var Dup = window.Dup || {};

/*
Namespace: Dup.UI
	Under the Dup.UI Local Namespace
*/
Dup.UI = Dup.UI || {};

/*
Namespace: Dup.UI.SplitView
	Under the Dup.UI.SplitView Local Namespace
*/
Dup.UI.SplitView = (function (object) {
	
	// Storing a variable to reference
	var $space = Dup;
	
	// Self reference
	var $self = Dup.UI.SplitView;
	
	/*
	Namespace: Dup.UI.vars
		Shared local variables
	*/
	$self.vars = {};
	
	/*
	Namespace: Dup.UI.utils
		Shared local utilities
	*/
	$self.utils = {
		orientationChange : function(views) {
			for (var i = 0, j = views.length; i < j; i++) {
				var view = views[i];
				view.style.height = window.innerHeight - view.offsetTop + "px";
			}
		},
		
		loadPage : function(src, target) {
			var xhr = new XMLHttpRequest();
			xhr.onreadystatechange = function() {
				if (xhr.readyState === 4) {
					if (xhr.status === 200 || xhr.status === 304) {
						
						while (target.firstChild) {
							target.removeChild(target.firstChild);
						}
						
						var fragment = document.createDocumentFragment();
						var dummy = document.createElement("div");
						dummy.innerHTML = xhr.responseText;
						
						for (var i = 0, j = dummy.childNodes.length; i < j; i++) {
							var node = dummy.childNodes[i];
							
							if (node) {
								fragment.appendChild(dummy.childNodes[i]);
							}
						}
						
						target.appendChild(fragment);
						$space.UI.Rivet.utils.checkScroll(null, "0");
						
					} else {
						console.log(req.statusText);
					}
				}
			};
			xhr.open("GET", src, true);
			xhr.send();
		},
		
		transitionTo : function(list) {
			
		}
	};
	
	$self.prepView = function(object) {
		var parent = object,
		    views = parent.querySelectorAll("view");
		
		for (var i = 0, j = views.length; i < j; i++) {
			new Dup.UI.Rivet({
				target : views[i]
			});
		}
	};
	
	$self.addEventListeners = function(object) {
		var parent = object,
		    views = parent.querySelectorAll("view > section"),
		    second = views[1],
		    button = parent.querySelector($space.utils.parseClass(".", "popover-trigger"));
		
		var utils = $space.utils,
		    _anim = $space.utils.parseClass("popover-animating"),
		    _class = $space.utils.parseClass("popover-active");
		
		button.addEventListener("touchend", function() {
			$space.utils.addClass(parent, _class);
		}, false);
		
		button.addEventListener("click", function(e) {
			e.preventDefault();
		}, false);
		
		$space.utils.bindHoverClass(button);
		
		// Add mask to prevent content area from scrolling while popover is active
		var mask = document.createElement("div");
		$space.utils.addClass(mask, $space.utils.parseClass("popover-mask"));
		
		mask.addEventListener("touchend", function(e) {
			if (utils.hasClass(parent, _class)) {
				$space.utils.addClass(parent, _anim);
				
				window.setTimeout(function() {
					$space.utils.removeClass(parent, _anim);
					$space.utils.removeClass(parent, _class);
				}, 500);
			}
		}, false);
		
		second.parentNode.insertBefore(mask, second);
		
		window.addEventListener("orientationchange", function() {
			$self.utils.orientationChange(views);
		}, false);
		
		$self.utils.orientationChange(views);
	};
	
	$self.prepDrillDown = function(object) {
		var parent = object,
		    views = parent.querySelectorAll("view > section"),
		    first = views[0],
		    items = first.querySelectorAll("li"),
		    links = first.querySelectorAll("a");
		
		var _timer, _cell, _link, _list, _start, _current, _moved,
		    _component = $space.utils.parseClass("table-view-component"),
		    _hover = $space.utils.parseClass("hover");
		
		function findItem(target) {
			while (target && target.nodeName.toLowerCase() !== "li") {
				target = target.parentNode;
			}
			
			return target;
		}
		
		function enableRivet(e) {
			if (_timer) {
				window.clearTimeout(_timer);
			}
			
			if (!_moved && e) {
				markActiveElement(e);
			} else if (e) {
				_moved = null;
			}
			
			if (_cell) {
				_cell = null;
				$space.UI.Rivet.utils.enableRivet();
			}
		}
		
		function markActiveElement(e) {
			for (var i = 0, j = items.length; i < j; i++) {
				$space.utils.removeClass(items[i], _hover);
			}
			
			_cell = findItem(e.target);
			
			if (_cell) {
				handleNextStep();
			}
		}
		
		function handleNextStep() {
			_list = _cell.querySelector("ul");
			_link = _cell.querySelector("a");
			
			if (_list) {
				$self.utils.transitionTo(_list);
			} else if (_link) {
				var wrap = views[1].querySelector($space.utils.parseClass(".", "rivet-wrapper"));
				$self.utils.loadPage(_link.getAttribute("rel"), wrap);
			}
			
			$space.utils.addClass(_cell, _hover);
			$space.UI.Rivet.utils.disableRivet();
		}
		
		first.addEventListener("touchstart", function(e) {
			var touch = e.touches[0];
			var target = e.target;
			
			_start = touch.pageY;
			
			while (target && !$space.utils.hasClass(target, _component)) {
				target = target.parentNode;
			}
			
			if (target) {
				_timer = window.setTimeout(function() {
					markActiveElement(e);
				}, 250);
			}
		}, false);
		
		first.addEventListener("touchmove", function(e) {
			_moved = true;
			_current = e.touches[0].pageY - _start;
			
			if (Math.abs(_current) > 10) {
				enableRivet();
			}
		});
		
		first.addEventListener("touchend", enableRivet);
		
		for (var i = 0, j = links.length; i < j; i++) {
			var link = links[i];
			
			link.addEventListener("click", function(e) {
				e.preventDefault();
			}, false);
		}
	};
	
	/*
	Function: init
	*/
	$self.init = function() {
		$self.addEventListeners(object);
		$self.prepDrillDown(object);
		$self.prepView(object);
	}();
});