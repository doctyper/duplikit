/*
File: rivet.js

About: Version
	1.0

Project: Swipe JS

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
Swipe.UI.Rivet = (function (object) {
	
	// Storing a variable to reference
	var $space = Swipe;
	var $self = this;
	
	/*
	Namespace: Swipe.UI.vars
		Shared local variables
	*/
	$self.vars = {
		namespaceClass : "ui-swipe-rivet",
		endTimers : {},
		scrollbarMatrices : {},
		touchActive : 0,
		velocityMultiplier : 5000,
		maxDistance : 2500,
		maxDuration : 2000
	};
	
	/*
	Namespace: Swipe.UI.utils
		Shared local utilities
	*/
	$self.utils = {
		
		parseClass : function() {
			var suffix = arguments[1] || arguments[0],
			    prefix = arguments[1] ? arguments[0] : "";
			
			var value = prefix + $self.vars.namespaceClass + "-" + suffix;
			
			return value;
		},
		
		checkScroll : function(e) {
			
			// Orientationchange fires before scroll
			// This is good. It gives me a chance to not scroll
			if (!$space.vars.orientationChange) {
				var targets = $self.utils.getTargets($self.vars.object);
				var matrix = $self.utils.getMatrix(targets.y);
				
				$self.utils.resetTransition(targets.y, 350);
				$self.utils.setTransform(targets.y, matrix.translate(0, -targets.y.getBoundingClientRect().top));
			}
			
			$space.vars.orientationChange = false;
		},
		
		getTargets : function(object) {
			$self.vars.object = $self.vars.object || {
				parent : object.target.querySelector("section"),
				content : object.target.querySelector($self.utils.parseClass(".", "wrapper")),
				x : object.target.querySelector($self.utils.parseClass(".", "x-axis")),
				y : object.target.querySelector($self.utils.parseClass(".", "y-axis")),
				viewport : object.target.querySelector("viewport")
			};
			
			return $self.vars.object;
		},
		
		setTransform : function(el, matrix) {
			if (el) {
				el.style.webkitTransform = matrix;
			}
		},

		resetTransition : function(el, value) {
			if (el) {
				el.style.webkitTransitionDuration = (value || 0) + "ms";
			}
		},

		getMatrix : function(el) {
			if (el) {
				var transform = window.getComputedStyle(el).webkitTransform,
				    matrix = new WebKitCSSMatrix(transform);

				return matrix;
			}
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
		
		showScrollbars : function(parent) {
			var scrollbars = parent.querySelectorAll($self.utils.parseClass(".", "scrollbar"));
			
			for (var i = 0, j = scrollbars.length; i < j; i++) {
				$space.utils.removeClass(scrollbars[i], $self.utils.parseClass("hidden"));
			}
		},
		
		hideScrollbars : function(parent) {
			var scrollbars = parent.querySelectorAll($self.utils.parseClass(".", "scrollbar"));
			
			for (var i = 0, j = scrollbars.length; i < j; i++) {
				$space.utils.addClass(scrollbars[i], $self.utils.parseClass("hidden"));
			}
		},
		
		updateScrollbarPosition : function(object) {
			var parent = object.targets.parent,
			    target;
			
			$self.utils.showScrollbars(parent);
			
			var scrollbars = {
				x : parent.querySelector($self.utils.parseClass(".", "scrollbar-horizontal")),
				y : parent.querySelector($self.utils.parseClass(".", "scrollbar-vertical"))
			};
			
			var ratio, value, matrices, matrix;
			
			matrices = {
				x : $self.vars.scrollbarMatrices.x || $self.utils.getMatrix(scrollbars.x),
				y : $self.vars.scrollbarMatrices.y || $self.utils.getMatrix(scrollbars.y)
			};
			
			if (scrollbars.y && $space.utils.hasClass(object.el, "ui-swipe-rivet-y-axis")) {
				ratio = 1 - ((object.inner - Math.abs(object.position.top)) / object.inner);
				
				value = {
					x : 0,
					y : object.outer * ratio
				};
				target = scrollbars.y;
				matrix = matrices.y;
			} else if (scrollbars.x) {
				ratio = 1 - ((object.inner - Math.abs(object.position.left)) / object.inner);
				value = {
					x : object.outer * ratio,
					y : 0
				};
				target = scrollbars.x;
				matrix = matrices.x;
			}
			
			if (target) {
				$self.utils.resetTransition(target, object.duration);
				$self.utils.setTransform(target, matrix.translate(value.x, value.y));

				$self.vars.scrollbarMatrices = matrices;

				if (object.duration) {
					$self.vars._scrollTimer = window.setTimeout(function() {
						$self.utils.hideScrollbars(object.targets.parent);
					}, object.duration);
				}
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
		var targets = $self.utils.getTargets(object);
		
		// Local variables
		var touch, offset, scale,
		    matrices = {}, log, logDiff,
		    startTime, endTime, endDisplacement,
		    startTouches = {}, currentTouches = {},
		    endTouches = {}, touchDifferences = {},
		    tHeight, wHeight, heightDiff, wTop, wLeft,
		    tWidth, wWidth, widthDiff, oldDifferences = {},
		    activeAxis, doubleCheckAxis, direction,
		    lastTouches, lastTime, velocity, endDuration, end;
		
		var eventListeners = {
			touchstart : function(e) {
				$self.utils.zeroValues();
				
				if (!$self.vars.touchActive) {
					activeAxis = null;
					doubleCheckAxis = null;
					$self.vars.easingTimers = {};
				} else {
					window.clearTimeout($self.vars.easingTimers.x);
					window.clearTimeout($self.vars.easingTimers.y);
					
					$self.vars.touchActive = 0;
				}
				
				oldDifferences = null;
				
				touch = e.touches[0];

				startTouches = {
					x : touch.pageX,
					y : touch.pageY
				};

				startTime = new Date().getTime();
				offset = targets.content.getBoundingClientRect();

				tHeight = targets.content.offsetHeight;
				wHeight = targets.parent.offsetHeight || window.outerHeight;

				tWidth = targets.content.offsetWidth;
				wWidth = targets.parent.offsetWidth || window.outerWidth;
				
				wTop = targets.parent.offsetTop;
				wLeft = targets.parent.offsetLeft;
				
				heightDiff = tHeight - wHeight;
				widthDiff = tWidth - wWidth;
				
				$self.utils.resetTransition(targets.x);
				$self.utils.resetTransition(targets.y);
				
				matrices = {
					x : $self.utils.getMatrix(targets.x),
					y : $self.utils.getMatrix(targets.y)
				};
				
				// Stop the current move
				$self.utils.setTransform(targets.x, matrices.x.translate(0, 0));
				$self.utils.setTransform(targets.y, matrices.y.translate(0, 0));
				
				// Stop scrollbars
				$self.utils.updateScrollbarPosition({
					targets : targets,
					el : targets.x,
					outer : wWidth,
					inner : tWidth,
					position : offset
				});

				$self.utils.updateScrollbarPosition({
					targets : targets,
					el : targets.y,
					outer : wHeight,
					inner : tHeight,
					position : offset
				});
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
				
				oldDifferences = oldDifferences || currentTouches;
				
				direction = {
					x : (currentTouches.x - oldDifferences.x >= 0),
					y : (currentTouches.y - oldDifferences.y >= 0)
				};

				if (!activeAxis) {
					activeAxis = {};

					activeAxis.x = (Math.abs(touchDifferences.x) >= Math.abs(touchDifferences.y));
					activeAxis.y = (Math.abs(touchDifferences.x) <= Math.abs(touchDifferences.y));
				} else if (doubleCheckAxis === null) {
					doubleCheckAxis = Math.abs(Math.abs(touchDifferences.x) - Math.abs(touchDifferences.y)) <= 5;

					if (doubleCheckAxis) {
						activeAxis.x = true;
						activeAxis.y = true;
					}
				}
				
				offset = targets.content.getBoundingClientRect();
				
				if (widthDiff > 0 && activeAxis.x) {
					if (offset.left > 0 || Math.abs(offset.left) > widthDiff) {
						matrices.x = $self.utils.getMatrix(targets.x);
						touchDifferences.x = (currentTouches.x - oldDifferences.x) * 0.5;
					}

					$self.utils.setTransform(targets.x, matrices.x.translate(touchDifferences.x, 0));

					$self.utils.updateScrollbarPosition({
						targets : targets,
						el : targets.x,
						outer : wWidth,
						inner : tWidth,
						position : offset
					});
				}

				if (heightDiff > 0 && activeAxis.y) {

					if (offset.top > 0 || Math.abs(offset.top) > heightDiff) {
						matrices.y = $self.utils.getMatrix(targets.y);
						touchDifferences.y = (currentTouches.y - oldDifferences.y) * 0.5;
					}

					$self.utils.setTransform(targets.y, matrices.y.translate(0, touchDifferences.y));

					$self.utils.updateScrollbarPosition({
						targets : targets,
						el : targets.y,
						outer : wHeight,
						inner : tHeight,
						position : offset
					});
				}
				
				oldDifferences = currentTouches;

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
				
				if (!log.length || (log.length < 2)) {
					$self.utils.hideScrollbars(targets.parent);
					return;
				}
				
				log.reverse();

				lastTouches = function() {
					var sum = {
						x : 0,
						y : 0
					};
					
					for (var i = 0, j = log.length; i < j; i++) {
						sum.x += Math.abs(log[i].touchDifferences.x);
						sum.y += Math.abs(log[i].touchDifferences.y);
					}

					var avg = {
						x : (sum.x / log.length) * ((direction.x) ? 1 : -1),
						y : (sum.y / log.length) * ((direction.y) ? 1 : -1)
					};

					return avg;
				}();
				
				var noMovement;
				
				if ((activeAxis.x && !lastTouches.x) || (activeAxis.y && !lastTouches.y)) {
					noMovement = true;
				}

				lastTime = log.length ? ((log[0].time - log[log.length - 1].time) * 2) : 0;
				
				endDisplacement = {
					x : endTouches.x - startTouches.x,
					y : endTouches.y - startTouches.y
				};

				velocity = {
					x : (lastTouches.x / lastTime),
					y : (lastTouches.y / lastTime)
				};
				
				endDuration = {
					x : Math.min(Math.abs($self.vars.velocityMultiplier - (velocity.x * $self.vars.velocityMultiplier)), $self.vars.maxDuration),
					y : Math.min(Math.abs($self.vars.velocityMultiplier - (velocity.y * $self.vars.velocityMultiplier)), $self.vars.maxDuration)
				};
				// endDuration = {
				// 	x : Math.abs($self.vars.velocityMultiplier - (velocity.x * $self.vars.velocityMultiplier)),
				// 	y : Math.abs($self.vars.velocityMultiplier - (velocity.y * $self.vars.velocityMultiplier))
				// };
				
				end = {
					x : (endDuration.x * velocity.x),
					y : (endDuration.y * velocity.y)
				};
				
				if (Math.abs(end.x) > $self.vars.maxDistance) {
					end.x = (end.x >= 0) ? $self.vars.maxDistance : -$self.vars.maxDistance;
				}
				
				if (Math.abs(end.y) > $self.vars.maxDistance) {
					end.y = (end.y >= 0) ? $self.vars.maxDistance : -$self.vars.maxDistance;
				}
				
				var dims = {
					x : (offset.left + end.x),
					y : (offset.top + end.y)
				};
				
				var bounds = {
					top : (dims.y) > wTop,
					right : Math.abs(dims.x) > widthDiff,
					bottom : Math.abs(dims.y) > heightDiff,
					left : dims.x > wLeft
				};
				
				var _timer = {
					x : 0,
					y : 0
				}, bounce = {};
				
				var minDuration = 400, maxDuration = 600;
				
				var newDuration = {
					x : Math.min(maxDuration, Math.max(minDuration, maxDuration * Math.abs(velocity.x))),
					y : Math.min(maxDuration, Math.max(minDuration, maxDuration * Math.abs(velocity.y)))
				};
				
				if (heightDiff > 0 && activeAxis.y && (bounds.top || bounds.bottom)) {
					endDuration.y = newDuration.y;
					noMovement = false;
					
					if (bounds.top) {
						if (offset.top < 0) {
							bounce.y = -(offset.top - wTop);
							
							if ((end.y - bounce.y) > (wHeight / 2)) {
								end.y = bounce.y + 100;
							}
							
							_timer.y = true;
						} else {
							end.y = -(offset.top - wTop);
						}
					} else if (bounds.bottom) {
						if (Math.abs(offset.top) < heightDiff) {
							bounce.y = -(heightDiff) - (offset.top - wTop);
							
							if ((end.y - bounce.y) < (wHeight / 2)) {
								end.y = bounce.y - 100;
							}
							
							_timer.y = true;
						} else {
							end.y = -(heightDiff) - (offset.top - wTop);
						}
					}
					
					if (_timer.y) {
						endDuration.y /= 2.5;
						
						$self.vars.endTimers.y = window.setTimeout(function() {
							$self.utils.setTransform(targets.y, matrices.y.translate(0, bounce.y));
						}, endDuration.y);
					}
				}
				
				if (widthDiff > 0 && activeAxis.x && (bounds.left || bounds.right)) {
					endDuration.x = newDuration.x;
					noMovement = false;
					
					if (bounds.left) {
						if (offset.left < 0) {
							bounce.x = -(offset.left - wLeft);
							
							if ((end.x - bounce.x) > (wWidth / 2)) {
								end.x = bounce.x + 100;
							}
							
							_timer.x = true;
						} else {
							end.x = -(offset.left - wLeft);
						}
					} else if (bounds.right) {
						if (Math.abs(offset.right) < widthDiff) {
							bounce.x = -(widthDiff) - (offset.left - wLeft);
							
							if ((end.x - bounce.x) < (wWidth / 2)) {
								end.x = bounce.x - 100;
							}
							
							_timer.x = true;
						} else {
							end.x = -(widthDiff) - (offset.left - wLeft);
						}
					}
					
					if (_timer.x) {
						endDuration.x /= 2.5;
					
						$self.vars.endTimers.x = window.setTimeout(function() {
							$self.utils.setTransform(targets.x, matrices.x.translate(bounce.x, 0));
						}, endDuration.x);
					}
				}
				
				if (noMovement) {
					$self.utils.hideScrollbars(targets.parent);
					return;
				}
				
				matrices = {
					x : $self.utils.getMatrix(targets.x),
					y : $self.utils.getMatrix(targets.y)
				};
				
				if (widthDiff > 0 && activeAxis.x) {
					$self.utils.resetTransition(targets.x, endDuration.x);
					$self.utils.setTransform(targets.x, matrices.x.translate(end.x, 0));
					
					// Add to queue
					$self.vars.touchActive++;
					
					$self.vars.easingTimers.x = window.setTimeout(function() {
						$self.vars.touchActive--;
					}, endDuration.x);
					
					$self.utils.updateScrollbarPosition({
						targets : targets,
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
				
				if (heightDiff > 0 && activeAxis.y) {
					$self.utils.resetTransition(targets.y, endDuration.y);
					$self.utils.setTransform(targets.y, matrices.y.translate(0, end.y));
					
					// Add to queue
					$self.vars.touchActive++;
					
					$self.vars.easingTimers.y = window.setTimeout(function() {
						$self.vars.touchActive--;
					}, endDuration.y);
					
					$self.utils.updateScrollbarPosition({
						targets : targets,
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
			object.target.addEventListener(key, eventListeners[key], false);
		}
		
		if (!$space.vars.windowListenerAttached) {
			window.addEventListener("scroll", $self.utils.checkScroll, false);
			$space.vars.windowListenerAttached = true;
		}
	};
	
	$self.renderScrollbars = function(object) {
		var targets = $self.utils.getTargets(object),
		    div, inner, ratio, dimension;
		
		inner = document.createElement("div");
		$space.utils.addClass(inner, $self.utils.parseClass("scrollbar"));
		$space.utils.addClass(inner, $self.utils.parseClass("scrollbar-inner"));
		
		div = document.createElement("div");
		$space.utils.addClass(div, $self.utils.parseClass("scrollbar"));
		$space.utils.addClass(div, $self.utils.parseClass("scrollbar-horizontal"));
		
		dimension = (targets.parent.offsetWidth || window.outerWidth);
		ratio = targets.content.offsetWidth / dimension;
		div.style.width = dimension / ratio + "px";
		
		if (ratio !== 1) {
			div.appendChild(inner);
			targets.parent.appendChild(div);
		}
		
		div = document.createElement("div");
		$space.utils.addClass(div, $self.utils.parseClass("scrollbar"));
		$space.utils.addClass(div, $self.utils.parseClass("scrollbar-vertical"));
		
		dimension = (targets.parent.offsetHeight || window.outerHeight);
		ratio = targets.content.offsetHeight / dimension;
		div.style.height = dimension / ratio + "px";
		
		if (ratio !== 1) {
			div.appendChild(inner.cloneNode(true));
			targets.parent.appendChild(div);
		}
		
		$self.vars._scrollTimer = window.setTimeout(function() {
			$self.utils.hideScrollbars(targets.parent);
		}, 800);
	};
	
	$self.prepView = function(object) {
		var targets = $self.utils.getTargets(object);
		
		var x = document.createElement("div");
		$space.utils.addClass(x, "ui-swipe-rivet");
		$space.utils.addClass(x, "ui-swipe-rivet-x-axis");
		
		var y = document.createElement("div");
		$space.utils.addClass(y, "ui-swipe-rivet");
		$space.utils.addClass(y, "ui-swipe-rivet-y-axis");
		
		var w = document.createElement("div");
		$space.utils.addClass(w, "ui-swipe-rivet");
		$space.utils.addClass(w, $self.utils.parseClass("wrapper"));
		
		x.appendChild(y);
		y.appendChild(w);
		
		while (targets.parent.firstChild) {
			w.appendChild(targets.parent.firstChild);
		}
		
		targets.parent.appendChild(x);
		
		$self.vars.object = null;
	};
	
	/*
	Function: init
	*/
	$self.init = function() {
		$self.prepView(object);
		$self.addEventListeners(object);
		$self.renderScrollbars(object);
	}();
});