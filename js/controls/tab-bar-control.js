/*
File: tab-bar-control.js

About: Version
	0.1 pre

Project: DupliKit

Description:
	DupliKit's Tab Bar Controller

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
Namespace: DupliKit.TabBarController
	Under the DupliKit.TabBarController Local Namespace
*/
DupliKit.TabBarController = (function (object) {
	
	// Storing a variable to reference
	var $space = DupliKit;
	
	// Self reference
	var $self = DupliKit.TabBarController;
	
	/*
	Namespace: DupliKit.TabBarController.vars
		Shared local variables
	*/
	$self.vars = {};
	
	/*
	Namespace: DupliKit.TabBarController.utils
		Shared local utilities
	*/
	$self.utils = {
		orientationChange : function(view) {
			var tabBar = $self.vars.context,
			    offset = window.innerHeight - tabBar.offsetHeight;
			
			console.log(tabBar.offsetHeight);
			
			view.style.height = offset - view.offsetTop + "px";
			tabBar.style.top = offset + "px";
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
		}
	};
	
	$self.prepView = function(view, object) {
		$self.vars.context = view;
		object.parentView.utils.orientationChange = $self.utils.orientationChange;
	};
	
	$self.addEventListeners = function(view, object) {
		
		var tabs = view.querySelectorAll("li a"),
		    header = object.header,
		    content = object.content,
		    active = view.querySelector("li.ui-dup-tab-active a"),
		    link = active.getAttribute("rel");
		
		for (var i = 0, j = tabs.length; i < j; i++) {
			var tab = tabs[i], _parent,
			    _active = $space.utils.parseClass("tab-active");
			
			tab.addEventListener("touchend", function(e) {
				_parent = this.parentNode;
			    header = content.parentNode.querySelector("viewport header");
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
		
		$self.utils.orientationChange(content);
		
	};
	
	/*
	Function: init
	*/
	$self.init = function() {
		if (object.context) {
			$self.prepView(object.context, object);
			$self.addEventListeners(object.context, object);
		}
	}();
});