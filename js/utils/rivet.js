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
	
	// Self reference
	var $self = this;
	
	/*
	Namespace: Swipe.UI.const
		Shared local constants
	*/
	
	/*
	constant: VELOCITY_MULTIPLIER
		Value to multiply the current velocity
		This is perhaps the most important definition in this namespace
		It's closely tied to the amount of friction the animation will throw
		So... try not to alter it.
	*/
	const VELOCITY_MULTIPLIER = 2000;
	
	/*
	constant: MAX_VELOCITY
		Maximum velocity to animate
	*/
	const MAX_VELOCITY = 1;
	
	/*
	constant: END_DISTANCE_MULTIPLIER
		Adds an extra 'oomph' to animation friction
	*/
	const END_DISTANCE_MULTIPLIER = 0.5;
	
	/*
	constant: NAMESPACE_CLASS
		All generated elements will use this namespace
	*/
	const NAMESPACE_CLASS = "ui-swipe-rivet";
	
	/*
	Namespace: Swipe.UI.vars
		Shared local variables
	*/
	$self.vars = {
		
		/*
		variable: endTimers
			Object to store timers to announce when friction animation ends
		*/
		endTimers : {},
		
		/*
		variable: scrollbarMatrices
			Object to store scrollbar matrices
		*/
		scrollbarMatrices : {}
	};
	
	/*
	Namespace: Swipe.UI.utils
		Shared local utilities
	*/
	$self.utils = {
		
		/*
		sub: parseClass
			Returns a class string prefixed with the current namespace class
		*/
		parseClass : function() {
			var suffix = arguments[1] || arguments[0],
			    prefix = arguments[1] ? arguments[0] : "";
			
			var value = prefix + NAMESPACE_CLASS + "-" + suffix;
			
			return value;
		},
		
		/*
		sub: checkScroll
			Bound on initialization, checks for scrolling on page, unless it's triggered by 
			an orientationchange event or likewise. The only time scroll should
			trigger is when user taps on the top bar to return to the top of the page.
			
			This function mimics that UX.
		*/
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
		
		/*
		sub: getTargets
			Returns an object of elements to target
			(e.g. container, content, axis wrappers)
		*/
		getTargets : function(object) {
			$self.vars.object = $self.vars.object || {
				view : object.target,
				parent : object.target.querySelector("section"),
				content : object.target.querySelector($self.utils.parseClass(".", "wrapper")),
				x : object.target.querySelector($self.utils.parseClass(".", "x-axis")),
				y : object.target.querySelector($self.utils.parseClass(".", "y-axis")),
				viewport : object.target.querySelector("viewport")
			};
			
			return $self.vars.object;
		},
		
		/*
		sub: setTransform
			Applies a matrix value to the target element
		*/
		setTransform : function(el, matrix) {
			if (el) {
				el.style.webkitTransform = matrix;
			}
		},

		/*
		sub: resetTransition
			Resets transition duration to a specific value or zero
		*/
		resetTransition : function(el, value) {
			if (el) {
				el.style.webkitTransitionDuration = ((typeof value !== "undefined") ? value : 150) + "ms";
			}
		},

		/*
		sub: getMatrix
			Returns the target element matrix
		*/
		getMatrix : function(el) {
			if (el) {
				var transform = window.getComputedStyle(el).webkitTransform,
				    matrix = new WebKitCSSMatrix(transform);

				return matrix;
			}
		},

		/*
		sub: logTouches
			Stores a log of the last three user touches on touchmove
			This will be used when calculating the user's velocity
		*/
		logTouches : function(object) {
			$self.vars.log = $self.vars.log || [];
			
			if ($self.vars.log.length === 5) {
				$self.vars.log.shift();
			}

			$self.vars.log.push(object);
		},

		/*
		sub: updateTouches
			Updates <logTouches> with the current touch values.
			Constantly polls to see if user has stopped dragging.
			If so, it adds a null value to the logger, used later
			to prevent touchend from firing.
		*/
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
		
		/*
		sub: showScrollbars
			Triggers the visibility of scrollbars
		*/
		showScrollbars : function(parent) {
			var scrollbars = parent.querySelectorAll($self.utils.parseClass(".", "scrollbar"));
			
			for (var i = 0, j = scrollbars.length; i < j; i++) {
				$space.utils.removeClass(scrollbars[i], $self.utils.parseClass("hidden"));
			}
		},
		
		/*
		sub: hideScrollbars
			Hides scrollbar visibility
		*/
		hideScrollbars : function(parent) {
			var scrollbars = parent.querySelectorAll($self.utils.parseClass(".", "scrollbar"));
			
			for (var i = 0, j = scrollbars.length; i < j; i++) {
				$space.utils.addClass(scrollbars[i], $self.utils.parseClass("hidden"));
			}
		},
		
		/*
		sub: updateScrollbarPosition
			Takes values based on current target position to update scrollbar positioning
		*/
		updateScrollbarPosition : function(object) {
			var parent = object.targets.parent,
			    target;
			
			$self.utils.showScrollbars(parent);
			
			var scrollbars = {
				x : parent.querySelector($self.utils.parseClass(".", "scrollbar-horizontal")),
				y : parent.querySelector($self.utils.parseClass(".", "scrollbar-vertical"))
			};
			
			var ratio, value, matrices, matrix, val;
			
			matrices = {
				x : $self.vars.scrollbarMatrices.x || $self.utils.getMatrix(scrollbars.x),
				y : $self.vars.scrollbarMatrices.y || $self.utils.getMatrix(scrollbars.y)
			};
			
			if (scrollbars.y && $space.utils.hasClass(object.el, "ui-swipe-rivet-y-axis")) {
				ratio = -(object.position.top - object.offset) / object.inner;
				val = Math.min(Math.max(object.outer * ratio, 0), object.outer - (scrollbars.y.offsetHeight + 8));
				
				value = {
					x : 0,
					y : val
				};
				
				target = scrollbars.y;
				matrix = matrices.y;
				
				if ($self.vars.outsideBoundary) {
					if (!target.getAttribute("data-original-height")) {
						target.setAttribute("data-original-height", parseFloat(target.firstChild.offsetHeight));
					}
					
					var oHeight = parseFloat(target.getAttribute("data-original-height"));
					$self.vars.minus = $self.vars.minus || oHeight;
					
					if (object.position.top - object.offset > 0) {
						$self.vars.minus -= $self.vars.touchDifferences.y;
					} else {
						$self.vars.minus += $self.vars.touchDifferences.y;
						value.y += oHeight - Math.min(Math.max($self.vars.minus, 10), oHeight);
					}
					target.firstChild.style.height = Math.min(Math.max($self.vars.minus, 10), oHeight) + "px";
				} else {
					if (target.getAttribute("data-original-height")) {
						$self.vars.minus = null;
						target.firstChild.style.height = target.getAttribute("data-original-height") + "px";
					}
				}
				
			} else if (scrollbars.x) {
				ratio = -(object.position.left - object.offset) / object.inner;
				val = Math.min(Math.max(object.outer * ratio, 0), object.outer - (scrollbars.x.offsetWidth + 8));
				
				value = {
					x : val,
					y : 0
				};
				target = scrollbars.x;
				matrix = matrices.x;
				
				if ($self.vars.outsideBoundary) {
					if (!target.getAttribute("data-original-width")) {
						target.setAttribute("data-original-width", parseFloat(target.firstChild.offsetWidth));
					}
					
					var oWidth = parseFloat(target.getAttribute("data-original-width"));
					$self.vars.minus = $self.vars.minus || oWidth;
					
					if (object.position.left - object.offset > 0) {
						$self.vars.minus -= $self.vars.touchDifferences.x;
					} else {
						$self.vars.minus += $self.vars.touchDifferences.x;
						value.x += oWidth - Math.min(Math.max($self.vars.minus, 10), oWidth);
					}
					target.firstChild.style.width = Math.min(Math.max($self.vars.minus, 10), oWidth) + "px";
				} else {
					if (target.getAttribute("data-original-width")) {
						$self.vars.minus = null;
						target.firstChild.style.width = target.getAttribute("data-original-width") + "px";
					}
				}
				
			}
			
			if (target) {
				$self.utils.resetTransition(target, object.duration);
				$self.utils.setTransform(target, matrix.translate(value.x, value.y));

				$self.vars.scrollbarMatrices = matrices;

				if (object.duration) {
					$self.vars.minus = null;
					
					if (target.getAttribute("data-original-height")) {
						$self.utils.setTransform(target, matrix.translate(0, val));
						target.firstChild.style.height = target.getAttribute("data-original-height") + "px";
					} else if (target.getAttribute("data-original-width")) {
						$self.utils.setTransform(target, matrix.translate(val, 0));
						target.firstChild.style.width = target.getAttribute("data-original-width") + "px";
					}
					
					$self.vars._scrollTimer = window.setTimeout(function() {
						$self.utils.hideScrollbars(object.targets.parent);
					}, object.duration);
				}
			}
		},
		
		/*
		sub: zeroValues
			Resets values set on previous touch events, giving a clean slate to the current touch
		*/
		zeroValues : function() {
			if ($self.vars.endTimers) {
				window.clearTimeout($self.vars.endTimers.x);
				window.clearTimeout($self.vars.endTimers.y);
			}
			
			if ($self.vars._scrollTimer) {
				window.clearTimeout($self.vars._scrollTimer);
			}
			
			$self.vars.log = [];
		},
		
		getOffsets : function(el) {
			var offsets = {
				left : 0,
				top : 0
			};
			
			var target = el;
			
			while (target.parentNode) {
				offsets.left += target.offsetLeft;
				offsets.top += target.offsetTop;
				
				target = target.parentNode;
			}
			
			return offsets;
		},
		
		resetXY : function(targets, value) {
			// Reset x/y transition duration
			$self.utils.resetTransition(targets.x, value);
			$self.utils.resetTransition(targets.y, value);
			
			// Reset x/y starting matrices
			var matrices = {
				x : $self.utils.getMatrix(targets.x),
				y : $self.utils.getMatrix(targets.y)
			};
			
			// Stop the current move
			$self.utils.setTransform(targets.x, matrices.x.translate(0, 0));
			$self.utils.setTransform(targets.y, matrices.y.translate(0, 0));
			
			return matrices;
		}
	};
	
	/*
	Namespace: Swipe.UI
		Under the Swipe.UI Local Namespace
	*/
	
	/*
	Function: addEventListeners
		Adds event listeners to element targets
	*/
	$self.addEventListeners = function(object) {
		
		// Shortcuts
		var targets = $self.utils.getTargets(object);
		
		// Local variables
		var touch, offset, scale, noMovement,
		    matrices = {}, log, logDiff, docOffsets,
		    startTime, startTouches = {},
		    currentTouches = {}, touchDifferences = {},
		    tHeight, bHeight, heightDiff, bTop, bLeft,
		    tWidth, bWidth, widthDiff, oldDifferences = {},
		    activeAxis, doubleCheckAxis, direction,
		    lastTouches, lastTime, velocity, endDuration, end;
		
		var eventListeners = {
			touchstart : function(e) {
				
				// Reset values
				$self.utils.zeroValues();
				$self.vars.touchActive = $self.vars.touchActive || 0;
				oldDifferences = null;
				noMovement = null;
				
				// If touch is not active, reset related axis properties
				// Otherwise, we need to preserve those values but reset the scroll
				if (!$self.vars.touchActive) {
					activeAxis = null;
					doubleCheckAxis = null;
					$self.vars.easingTimers = {};
				} else {
					window.clearTimeout($self.vars.easingTimers.x);
					window.clearTimeout($self.vars.easingTimers.y);
					$self.vars.touchActive = 0;
				}
				
				// Current touch
				touch = e.touches[0];
				
				// Store starting touch values
				startTouches = {
					x : touch.pageX,
					y : touch.pageY
				};
				
				// Store starting time
				startTime = new Date().getTime();
				
				// Store starting content boundaries
				offset = targets.content.getBoundingClientRect();
				
				// Store content width/height
				tWidth = targets.content.offsetWidth;
				tHeight = targets.content.offsetHeight;
				
				// Store parent boundary width/height
				bWidth = targets.parent.offsetWidth || window.outerWidth;
				bHeight = targets.parent.offsetHeight || window.outerHeight;
				
				// Get offset based on document
				docOffsets = $self.utils.getOffsets(targets.parent);
				
				// Store parent boundary top/left
				bTop = docOffsets.top;
				bLeft = docOffsets.left;
				
				// Store parent/content height/width difference
				heightDiff = tHeight - bHeight;
				widthDiff = tWidth - bWidth;
				
				// Reset x/y transition duration
				matrices = $self.utils.resetXY(targets);
				
				// Stop x axis scrollbar
				$self.utils.updateScrollbarPosition({
					targets : targets,
					el : targets.x,
					outer : bWidth,
					inner : tWidth,
					position : offset,
					offset : bLeft
				});

				// Stop y axis scrollbar
				$self.utils.updateScrollbarPosition({
					targets : targets,
					el : targets.y,
					outer : bHeight,
					inner : tHeight,
					position : offset,
					offset : bTop
				});
			},

			touchmove : function(e) {
				
				// Prevent native scroll interaction
				e.preventDefault();
				
				// If timer was active, clear it
				if ($self.vars._touchMoveTimer) {
					window.clearTimeout($self.vars._touchMoveTimer);
				}
				
				// Current touch
				touch = e.touches[0];
				
				// Store current x/y touches
				currentTouches = {
					x : touch.pageX,
					y : touch.pageY
				};
				
				// Calculate differences between current x/y touches and start x/y touches
				touchDifferences = $self.vars.touchDifferences = {
					x : currentTouches.x - startTouches.x,
					y : currentTouches.y - startTouches.y
				};
				
				// Store the old differences for use later
				oldDifferences = oldDifferences || currentTouches;
				
				// Calculate which direction the user is scrolling
				// (true = right/down), (false = left/up)
				direction = $self.vars.direction = {
					x : (currentTouches.x - oldDifferences.x >= 0),
					y : (currentTouches.y - oldDifferences.y >= 0)
				};
				
				// The activeAxis object detects if the user has locked the axis based on touch movement
				// If this is not present, the user has either not began a scroll,
				// or began the scroll in a diagonal motion
				if (!activeAxis) {
					
					// Define the activeAxis object
					activeAxis = {};
					
					// Set the activeAxis based on dominance (if x > y, x is active. Or vice versa.)
					// OR if there is only one axis to animate
					activeAxis.x = !heightDiff || (widthDiff > 0 && (Math.abs(touchDifferences.x) >= Math.abs(touchDifferences.y)));
					activeAxis.y = !widthDiff || (heightDiff > 0 && (Math.abs(touchDifferences.x) <= Math.abs(touchDifferences.y)));
					
				// The doubleCheckAxis variable does just that. Has a second pass at the current axis
				// Looking for an x/y difference of no more than five. If less, the axis is locked.
				// If more, User wants a free-scroll and the axis is released.
				} else if (doubleCheckAxis === null) {
					
					// If differences is no more than five
					doubleCheckAxis = Math.abs(Math.abs(touchDifferences.x) - Math.abs(touchDifferences.y)) <= 5;
					
					// If true, we've double-checked the axes
					if (doubleCheckAxis) {
						activeAxis.x = true;
						activeAxis.y = true;
					}
				}
				
				// Current target boundaries
				offset = targets.content.getBoundingClientRect();
				
				// If the width difference is greater than zero,
				// AND the activeAxis is locked at x,
				// We're scrolling horizontally
				if (widthDiff > 0 && activeAxis.x) {
					
					// If the current target's left boundary is greater than zero,
					// OR if the absolute value of the target's left boundary IS GREATER THAN the width difference
					// THEN we're past our boundary. For this, we decrease the touch movement by half.
					// This prevents the content from ever scrolling off-screen
					if (offset.left - bLeft > 0 || (Math.abs(offset.left) + bLeft) > widthDiff) {
						matrices.x = $self.utils.getMatrix(targets.x);
						touchDifferences.x = (currentTouches.x - oldDifferences.x);
						$self.vars.outsideBoundary = true;
					} else {
						$self.vars.outsideBoundary = false;
					}
					
					// Update only if we have more than one touch logged
					// We need at least two for the touchend event to do its analysis
					if ($self.vars.log.length > 1) {
						
						// Set the x-axis transform based on the differences in touch
						$self.utils.setTransform(targets.x, matrices.x.translate(touchDifferences.x, 0));

						// Update x-axis scrollbar
						$self.utils.updateScrollbarPosition({
							targets : targets,
							el : targets.x,
							outer : bWidth,
							inner : tWidth,
							position : offset,
							offset : bLeft
						});
						
					}
				}

				// If the height difference is greater than zero,
				// And the activeAxis is locked at y,
				// We're scrolling vertically
				if (heightDiff > 0 && activeAxis.y) {
					
					// If the current target's top boundary is greater than zero,
					// OR if the absolute value of the target's top boundary IS GREATER THAN the height difference
					// THEN we're past our boundary. For this, we decrease the touch movement by half.
					// This prevents the content from ever scrolling off-screen
					if (offset.top - bTop > 0 || (Math.abs(offset.top) + bTop) > heightDiff) {
						matrices.y = $self.utils.getMatrix(targets.y);
						touchDifferences.y = (currentTouches.y - oldDifferences.y);
						$self.vars.outsideBoundary = true;
					} else {
						$self.vars.outsideBoundary = false;
					}
					
					// Update only if we have more than one touch logged
					// We need at least two for the touchend event to do its analysis
					if ($self.vars.log.length > 1) {
						
						// Set the y-axis transform based on the differences in touch
						$self.utils.setTransform(targets.y, matrices.y.translate(0, touchDifferences.y));
						
						// Update y-axis scrollbar
						$self.utils.updateScrollbarPosition({
							targets : targets,
							el : targets.y,
							outer : bHeight,
							inner : tHeight,
							position : offset,
							offset : bTop
						});
						
					}
				}
				
				// Keep a log of the previous difference
				oldDifferences = currentTouches;
				
				// Update touch log
				$self.utils.updateTouches(touchDifferences);
				
			},

			touchend : function(e) {
				
				// Reset x/y transition duration
				matrices = $self.utils.resetXY(targets, 0);
				
				// Future proofing
				// Log the current scale
				scale = e.scale;

				// Current element boundaries
				// offset = targets.content.getBoundingClientRect();

				// Store the touch log
				log = $self.vars.log;

				// If log is empty, OR if only one touch has been logged,
				// THEN there are not enough touches to constitute a swipe
				// and the movement should stop without ease
				if (!log.length || log.length < 2) {
					noMovement = true;
					
					activeAxis = activeAxis || {};
					
					endDuration = {
						x : 0,
						y : 0
					};
					
					endDistance = {
						x : 0,
						y : 0
					};
				} else {
					
					// Reverse the log.
					// This will make calculating the lastTouches much easier.
					log.reverse();

					// Average out the touches in the log.
					// That is, the sum of all touches divided by the total amount of touches.
					// This value helps us find a consistent velocity amount to use.
					// If we only used the previous touch, The value could be skewed in speed.
					lastTouches = function() {

						// Original values
						var sum = {
							x : 0,
							y : 0
						};

						// Add touchDifferences values to sum
						for (var i = 0, j = log.length; i < j; i++) {
							sum.x += Math.abs(log[i].touchDifferences.x);
							sum.y += Math.abs(log[i].touchDifferences.y);
						}

						// Find the average values
						var avg = {

							// Total x-axis value divided by the total amount of x-touches
							// Negate (or not) based on scroll direction
							x : (sum.x / log.length) * ((direction.x) ? 1 : -1),

							// Total y-axis value divided by the total amount of y-touches
							// Negate (or not) based on scroll direction
							y : (sum.y / log.length) * ((direction.y) ? 1 : -1)
						};

						// Return the averages object
						return avg;
					}();

					// Calculate the time between the first and last logged touch events
					lastTime = log.length ? ((log[0].time - log[log.length - 1].time) * 2) : 0;

					// If activeAxis is x AND there are no x-axis lastTouches logged
					// OR if activeAxis is y AND there are no y-axis lastTouches logged
					// THEN the user has stopped the swipe. Flag as such.
					if ((activeAxis.x && !lastTouches.x) || (activeAxis.y && !lastTouches.y)) {
						noMovement = true;
					}

					// Calculate the velocity of the swipe
					// Divide the x/y lastTouches by the time between the first and last logged touch events
					velocity = {
						x : Math.min(Math.max((lastTouches.x / lastTime), -MAX_VELOCITY), MAX_VELOCITY),
						y : Math.min(Math.max((lastTouches.y / lastTime), -MAX_VELOCITY), MAX_VELOCITY)
					};

					// Calculate the animation duration amount
					// RETURN the minimum value
					// OF the absolute value
					//   OF the global velocityMultiplier
					//   MINUS the x/y velocity MULTIPLIED BY the global velocityMultiplier
					// OR the global maxDuration
					endDuration = {
						x : Math.abs((Math.abs(velocity.x) * VELOCITY_MULTIPLIER + Math.abs(VELOCITY_MULTIPLIER / lastTouches.x) * 3)),
						y : Math.abs((Math.abs(velocity.y) * VELOCITY_MULTIPLIER + Math.abs((VELOCITY_MULTIPLIER / lastTouches.y) * 3)))
					};

					// Calculate the end x/y position
					// Multiply the x/y animation duration amount by the velocity of the swipe
					endDistance = {
						x : ((endDuration.x + (endDuration.x * END_DISTANCE_MULTIPLIER)) * velocity.x),
						y : ((endDuration.y + (endDuration.y * END_DISTANCE_MULTIPLIER)) * velocity.y)
					};

				}
				
				// console.log(endDuration.y + ", " + endDistance.y);
	
				// Current element boundaries
				offset = targets.content.getBoundingClientRect();
			
				// Store dimensions based on eventual movement
				var dims = {

					// Current element left position plus ending x-value
					x : (offset.left + endDistance.x),

					// Current element top position plus ending y-value
					y : (offset.top + endDistance.y)
				};

				// Calculate element boundaries
				var bounds = {

					// True if eventual y-movement is greater than top boundary
					top : (dims.y) > bTop,

					// True if absolute value of eventual x-movement is greater than width difference
					right : Math.abs(dims.x) > (widthDiff - bLeft),

					// True if absolute value of eventual y-movement is greater than height difference
					bottom : Math.abs(dims.y) > (heightDiff - bTop),

					// True if eventual x-movement is greater than left boundary
					left : dims.x > bLeft
				};

				// Initial timer/bounce objects
				var _timer = {
					x : 0,
					y : 0
				}, bounce = {};

				// Min/max boundary duration times
				var minDuration = 400, maxDuration = 600;

				// Calculate new boundary duration times
				// The minimum value
				// OF the max boundary duration
				// OR the maximum value
				//   OF the minimum value
				//   OR the maximum duration MULTIPLIED BY the absolute value of x/y velocity
				var newDuration = {
					x : 600,
					y : 600
				};

				// If the difference in height is greater than zero
				// AND the activeAxis is vertical
				// AND either the top or bottom bounds have been breached
				if (heightDiff > 0 && activeAxis.y && (bounds.top || bounds.bottom)) {

					// endDuration is now the newDuration property
					endDuration.y = newDuration.y;

					// We have movement!
					// We need to. Otherwise the bounds won't snap to the edges if the user stops the swipe.
					noMovement = false;

					// If top boundary has been breached
					if (bounds.top) {

						// If top element boundary is less than zero,
						// We need to create a bounce effect to mimic native UX
						if (offset.top < 0) {
						
							// Bounce distance is the amount to travel
							bounce.y = -(offset.top - bTop);
						
							// A check for the maximum amount allowed to bounce
							// If the end y value minus the bounce amount is greater than half of the boundary height
							// We've reached the maximum. Set the y value to only the bounce amount plus 100
							if ((endDistance.y - bounce.y) > (bHeight / 2)) {
								endDistance.y = bounce.y + 100;
							}
						
							// Yes, we will require a timer.
							_timer.y = true;
						
						// Otherwise, user is trying to scroll higher than boundary
						// And we can just snap to boundary
						} else {
							endDistance.y = -(offset.top - bTop);
						}

					// Otherwise if bottom boundary has been breached
					} else if (bounds.bottom) {

						// If the absolute value of the top boundary is less than the height difference,
						// We need to create a bounce effect to mimic native UX
						if (Math.abs(offset.top) < (heightDiff - bTop)) {

							// Bounce distance is the amount to travel
							bounce.y = -(heightDiff) - (offset.top - bTop);

							// A check for the maximum amount allowed to bounce
							// If the end y value minus the bounce amount is less than half of the boundary height
							// We've reached the maximum. Set the y value to only the bounce amount minus 100
							if ((endDistance.y - bounce.y) < (bHeight / 2)) {
								endDistance.y = bounce.y - 100;
							}

							// Yes, we will require a timer.
							_timer.y = true;

						// Otherwise, user is trying to scroll higher than boundary
						// And we can just snap to boundary
						} else {
							endDistance.y = -(heightDiff) - (offset.top - bTop);
						}
					}

					// If a timer is required
					if (_timer.y) {

						// Shorten the endDuration amount by 2.5x
						endDuration.y /= 2.5;

						// And set the timer to fire at the new amount
						$self.vars.endTimers.y = window.setTimeout(function() {

							// Animate to bounce distance
							$self.utils.resetTransition(targets.y, endDuration.y * 4);
							$self.utils.setTransform(targets.y, matrices.y.translate(0, bounce.y));

						}, endDuration.y);
					}
				}

				// If the difference in width is greater than zero
				// AND the activeAxis is horizontal
				// AND either the left or right bounds have been breached
				if (widthDiff > 0 && activeAxis.x && (bounds.left || bounds.right)) {

					// endDuration is now the newDuration property
					endDuration.x = newDuration.x;

					// We have movement!
					// We need to. Otherwise the bounds won't snap to the edges if the user stops the swipe.
					noMovement = false;

					// If left boundary has been breached
					if (bounds.left) {

						// If left element boundary is less than zero,
						// We need to create a bounce effect to mimic native UX
						if (offset.left < 0) {

							// Bounce distance is the amount to travel
							bounce.x = -(offset.left - bLeft);

							// A check for the maximum amount allowed to bounce
							// If the end y value minus the bounce amount is greater than half of the boundary width
							// We've reached the maximum. Set the x value to only the bounce amount plus 100
							if ((endDistance.x - bounce.x) > (bWidth / 2)) {
								endDistance.x = bounce.x + 100;
							}

							// Yes, we will require a timer.
							_timer.x = true;

						// Otherwise, user is trying to scroll wider than boundary
						// And we can just snap to boundary
						} else {
							endDistance.x = -(offset.left - bLeft);
						}

					// Otherwise if right boundary has been breached
					} else if (bounds.right) {

						// If the absolute value of the right boundary is less than the width difference,
						// We need to create a bounce effect to mimic native UX
						if (Math.abs(offset.right) < (widthDiff - bLeft)) {

							// Bounce distance is the amount to travel
							bounce.x = -(widthDiff) - (offset.left - bLeft);

							// A check for the maximum amount allowed to bounce
							// If the end x value minus the bounce amount is less than half of the boundary width
							// We've reached the maximum. Set the x value to only the bounce amount minus 100
							if ((endDistance.x - bounce.x) < (bWidth / 2)) {
								endDistance.x = bounce.x - 100;
							}

							// Yes, we will require a timer.
							_timer.x = true;

						// Otherwise, user is trying to scroll wider than boundary
						// And we can just snap to boundary
						} else {
							endDistance.x = -(widthDiff) - (offset.left - bLeft);
						}
					}

					// If a timer is required
					if (_timer.x) {

						// Shorten the endDuration amount by 2.5x
						endDuration.x /= 2.5;

						// And set the timer to fire at the new amount
						$self.vars.endTimers.x = window.setTimeout(function() {

							// Animate to bounce distance
							$self.utils.resetTransition(targets.x, endDuration.x * 4);
							$self.utils.setTransform(targets.x, matrices.x.translate(bounce.x, 0));

						}, endDuration.x);
					}
				}
				
				// If noMovement is still true
				// Hide the scrollbars and return.
				if (noMovement) {
					$self.utils.hideScrollbars(targets.parent);
					return;
				}
				
				// Refresh x/y matrices
				matrices = {
					x : $self.utils.getMatrix(targets.x),
					y : $self.utils.getMatrix(targets.y)
				};
				
				// If difference in width is greater than zero
				// AND activeAxis is horizontal
				if (widthDiff > 0 && activeAxis.x) {
					
					// Set x-axis transition duration to new endDuration value
					$self.utils.resetTransition(targets.x, endDuration.x);
					
					// Set x-axis point to animate to
					$self.utils.setTransform(targets.x, matrices.x.translate(endDistance.x, 0));
					
					// Add to queue
					$self.vars.touchActive++;
					
					// Add easingTimer timeout. This helps to keep the axis locked if user want to continue swiping
					$self.vars.easingTimers.x = window.setTimeout(function() {
						$self.vars.touchActive--;
					}, endDuration.x);
					
					// Update the scrollbar position
					$self.utils.updateScrollbarPosition({
						targets : targets,
						el : targets.x,
						outer : bWidth,
						inner : tWidth,
						position : {
							left : offset.left + endDistance.x,
							top : offset.top + endDistance.y
						},
						offset : bLeft,
						duration : endDuration.x
					});
				}
				
				// If difference in height is greater than zero
				// AND activeAxis is vertical
				if (heightDiff > 0 && activeAxis.y) {
					
					// Set y-axis transition duration to new endDuration value
					$self.utils.resetTransition(targets.y, endDuration.y);
					
					// Set y-axis point to animate to
					$self.utils.setTransform(targets.y, matrices.y.translate(0, endDistance.y));
					
					// Add to queue
					$self.vars.touchActive++;
					
					// Add easingTimer timeout. This helps to keep the axis locked if user want to continue swiping
					$self.vars.easingTimers.y = window.setTimeout(function() {
						$self.vars.touchActive--;
					}, endDuration.y);
					
					// Update the scrollbar position
					$self.utils.updateScrollbarPosition({
						targets : targets,
						el : targets.y,
						outer : bHeight,
						inner : tHeight,
						position : {
							left : offset.left + endDistance.x,
							top : offset.top + endDistance.y
						},
						offset : bTop,
						duration : endDuration.y
					});
				}
				
			}
		};
		
		// Add event listeners to the target element
		for (var key in eventListeners) {
			targets.parent.addEventListener(key, eventListeners[key], false);
		}
		
		// Add window listener only once.
		if (!$space.vars.windowListenerAttached) {
			
			// Event listener
			window.addEventListener("scroll", $self.utils.checkScroll, false);
			
			// Disable native touch
			document.addEventListener("touchmove", function(e) {
				e.preventDefault();
			}, false);
			
			// Flag to add only once
			$space.vars.windowListenerAttached = true;
		}
	};
	
	/*
	Function: renderScrollbars
		Generates scrollbar HTML
	*/
	$self.renderScrollbars = function(object) {
		var targets = $self.utils.getTargets(object),
		    div, inner, ratio, dimension;
		
		// Ensure targets are visible for the rendering
		targets.view.style.display = "block";
		
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
		
		// Reset styling
		targets.view.style.display = "";
		
		$self.vars._scrollTimer = window.setTimeout(function() {
			$self.utils.hideScrollbars(targets.parent);
		}, 800);
	};
	
	/*
	Function: prepView
		Wraps parent in two divs in order to individually track x/y axes
	*/
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
		Fires functions on initialization
	*/
	$self.init = function() {
		$self.prepView(object);
		$self.addEventListeners(object);
		$self.renderScrollbars(object);
	}();
});