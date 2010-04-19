/*
File: tab-view.js

About: Version
	0.1 pre

Project: DupliKit

Description:
	DupliKit's Split View Controller

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
Namespace: DupliKit.UI
	Under the DupliKit.UI Local Namespace
*/
DupliKit.UI = DupliKit.UI || {};

/*
Namespace: DupliKit.UI.TabView
	Under the DupliKit.UI.TabView Local Namespace
*/
DupliKit.UI.TabView = (function (object, properties) {
	
	// Storing a variable to reference
	var $space = DupliKit;
	
	// Self reference
	var $self = DupliKit.UI.TabView;
	
	/*
	Namespace: DupliKit.UI.vars
		Shared local variables
	*/
	$self.vars = {};
	
	/*
	Namespace: DupliKit.UI.utils
		Shared local utilities
	*/
	$self.utils = {
		orientationChange : function(view, footer) {
			var offset = window.innerHeight - (footer ? footer.offsetHeight : 0);
			
			view.style.height = offset - view.offsetTop + "px";
			
			if (footer) {
				footer.style.top = offset + "px";
			}
		},
		
		updateHeader : function(header, newHeader, index) {
			if (newHeader) {
				newHeader.setAttribute("data-related-index", index);
				header.parentNode.appendChild(newHeader);
			} else {
				newHeader = header.parentNode.querySelector("header[data-related-index='" + index + "']");
			}
			
			var headers = header.parentNode.querySelectorAll("header");
			for (var i = 0, j = headers.length; i < j; i++) {
				$space.utils.addClass(headers[i], $space.utils.parseClass("hidden"));
			}
			
			$space.utils.removeClass(newHeader, $space.utils.parseClass("hidden"));
		},
		
		loadSection : function(src, header, target, index) {
			if ($self.vars.xhr) {
				$self.vars.xhr.abort();
			}
			
			if (src.charAt(0) === "#") {
				var active = target.querySelector(src),
				    children, newHeader;
				
				if (active) {
					newHeader = active.querySelector("header");
					$self.utils.updateHeader(header, newHeader, index);
					
					children = active.parentNode.querySelectorAll($space.utils.parseClass(".", "tab-view-content"));
					
					for (var i = 0, j = children.length; i < j; i++) {
						$space.utils.addClass(children[i], $space.utils.parseClass("tab-hidden"));
					}
					
					$space.utils.removeClass(active, $space.utils.parseClass("tab-hidden"));
				}

				$space.utils.Rivet.utils.checkScroll(null, "0", null, target);
				$space.utils.Rivet.utils.enableRivet();
			} else {
				
				$self.vars.xhr = new XMLHttpRequest();
				var xhr = $self.vars.xhr;

				xhr.onreadystatechange = function() {
					if (xhr.readyState === 4) {
						if (xhr.status === 200 || xhr.status === 304) {

							while (target.firstChild) {
								target.removeChild(target.firstChild);
							}

							var fragment = document.createDocumentFragment();
							var dummy = document.createElement("div");
							dummy.innerHTML = xhr.responseText;

							var newHeader = dummy.querySelector("header");
							$self.utils.updateHeader(header, newHeader, index);

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

						$space.utils.Rivet.utils.enableRivet();
						delete $self.vars.xhr;
					}
				};
				xhr.open("GET", src, true);
				xhr.send();
				
			}
		},
		
		loadSegment : function(target, src) {
			var active = target.querySelector(src),
			    children;
			
			if (active) {
				children = active.parentNode.querySelectorAll($space.utils.parseClass(".", "segmented-control-content"));
				
				for (var i = 0, j = children.length; i < j; i++) {
					$space.utils.addClass(children[i], $space.utils.parseClass("hidden"));
				}
				
				$space.utils.removeClass(active, $space.utils.parseClass("hidden"));
			}

			$space.utils.Rivet.utils.checkScroll(null, "0", null, target);
			$space.utils.Rivet.utils.enableRivet();
		},
		
		segmentedController : function(content, header) {
			var controller, target, link, active;
			controller = header.parentNode.querySelector($space.utils.parseClass(".", "segmented-control"));
			active = controller.querySelector($space.utils.parseClass(".", "segmented-control-active a"));
			
			header.parentNode.addEventListener("touchstart", function(e) {
				e.stopPropagation();
				
				controller = header.parentNode.querySelector($space.utils.parseClass(".", "segmented-control"));
				
				if (controller) {
					target = e.target;
					
					while (target && target !== controller) {
						if (target.nodeName.toLowerCase() === "a") {
							link = target;
						}
						
						target = target.parentNode;
					}
					
					if (target) {
						var controls = controller.querySelectorAll("li"),
						    _class = $space.utils.parseClass("segmented-control-active");
						
						for (var i = 0, j = controls.length; i < j; i++) {
							$space.utils.removeClass(controls[i], _class);
						}
						
						$space.utils.addClass(link.parentNode, _class);
						$self.utils.loadSegment(content, link.getAttribute("rel"));
					}
				}
			}, false);
			
			if (active) {
				$self.utils.loadSegment(content, active.getAttribute("rel"));
			}
		}
	};
	
	$self.prepView = function(object) {
		var parent = object,
		    views = parent.querySelectorAll("view");
		
		for (var i = 0, j = views.length; i < j; i++) {
			new DupliKit.utils.Rivet({
				target : views[i]
			});
		}
	};
	
	$self.addEventListeners = function(object) {
		var parent = object,
		    view = parent.querySelector("view > section"),
		    content = view.querySelector(".ui-dup-rivet-wrapper"),
		    header = parent.querySelector("view > viewport header"),
		    footer = parent.querySelector("footer"),
		    tabs = footer.querySelectorAll("li a"),
		    active = footer.querySelector("li.ui-dup-tab-active a"),
		    link = active.getAttribute("rel");
		
		for (var i = 0, j = tabs.length; i < j; i++) {
			var tab = tabs[i], _parent,
			    _active = $space.utils.parseClass("tab-active");
			
			tab.addEventListener("touchend", function(e) {
				_parent = this.parentNode;
			    header = parent.querySelector("view > viewport header");
				link = this.getAttribute("rel");
				
				if (!$space.utils.hasClass(_parent, _active)) {
					for (var k = 0, l = tabs.length; k < l; k++) {
						$space.utils.removeClass(tabs[k].parentNode, _active);
					}

					$space.utils.Rivet.utils.disableRivet();

					$space.utils.addClass(_parent, _active);
					$self.utils.loadSection(link, header, content, this.getAttribute("data-index"));
				}
			}, false);
			
			tab.setAttribute("data-index", i);
		}
		
		if (active) {
			$self.utils.loadSection(link, header, content, active.getAttribute("data-index"));
		}
		
		window.addEventListener("orientationchange", function() {
			$self.utils.orientationChange(view, footer);
		}, false);
		
		$self.utils.orientationChange(view, footer);
		$self.utils.segmentedController(content, header);
	};
	
	/*
	Function: init
	*/
	$self.init = function() {
		$self.prepView(object);
		$self.addEventListeners(object);
		
		if (properties) {
			$space.utils.handleProperties(object, properties);
		}
	}();
});