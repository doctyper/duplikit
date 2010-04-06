/*
File: fixed.js

About: Version
	1.0

Project: iPhone OS Fixed Positioning

Description:
	Enables fixed positioning on iPhone OS

Supports:
	- iPad (iPhone coming soon(?))
	
*/

/*
Class: DOCTYPER
	Scoped to the DOCTYPER Global Namespace
*/
var DOCTYPER = window.DOCTYPER || {};

/*
Namespace: DOCTYPER.Touch
	Under the DOCTYPER.Touch Local Namespace
*/
DOCTYPER.Touch = DOCTYPER.Touch || {};

/*
Namespace: DOCTYPER.Touch.FixedPositioning
	Under the DOCTYPER.Touch.FixedPositioning Local Namespace
*/
DOCTYPER.Touch.FixedPositioning = DOCTYPER.Touch.FixedPositioning || {};

(function () {
	
	// Storing a variable to reference
	var $space = DOCTYPER.Touch;
	var $self = $space.FixedPositioning;
	
	/*
	Namespace: DOCTYPER.Touch.vars
		Shared local variables
	*/
	$self.vars = {
		
		scrollAxis : "y",
		
		// Selector to point to target
		target : "body > section",
		
		viewport : "body > viewport",
		
		velocityMultiplier : 1000
		
	};
	
	/*
	Namespace: DOCTYPER.Touch.utils
		Shared local utilities
	*/
	$self.utils = {
		
		/*
		Property: addClass
			Adds class name to element

		Parameters:
			elClass - the class to add.

		Example:
			>var foo = document.getElementById("foo");
			>foo.addClass("zomg");
		*/
		addClass : function(el, elClass) {
			var curr = el.className;
			if (!new RegExp(("(^|\\s)" + elClass + "(\\s|$)"), "i").test(curr)) {
				el.className = curr + ((curr.length > 0) ? " " : "") + elClass;
			}
			return el;
		},

		/*
		Property: removeClass
		 	Removes class name to element

		Parameters:
			elClass - _(optional)_ the class to remove.

		Example:
			>var foo = document.getElementById("foo");
			>foo.removeClass("zomg"); // removes class "zomg"
			>foo.removeClass(); // removes all classes
		*/
		removeClass : function(el, elClass) {
			if (elClass) {
				var classReg = new RegExp(("(^|\\s)" + elClass + "(\\s|$)"), "i");
				el.className = el.className.replace(classReg, function(e) {
					var value = "";
					if (new RegExp("^\\s+.*\\s+$").test(e)) {
						value = e.replace(/(\s+).+/, "$1");
					}
					return value;
				}).replace(/^\s+|\s+$/g, "");
				
				if (el.getAttribute("class") === "") {
					el.removeAttribute("class");
				}
			} else {
				el.className = "";
				el.removeAttribute("class");
			}
			return el;
		},
		
		isVertical : function() {
			return $self.vars.scrollAxis.toLowerCase() === "y";
		},
		
		checkOrientation : function(e) {
			var orientation = Math.abs(window.orientation),
			    utils = $self.utils;
			
			if (orientation === 90) {
				utils.removeClass(document.body, "portrait");
				utils.addClass(document.body, "landscape");
			} else {
				utils.addClass(document.body, "portrait");
				utils.removeClass(document.body, "landscape");
			}
			
			$self.vars.orientationChange = true;
		},
		
		checkScroll : function(e) {
			
			// Orientationchange fires before scroll
			// This is good. It gives me a chance to not scroll
			if (!$self.vars.orientationChange) {
				var target = $self.utils.getTarget();
				var matrix = $self.utils.getMatrix(target);
				
				$self.utils.resetTransition(target, 350);
				$self.utils.setTransform(target, matrix.translate(0, -target.getBoundingClientRect().top));
			}
			
			$self.vars.orientationChange = false;
		},
		
		getTarget : function() {
			return document.querySelector($self.vars.target);
		},
		
		getViewport : function() {
			return document.querySelector($self.vars.viewport);
		},
		
		setTransform : function(el, matrix) {
			el.style.webkitTransform = matrix;
		},

		resetTransition : function(el, value) {
			el.style.webkitTransitionDuration = (value || 0) + "ms";
		},

		getMatrix : function(el) {
			var transform = window.getComputedStyle(el).webkitTransform,
			    matrix = new WebKitCSSMatrix(transform);

			return matrix;
		},

		logTouches : function(object) {
			$self.vars.log = $self.vars.log || [];
			
			if ($self.vars.log.length === 3) {
				$self.vars.log.shift();
			}

			$self.vars.log.push(object);
		},

		updateTouches : function(touchDifferences) {
			$self.vars.oldTouches = $self.vars.oldTouches || touchDifferences;
			var oldTouches = $self.vars.oldTouches;

			$self.utils.logTouches({
				touchDifferences : {
					x : touchDifferences.x - oldTouches.x,
					y : touchDifferences.y - oldTouches.y
				},
				time : new Date().getTime()
			});

			$self.vars.oldTouches = touchDifferences;

			$self.vars._touchMoveTimer = window.setTimeout(function() {
				$self.utils.logTouches({
					touchDifferences : {
						x : 0,
						y : 0
					},
					time : new Date().getTime()
				});
			}, 10);
		},
		
		showScrollbar : function() {
			var target = document.getElementById("touch-scrollbar");
			
			if (target.hasAttribute("class")) {
				target.removeAttribute("class");
			}
		},
		
		hideScrollbar : function() {
			var target = document.getElementById("touch-scrollbar");
			target.setAttribute("class", "hidden");
		},
		
		updateScrollbarPosition : function(el, position, duration) {
			$self.utils.showScrollbar();
			
			var target = document.getElementById("touch-scrollbar");
			
			var dimensions = {
				w : el.offsetWidth,
				h : el.offsetHeight
			};
			
			var ratio, value;
			
			if ($self.utils.isVertical()) {
				ratio = 1 - ((dimensions.h - Math.abs(position.top)) / dimensions.h);
				value = {
					x : 0,
					y : window.outerHeight * ratio
				};
			} else {
				ratio = 1 - ((dimensions.w - Math.abs(position.left)) / dimensions.w);
				value = {
					x : window.outerWidth * ratio,
					y : 0
				};
			}
			
			
			var matrix = $self.vars.scrollbarMatrix || $self.utils.getMatrix(target);
			$self.utils.resetTransition(target, duration);
			$self.utils.setTransform(target, matrix.translate(value.x, value.y));
			
			$self.vars.scrollbarMatrix = matrix;
			
			if (duration) {
				$self.vars._scrollTimer = window.setTimeout($self.utils.hideScrollbar, duration);
			}
		},
		
		zeroValues : function() {
			if ($self.vars._endTimer) {
				window.clearTimeout($self.vars._endTimer);
			}
			
			if ($self.vars._scrollTimer) {
				window.clearTimeout($self.vars._scrollTimer);
			}
			
			$self.vars.log = [];
		}
	};
	
	/*
	Namespace: DOCTYPER.Touch
		Under the DOCTYPER.Touch Local Namespace
	*/
	
	/*
	Function: addEventListeners
	*/
	$self.addEventListeners = function() {
		// Shortcuts
		var doc = document,
		    target = $self.utils.getTarget();
		
		// Local variables
		var touch, matrix, offset,
		    startTime, endTime, endDisplacement,
		    startTouches = {}, currentTouches = {},
		    endTouches = {}, touchDifferences = {},
		    tHeight, wHeight, heightDiff,
		    tWidth, wWidth, widthDiff,
		    lastTouches, lastTime, velocity, endDuration, end;
		
		var eventListeners = {
			touchstart : function(e) {
				
				$self.utils.zeroValues();

				touch = e.touches[0];

				startTouches = {
					x : touch.pageX,
					y : touch.pageY
				};

				startTime = new Date().getTime();

				tHeight = target.offsetHeight;
				wHeight = window.outerHeight;

				tWidth = target.offsetWidth;
				wWidth = window.outerWidth;
				
				heightDiff = tHeight - wHeight;
				widthDiff = tWidth - wWidth;

				$self.utils.resetTransition(target);
				matrix = $self.utils.getMatrix(target);
			},

			touchmove : function(e) {
				e.preventDefault();

				if ($self.vars._touchMoveTimer) {
					window.clearTimeout($self.vars._touchMoveTimer);
				}

				touch = e.touches[0];

				currentTouches = {
					x : touch.pageX,
					y : touch.pageY
				};

				touchDifferences = {
					x : currentTouches.x - startTouches.x,
					y : currentTouches.y - startTouches.y
				};

				offset = target.getBoundingClientRect();

				if (offset.left > 0 || Math.abs(offset.left) > widthDiff) {
					touchDifferences.x *= 0.5;
				}

				if (offset.top > 0 || Math.abs(offset.top) > heightDiff) {
					touchDifferences.y *= 0.5;
				}
				
				if ($self.utils.isVertical()) {
					touchDifferences.x = 0;
				} else {
					touchDifferences.y = 0;
				}

				$self.utils.updateTouches(touchDifferences);
				$self.utils.setTransform(target, matrix.translate(touchDifferences.x, touchDifferences.y));
				
				$self.utils.updateScrollbarPosition(target, offset);
			},

			touchend : function(e) {
				offset = target.getBoundingClientRect();

				endTouches = {
					x : e.changedTouches[0].pageX,
					y : e.changedTouches[0].pageY
				};

				endTime = (new Date().getTime()) - startTime;

				// Reverse the log array
				var log = $self.vars.log;
				
				if (!log.length) {
					$self.utils.hideScrollbar();
					return;
				}
				
				log.reverse();

				lastTouches = function() {
					var sum = {
						x : 0,
						y : 0
					};
					
					for (var i = 0, j = log.length; i < j; i++) {
						sum.x += log[i].touchDifferences.x;
						sum.y += log[i].touchDifferences.y;
					}

					var avg = {
						x : sum.x / log.length,
						y : sum.y / log.length
					};

					return avg;
				}();

				lastTime = log[0].time - log[2].time;

				endDisplacement = {
					x : endTouches.x - startTouches.x,
					y : endTouches.y - startTouches.y
				};

				velocity = {
					x : (lastTouches.x / lastTime),
					y : (lastTouches.y / lastTime)
				};

				endDuration = Math.abs(velocity.y * $self.vars.velocityMultiplier);
				
				end = {
					x : endDuration * velocity.x,
					y : endDuration * velocity.y
				};
				
				var bounds = {
					top : offset.top + end.y > 0,
					right : Math.abs(offset.left + end.x) > widthDiff,
					bottom : Math.abs(offset.top + end.y) > heightDiff,
					left : offset.left + end.x > 0
				};
				
				var _timer, bounce = {},
				    newDuration = Math.min(800, Math.max(400, 800 * Math.abs($self.utils.isVertical() ? velocity.y : velocity.x)));

				if (bounds.top || bounds.right || bounds.bottom || bounds.left) {
					
					if (bounds.top) {
						end.y = -(offset.top);
						endDuration = newDuration;

						if (offset.top < 0) {
							bounce.y = end.y;
							end.y += 50;
							_timer = true;
						}
					}
					
					if (bounds.right) {
						end.x = -(widthDiff) - offset.left;
						endDuration = newDuration;
					
						if (Math.abs(offset.right) < widthDiff) {
							bounce.x = end.x;
							end.x -= 50;
							_timer = true;
						}
					}
					
					if (!bounds.top && bounds.bottom) {
						end.y = -(heightDiff) - offset.top;
						endDuration = newDuration;

						if (Math.abs(offset.top) < heightDiff) {
							bounce.y = end.y;
							end.y -= 50;
							_timer = true;
						}
					}
					
					if (!bounds.right && bounds.left) {
						end.x = -(offset.left);
						endDuration = newDuration;
						
						if (offset.left < 0) {
							bounce.x = end.x;
							end.x += 50;
							_timer = true;
						}
					}
					
					if (_timer) {
						endDuration /= 2.5;
						
						$self.vars._endTimer = window.setTimeout(function() {
							$self.utils.setTransform(target, matrix.translate(bounce.x || 0, bounce.y || 0));
						}, endDuration);
					}
				}
				
				if ($self.utils.isVertical()) {
					end.x = 0;
				} else {
					end.y = 0;
				}

				matrix = $self.utils.getMatrix(target);
				$self.utils.resetTransition(target, endDuration);
				$self.utils.setTransform(target, matrix.translate(end.x, end.y));
				
				$self.utils.updateScrollbarPosition(target, {
					left : offset.left + end.x,
					top : offset.top + end.y
				}, endDuration);
			}
		};
		
		for (var key in eventListeners) {
			doc.addEventListener(key, eventListeners[key], false);
		}

		window.addEventListener("scroll", $self.utils.checkScroll, false);
		
		window.addEventListener("orientationchange", $self.utils.checkOrientation, false);
		
		// Fire on load
		$self.utils.checkOrientation();
	};
	
	$self.renderScrollbar = function() {
		var target = $self.utils.getTarget(),
		    viewport = $self.utils.getViewport();
		
		var div = document.createElement("div");
		div.setAttribute("id", "touch-scrollbar");
		
		var ratio = target.offsetHeight / window.outerHeight;
		div.style.height = window.outerHeight / ratio + "px";
		
		viewport.appendChild(div);
		
		$self.vars._scrollTimer = window.setTimeout($self.utils.hideScrollbar, 800);
	};
	
	/*
	Function: init
	*/
	$self.init = function() {
		document.addEventListener("DOMContentLoaded", $self.addEventListeners, false);
		
		// Initialize!
		$self.renderScrollbar();
	}();
})();