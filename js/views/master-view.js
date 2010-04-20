/*
File: master-view.js

About: Version
	0.1 pre

Project: DupliKit

Description:
	DupliKit's Master View Controller

Requires:
	- <duplikit.js>
	- <rivet.js>
	
*/

/*
Class: DupliKit
	Scoped to the DupliKit Global Namespace
*/
var DupliKit = window.DupliKit || {};

/*
Namespace: DupliKit
	Under the DupliKit Local Namespace
*/
DupliKit = DupliKit || {};

/*
Namespace: DupliKit.MasterView
	Under the DupliKit.MasterView Local Namespace
*/
DupliKit.MasterView = (function (object) {
	
	// Storing a variable to reference
	var $space = DupliKit;
	
	// Self reference
	var $self = DupliKit.MasterView;
	
	/*
	Namespace: DupliKit.MasterView.vars
		Shared local variables
	*/
	$self.vars = {
		defaults : {
			showPopover : true,
			showScrollbars : true,
			showInstallReminder : false
		}
	};
	
	/*
	Namespace: DupliKit.MasterView.utils
		Shared local utilities
	*/
	$self.utils = {
		orientationChange : function(view) {
			var offset = window.innerHeight;
			view.style.height = offset - view.offsetTop + "px";
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
						$space.utils.Rivet.utils.checkScroll(null, "0", null, target);
						
					} else {
						console.log(xhr.status);
					}
				}
			};
			xhr.open("GET", src, true);
			xhr.send();
		},
		
		transitionTo : function(view, list, back) {
			
			function endTransition(target, offset, destination) {
				
				// Enable interaction
				window.setTimeout(function() {

					// Enable Rivet
					$space.utils.Rivet.utils.enableRivet();

					// Snap to top
					$space.utils.Rivet.utils.checkScroll(null, destination || "0", destination ? "0" : null);

					// Make sure the nested list is flush with the top boundary
					target.style.top = offset || "";
				}, 300);

			}
			
			// Small delay to let the hover class take effect
			window.setTimeout(function() {
			
				// Disable interaction during a transition
				$space.utils.Rivet.utils.disableRivet();
				
				// Get last created cache object
				var cache = $self.vars.cache;
				cache = cache[cache.length - 1];
				
				if (!cache) {
					return;
				}
				
				var wrap = view.querySelector($space.utils.parseClass(".", "rivet-wrapper"));
				var matrix = $space.utils.getMatrix(wrap);

				$space.utils.resetTransition(wrap, 300, "ease-out");
				$space.utils.setTransform(wrap, matrix.translate(320 * (back ? 1 : -1), 0));
				
				var offset = list.parentNode.offsetTop;
				
				// Set wrap height
				wrap.style.height = list.offsetHeight + "px";
				
				// Reposition nested list so that the transition doesn't look weird
				var transform = (wrap.getBoundingClientRect().top - view.offsetTop);
				
				// We need slightly different interactions for back/forward animations
				if (!back) {
					
					// Value should be the offset value plus the scrolled value
					list.style.top = -(offset + transform) + "px";
					
					// Add the current transform
					cache.transformValue = transform;
					endTransition(list, -offset + "px", null);
					
				} else {
					var parent = cache.list.parentNode;
					while (parent && parent.nodeName.toLowerCase() !== "ul") {
						parent = parent.parentNode;
					}
					
					if (parent) {

						// Set wrap height
						wrap.style.height = parent.offsetHeight + "px";
						
						transform = cache.transformValue;
						offset = parent.offsetTop;
						
						// Calculate the current transform value
						var newTransform = (wrap.getBoundingClientRect().top - view.offsetTop);
						
						// Add offset and old transform, subtract from new transform value
						var destination = (offset + transform) - newTransform;
						
						parent.style.top = destination + "px";
						endTransition(parent, null, destination);
						
						$self.vars.cache.pop();
					}
				}
				
			}, 0);
			
		},
		
		updateBackButton : function(view, list, text, old, back) {
			var target = view.parentNode.querySelector("viewport header"),
			    header, button;
			
			if (target) {
				
				if (!back) {
					$self.vars.cache = $self.vars.cache || [];
					$self.vars.cache.push({
						list : list,
						text : text,
						old : old
					});
				}
				
				// REMOVE!
				// button = target.querySelector("button"); if (button) {target.removeChild(button);}
				
				if (old) {
					button = document.createElement("button");

					$space.utils.addClass(button, $space.utils.parseClass("back-button"));
					
					if (back) {
						$space.utils.addClass(button, $space.utils.parseClass("slide-out"));
					}
					
					button.appendChild(document.createTextNode(old));

					$space.utils.bindHoverClass(button);
					button.addEventListener("touchend", function() {
						var cache = $self.vars.cache;

						var title = cache[cache.length - 2] || {
							text : $self.vars.mainTitle,
							old : null
						};

						$self.utils.transitionTo(view, list, true);
						$self.utils.updateBackButton(view, list, title.text, title.old, true);
					});

					target.appendChild(button);
					
					header = target.querySelector("h1").cloneNode(true);
					$space.utils.addClass(header, $space.utils.parseClass("slide-prep"));
					header.firstChild.nodeValue = text;
					
					if (back) {
						$space.utils.addClass(header, $space.utils.parseClass("slide-out"));
					}
					
					target.appendChild(header);
				}
				
				window.setTimeout(function() {
					$self.utils.animateHeader(target, back);
				}, 0);
				
			}
		},
		
		animateHeader : function(target, back) {
			var buttons = target.querySelectorAll("button"),
			    headers = target.querySelectorAll("h1");
			
			var hFirst = headers[0],
			    hSecond = headers[1];
			
			var bFirst = buttons[0],
			    bSecond = buttons[1];
			
			if (back) {
				if (hSecond) {
					$space.utils.removeClass(hFirst, $space.utils.parseClass("slide-in"));
					$space.utils.removeClass(hFirst, $space.utils.parseClass("slide-out"));
					
					$space.utils.addClass(hSecond, $space.utils.parseClass("slide-in"));
					$space.utils.removeClass(hSecond, $space.utils.parseClass("slide-out"));
				}
				
				$space.utils.removeClass(bFirst, $space.utils.parseClass("slide-in"));
				$space.utils.removeClass(bFirst, $space.utils.parseClass("slide-out"));
				
				if (bSecond) {
					$space.utils.addClass(bSecond, $space.utils.parseClass("slide-in"));
					$space.utils.removeClass(bSecond, $space.utils.parseClass("slide-out"));
				}
			} else {
				if (hSecond) {
					$space.utils.removeClass(hFirst, $space.utils.parseClass("slide-in"));
					$space.utils.addClass(hFirst, $space.utils.parseClass("slide-out"));
					
					$space.utils.removeClass(hSecond, $space.utils.parseClass("slide-out"));
					$space.utils.addClass(hSecond, $space.utils.parseClass("slide-in"));
				} else {
					$space.utils.removeClass(hFirst, $space.utils.parseClass("slide-out"));
					$space.utils.addClass(hFirst, $space.utils.parseClass("slide-in"));
				}
				
				if (bSecond) {
					$space.utils.removeClass(bFirst, $space.utils.parseClass("slide-in"));
					$space.utils.addClass(bFirst, $space.utils.parseClass("slide-out"));
					
					$space.utils.removeClass(bSecond, $space.utils.parseClass("slide-out"));
					$space.utils.addClass(bSecond, $space.utils.parseClass("slide-in"));
				} else {
					$space.utils.removeClass(bFirst, $space.utils.parseClass("slide-out"));
					$space.utils.addClass(bFirst, $space.utils.parseClass("slide-in"));
				}
			}
			
			if (hSecond) {
				window.setTimeout(function() {
					hFirst.parentNode.removeChild(hFirst);
				}, 300);
			}
			
			if (bSecond) {
				window.setTimeout(function() {
					bFirst.parentNode.removeChild(bFirst);
				}, 300);
			}
		},
		
		prepView : function(view) {
			new DupliKit.utils.Rivet(view, $self.vars.masterObject);
		},
		
		prepMasterObject : function(object) {
			var obj = {}, key;
			
			for (key in $self.vars.defaults) {
				obj[key] = $self.vars.defaults[key];
			}
			
			for (key in object) {
				obj[key] = object[key];
			}
			
			$self.vars.masterObject = obj;
			return $self.vars.masterObject;
		},
		
		buildControlObject : function(object) {
			var controlObject = {}, key;
			
			for (key in $self.vars.masterObject) {
				controlObject[key] = $self.vars.masterObject[key];
			}
			
			for (key in object) {
				controlObject[key] = object[key];
			}
			
			return controlObject;
		}
		
	};
	
	$self.detailPane = {
		
		vars : {},
		
		utils : {
			addEventListeners : function(view) {
				var section = view.querySelector("section"),
			        items = section.querySelectorAll("li"),
			        links = section.querySelectorAll("a");
				
				var _timer, _cell, _link, _list, _start, _current, _moved, i,
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
						$space.utils.Rivet.utils.enableRivet();
					}
				}

				function markActiveElement(e) {
					_cell = findItem(e.target);

					if (_cell) {
						var items = _cell.parentNode.querySelectorAll("li");

						for (var i = 0, j = items.length; i < j; i++) {
							$space.utils.removeClass(items[i], _hover);
						}

						handleNextStep();
					}
				}

				function handleNextStep() {
					var wrap = section.querySelector($space.utils.parseClass(".", "rivet-wrapper"));

					_list = _cell.querySelector("ul");
					_link = _cell.querySelector("a");

					if (_list) {
						var text = _cell.querySelector("span").firstChild.nodeValue;

						var oldText = _cell.parentNode.parentNode.querySelector(":root > span");

						if (!oldText) {
							oldText = section.parentNode.querySelector("viewport h1");
							$self.vars.mainTitle = $self.vars.mainTitle || oldText.firstChild.nodeValue;
						}

						if (oldText) {
							oldText = oldText.firstChild.nodeValue;
						}

						$self.utils.transitionTo(section, _list);
						$self.utils.updateBackButton(section, _list, text, oldText);
					} else if (_link) {
						$self.utils.loadPage(_link.getAttribute("rel"), wrap);
					}

					$space.utils.addClass(_cell, _hover);
					$space.utils.Rivet.utils.disableRivet();
				}

				section.addEventListener("touchstart", function(e) {
					var touch = e.touches[0];
					var target = e.target;

					_start = touch.pageY;

					while (target && !$space.utils.hasClass(target, _component)) {
						target = target.parentNode;
					}

					if (target) {
						_timer = window.setTimeout(function() {
							markActiveElement(e);
						}, 300);
					}
				}, false);

				section.addEventListener("touchmove", function(e) {
					_moved = true;
					_current = e.touches[0].pageY - _start;

					if (Math.abs(_current) > 10) {
						enableRivet();
					}
				});

				section.addEventListener("touchend", enableRivet);

				for (i = 0, j = links.length; i < j; i++) {
					var link = links[i];

					link.addEventListener("click", function(e) {
						e.preventDefault();
					}, false);
				}
				
				window.addEventListener("orientationchange", function() {
					$self.utils.orientationChange(section);
				}, false);
				
				$self.utils.orientationChange(section);
			},
			
			renderPopoverButton : function(view) {
				var target = view.parentNode.querySelector(".ui-dup-master-pane"),
				    body = document.body,
				    heading = view.querySelector("header h1");
				
				if (target && heading) {
					var button = document.createElement("button");
					var section = target.querySelector("section");
					
					$space.utils.addClass(button, $space.utils.parseClass("popover-trigger"));
					button.appendChild(document.createTextNode(heading.firstChild.nodeValue));
					
					var _anim = $space.utils.parseClass("popover-animating"),
					    _class = $space.utils.parseClass("popover-active");

					button.addEventListener("touchend", function() {
						$space.utils.addClass(body, _class);
					}, false);

					button.addEventListener("click", function(e) {
						e.preventDefault();
					}, false);

					$space.utils.bindHoverClass(button);
					
					// Append to DOM
					target.querySelector("viewport").appendChild(button);

					// Add mask to prevent content area from scrolling while popover is active
					var mask = document.createElement("div");
					$space.utils.addClass(mask, $space.utils.parseClass("popover-mask"));

					mask.addEventListener("touchend", function(e) {
						if ($space.utils.hasClass(body, _class)) {
							$space.utils.addClass(body, _anim);

							window.setTimeout(function() {
								$space.utils.removeClass(body, _anim);
								$space.utils.removeClass(body, _class);
							}, 500);
						}
					}, false);

					section.parentNode.insertBefore(mask, section);
				}
			}
		},
		
		init : function(view, popover) {
			this.utils.addEventListeners(view);
			
			if (popover) {
				this.utils.renderPopoverButton(view);
			}
			
			$self.utils.prepView(view);
		}
		
	};
	
	$self.masterPane = {
		
		vars : {},
		
		utils : {
			addEventListeners : function(view) {
				var header = view.querySelector("header"),
				    section = view.querySelector("section");
				
				window.addEventListener("orientationchange", function() {
					$self.utils.orientationChange(section);
				}, false);
				
				$self.utils.orientationChange(section);
				
				var masterObjectExtensions = {
					header : header,
					content : section,
					parentView : $self
				};
				
				for (var key in masterObjectExtensions) {
					$self.vars.masterObject[key] = masterObjectExtensions[key];
				}
			}
		},
		
		init : function(view) {
			this.utils.addEventListeners(view);
			$self.utils.prepView(view);
		}
		
	};
	
	$self.addControl = function(object) {
		
		if (object.type && DupliKit[object.type]) {
			var obj = $self.utils.buildControlObject(object);
			DupliKit[object.type](obj);
			
			// $self.utils.orientationChange(obj.content);
			
		} else {
			console.error("TabBarController module not included.");
		}
		
	};
	
	/*
	Function: init
	*/
	$self.init = function() {
		object = $self.utils.prepMasterObject(object);
		
		if (object.masterPane) {
			$self.masterPane.init(object.masterPane);
		}
		
		if (object.detailPane) {
			$self.detailPane.init(object.detailPane, object.showPopover);
		}
		
		$space.utils.handleProperties(object);
	}();
	
	return $self;
});