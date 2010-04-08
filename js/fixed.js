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
Class: Swipe
	Scoped to the Swipe Global Namespace
*/
var Swipe = window.Swipe || {};

/*
Namespace: Swipe.UI
	Under the Swipe.UI Local Namespace
*/
Swipe.UI = Swipe.UI || {};

/*
Namespace: Swipe.UI.Rivet
	Under the Swipe.UI.Rivet Local Namespace
*/
Swipe.UI.Rivet = (function () {
	
	// Storing a variable to reference
	var $space = Swipe.UI;
	var $self = this;
	
	/*
	Namespace: Swipe.UI.vars
		Shared local variables
	*/
	$self.vars = {
		namespaceClass : "ui-swipe-rivet",
		endTimers : {},
		scrollbarMatrices : {},
		velocityMultiplier : 1000
	};
	
	/*
	Namespace: Swipe.UI.utils
		Shared local utilities
	*/
	$self.utils = {
		
		/*
		Property: addClass
			Adds class name to element

		Parameters:
			elClass - the class to add.
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
		
		/*
		Property: hasClass
		 	Tests if element has class

		Parameters:
			elClass - the class to test.
		*/
		hasClass : function(el, elClass) {
			return new RegExp(("(^|\\s)" + elClass + "(\\s|$)"), "i").test(el.className);
		},
		
		parseClass : function() {
			var suffix = arguments[1] || arguments[0],
			    prefix = arguments[1] ? arguments[0] : "";
			
			var value = prefix + $self.vars.namespaceClass + "-" + suffix;
			
			return value;
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
				var targets = $self.utils.getTargets();
				var matrix = $self.utils.getMatrix(targets.y);
				
				$self.utils.resetTransition(targets.y, 350);
				$self.utils.setTransform(targets.y, matrix.translate(0, -targets.y.getBoundingClientRect().top));
			}
			
			$self.vars.orientationChange = false;
		},
		
		getTargets : function(object) {
			var target = object.target;
			
			$self.vars.object = $self.vars.object || {
				parent : target,
				x : target.querySelector($self.utils.parseClass(".", "x-axis")),
				y : target.querySelector($self.utils.parseClass(".", "y-axis")),
				viewport : target.querySelector("viewport"),
				content : target.querySelector("section")
			};
			
			return $self.vars.object;
		},
		
		getViewport : function(object) {
			return object.target.querySelector("> viewport");
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
		
		showScrollbars : function() {
			var scrollbars = document.querySelectorAll($self.utils.parseClass(".", "scrollbar"));
			
			for (var i = 0, j = scrollbars.length; i < j; i++) {
				$self.utils.removeClass(scrollbars[i], $self.utils.parseClass("hidden"));
			}
		},
		
		hideScrollbars : function() {
			var scrollbars = document.querySelectorAll($self.utils.parseClass(".", "scrollbar"));
			
			for (var i = 0, j = scrollbars.length; i < j; i++) {
				$self.utils.addClass(scrollbars[i], $self.utils.parseClass("hidden"));
			}
		},
		
		updateScrollbarPosition : function(object) {
			$self.utils.showScrollbars();
			
			var target;
			
			var scrollbars = {
				x : document.querySelector($self.utils.parseClass(".", "scrollbar-horizontal")),
				y : document.querySelector($self.utils.parseClass(".", "scrollbar-vertical"))
			};
			
			var ratio, value, matrices, matrix;
			
			matrices = {
				x : $self.vars.scrollbarMatrices.x || $self.utils.getMatrix(scrollbars.x),
				y : $self.vars.scrollbarMatrices.y || $self.utils.getMatrix(scrollbars.y)
			};
			
			if ($self.utils.hasClass(object.el, "ui-swipe-rivet-y-axis")) {
				ratio = 1 - ((object.inner - Math.abs(object.position.top)) / object.inner);
				
				value = {
					x : 0,
					y : object.outer * ratio
				};
				target = scrollbars.y;
				matrix = matrices.y;
			} else {
				ratio = 1 - ((object.inner - Math.abs(object.position.left)) / object.inner);
				value = {
					x : object.outer * ratio,
					y : 0
				};
				target = scrollbars.x;
				matrix = matrices.x;
			}
			
			$self.utils.resetTransition(target, object.duration);
			$self.utils.setTransform(target, matrix.translate(value.x, value.y));
			
			$self.vars.scrollbarMatrices = matrices;
			
			if (object.duration) {
				$self.vars._scrollTimer = window.setTimeout($self.utils.hideScrollbars, object.duration);
			}
		},
		
		zeroValues : function() {
			if ($self.vars.endTimers) {
				window.clearTimeout($self.vars.endTimers.x);
				window.clearTimeout($self.vars.endTimers.y);
			}
			
			if ($self.vars._scrollTimer) {
				window.clearTimeout($self.vars._scrollTimer);
			}
			
			$self.vars.log = [];
			
			$self.vars.activeAxis = null;
		}
	};
	
	/*
	Namespace: Swipe.UI
		Under the Swipe.UI Local Namespace
	*/
	
	/*
	Function: addEventListeners
	*/
	$self.addEventListeners = function(object) {
		// Shortcuts
		var doc = document,
		    targets = $self.utils.getTargets(object);
		
		// Local variables
		var touch, offset, scale,
		    matrices = {}, log, logDiff,
		    startTime, endTime, endDisplacement,
		    startTouches = {}, currentTouches = {},
		    endTouches = {}, touchDifferences = {},
		    tHeight, wHeight, heightDiff,
		    tWidth, wWidth, widthDiff,
		    activeAxis, doubleCheckAxis,
		    lastTouches, lastTime, velocity, endDuration, end;
		
		var eventListeners = {
			touchstart : function(e) {
				
				$self.utils.zeroValues();
				
				activeAxis = null;
				doubleCheckAxis = null;
				
				touch = e.touches[0];

				startTouches = {
					x : touch.pageX,
					y : touch.pageY
				};

				startTime = new Date().getTime();

				tHeight = targets.content.offsetHeight;
				wHeight = targets.parent.offsetHeight || window.outerHeight;

				tWidth = targets.content.offsetWidth;
				wWidth = targets.parent.offsetWidth || window.outerWidth;
				
				heightDiff = tHeight - wHeight;
				widthDiff = tWidth - wWidth;
				
				$self.utils.resetTransition(targets.x);
				$self.utils.resetTransition(targets.y);
				
				matrices = {
					x : $self.utils.getMatrix(targets.x),
					y : $self.utils.getMatrix(targets.y)
				};
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
				
				if (!activeAxis) {
					activeAxis = {};
					
					activeAxis.x = (Math.abs(touchDifferences.x) >= Math.abs(touchDifferences.y));
					activeAxis.y = (Math.abs(touchDifferences.x) <= Math.abs(touchDifferences.y));
				} else if (!doubleCheckAxis) {
					doubleCheckAxis = Math.abs(Math.abs(touchDifferences.x) - Math.abs(touchDifferences.y)) <= 5;
					
					if (doubleCheckAxis) {
						activeAxis.x = true;
						activeAxis.y = true;
					}
					
					// If all else fails, lock the axis
					doubleCheckAxis = true;
				}

				offset = targets.content.getBoundingClientRect();
				
				if (widthDiff && activeAxis.x) {
					
					if (offset.left > 0 || Math.abs(offset.left) > widthDiff) {
						touchDifferences.x *= 0.5;
					}
					
					$self.utils.setTransform(targets.x, matrices.x.translate(touchDifferences.x, 0));
					
					$self.utils.updateScrollbarPosition({
						el : targets.x,
						outer : wWidth,
						inner : tWidth,
						position : offset
					});
				}
				
				if (heightDiff && activeAxis.y) {
					
					if (offset.top > 0 || Math.abs(offset.top) > heightDiff) {
						touchDifferences.y *= 0.5;
					}

					$self.utils.setTransform(targets.y, matrices.y.translate(0, touchDifferences.y));
					
					$self.utils.updateScrollbarPosition({
						el : targets.y,
						outer : wHeight,
						inner : tHeight,
						position : offset
					});
				}

				$self.utils.updateTouches(touchDifferences);
				
			},

			touchend : function(e) {
				scale = e.scale;
				
				offset = targets.content.getBoundingClientRect();

				endTouches = {
					x : e.changedTouches[0].pageX,
					y : e.changedTouches[0].pageY
				};

				endTime = (new Date().getTime()) - startTime;

				// Reverse the log array
				var log = $self.vars.log;
				
				if (!log.length) {
					$self.utils.hideScrollbars();
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
				
				endDuration = {
					x : Math.abs(velocity.x * $self.vars.velocityMultiplier),
					y : Math.abs(velocity.y * $self.vars.velocityMultiplier)
				};
				
				end = {
					x : endDuration.x * velocity.x,
					y : endDuration.y * velocity.y
				};
				
				var bounds = {
					top : offset.top + end.y > 0,
					right : Math.abs(offset.left + end.x) > widthDiff,
					bottom : Math.abs(offset.top + end.y) > heightDiff,
					left : offset.left + end.x > 0
				};
				
				var _timer = {
					x : 0,
					y : 0
				}, bounce = {};
				
				var newDuration = {
					x : Math.min(800, Math.max(400, 800 * Math.abs(velocity.x))),
					y : Math.min(800, Math.max(400, 800 * Math.abs(velocity.y)))
				};
				
				if (heightDiff && activeAxis.y && (bounds.top || bounds.bottom)) {
					endDuration.y = newDuration.y;
					
					if (bounds.top) {
						end.y = -(offset.top);

						if (offset.top < 0) {
							bounce.y = end.y;
							end.y += 50;
							_timer.y = true;
						}
					} else if (bounds.bottom) {
						end.y = -(heightDiff) - offset.top;

						if (Math.abs(offset.top) < heightDiff) {
							bounce.y = end.y;
							end.y -= 50;
							_timer.y = true;
						}
					}
					
					if (_timer.y) {
						endDuration.y /= 2.5;

						$self.vars.endTimers.y = window.setTimeout(function() {
							$self.utils.setTransform(targets.y, matrices.y.translate(0, bounce.y));
						}, endDuration.y);
					}
				}
				
				if (widthDiff && activeAxis.x && (bounds.left || bounds.right)) {
					endDuration.x = newDuration.x;
					
					if (bounds.left) {
						end.x = -(offset.left);

						if (offset.left < 0) {
							bounce.x = end.x;
							end.x += 50;
							_timer.x = true;
						}
					} else if (bounds.right) {
						end.x = -(widthDiff) - offset.left;

						if (Math.abs(offset.right) < widthDiff) {
							bounce.x = end.x;
							end.x -= 50;
							_timer.x = true;
						}
					}
					
					if (_timer.x) {
						endDuration.x /= 2.5;

						$self.vars.endTimers.x = window.setTimeout(function() {
							$self.utils.setTransform(targets.x, matrices.x.translate(bounce.x, 0));
						}, endDuration.x);
					}
				}
				
				matrices = {
					x : $self.utils.getMatrix(targets.x),
					y : $self.utils.getMatrix(targets.y)
				};
				
				if (widthDiff && activeAxis.x) {
					$self.utils.resetTransition(targets.x, endDuration.x);
					$self.utils.setTransform(targets.x, matrices.x.translate(end.x, 0));
					
					$self.utils.updateScrollbarPosition({
						el : targets.x,
						outer : wWidth,
						inner : tWidth,
						position : {
							left : offset.left + end.x,
							top : offset.top + end.y
						},
						duration : endDuration.x
					});
				}
				
				if (heightDiff && activeAxis.y) {
					$self.utils.resetTransition(targets.y, endDuration.y);
					$self.utils.setTransform(targets.y, matrices.y.translate(0, end.y));
					
					$self.utils.updateScrollbarPosition({
						el : targets.y,
						outer : wHeight,
						inner : tHeight,
						position : {
							left : offset.left + end.x,
							top : offset.top + end.y
						},
						duration : endDuration.y
					});
				}
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
	
	$self.renderScrollbars = function(object) {
		var targets = $self.utils.getTargets(object),
		    div, ratio, dimension;
		
		div = document.createElement("div");
		$self.utils.addClass(div, $self.utils.parseClass("scrollbar"));
		$self.utils.addClass(div, $self.utils.parseClass("scrollbar-horizontal"));
		
		dimension = (targets.parent.offsetWidth || window.outerWidth);
		ratio = targets.content.offsetWidth / dimension;
		div.style.width = dimension / ratio + "px";
		
		targets.viewport.appendChild(div);
		
		div = document.createElement("div");
		$self.utils.addClass(div, $self.utils.parseClass("scrollbar"));
		$self.utils.addClass(div, $self.utils.parseClass("scrollbar-vertical"));
		
		dimension = (targets.parent.offsetWidth || window.outerWidth);
		ratio = targets.content.offsetHeight / dimension;
		div.style.height = dimension / ratio + "px";
		
		targets.viewport.appendChild(div);
		
		$self.vars._scrollTimer = window.setTimeout($self.utils.hideScrollbars, 800);
	};
	
	/*
	Function: init
	*/
	return function(object) {
		// Initialize!
		$self.addEventListeners(object);
		$self.renderScrollbars(object);
	};
})();