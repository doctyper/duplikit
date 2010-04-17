/*
File: tab-view.js

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
Namespace: Dup.UI.TabView
	Under the Dup.UI.TabView Local Namespace
*/
Dup.UI.TabView = (function (object, properties) {
	
	// Storing a variable to reference
	var $space = Dup;
	
	// Self reference
	var $self = Dup.UI.TabView;
	
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
		orientationChange : function(view, footer) {
			var offset = window.innerHeight - (footer ? footer.offsetHeight : 0);
			
			view.style.height = offset - view.offsetTop + "px";
			
			if (footer) {
				footer.style.top = offset + "px";
			}
		},
		
		updateHeader : function(header, title) {
			var heading = header.querySelector("h1");
			
			if (!heading) {
				heading = document.createElement("h1");
				heading.appendChild(document.createTextNode());
				header.appendChild(heading);
			}
			
			heading.firstChild.nodeValue = title;
		},
		
		loadPage : function(src, header, target) {
			if ($self.vars.xhr) {
				$self.vars.xhr.abort();
			}
			
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
						
						var title = dummy.querySelector(".ui-dup-tab-view-content");
						
						if (title) {
							title = title.getAttribute("data-header-text");
							$self.utils.updateHeader(header, title);
						}
						
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
	};
	
	$self.prepView = function(object) {
		var parent = object,
		    views = parent.querySelectorAll("view");
		
		for (var i = 0, j = views.length; i < j; i++) {
			new Dup.utils.Rivet({
				target : views[i]
			});
		}
	};
	
	$self.addEventListeners = function(object) {
		var parent = object,
		    view = parent.querySelector("view > section"),
		    content = view.querySelector(".ui-dup-rivet-wrapper"),
		    header = parent.querySelector("header"),
		    footer = parent.querySelector("footer"),
		    tabs = footer.querySelectorAll("li a"),
		    active = footer.querySelector("li.ui-dup-tab-active a");
		
		for (var i = 0, j = tabs.length; i < j; i++) {
			var tab = tabs[i], _parent,
			    _active = $space.utils.parseClass("tab-active");
			
			tab.addEventListener("touchend", function(e) {
				_parent = this.parentNode;
				
				if (!$space.utils.hasClass(_parent, _active)) {
					for (var k = 0, l = tabs.length; k < l; k++) {
						$space.utils.removeClass(tabs[k].parentNode, _active);
					}

					$space.utils.Rivet.utils.disableRivet();

					$space.utils.addClass(_parent, _active);
					$self.utils.loadPage(this.getAttribute("rel"), header, content);
				}
			}, false);
		}
		
		if (active) {
			$self.utils.loadPage(active.getAttribute("rel"), header, content);
		}
		
		window.addEventListener("orientationchange", function() {
			$self.utils.orientationChange(view, footer);
		}, false);
		
		$self.utils.orientationChange(view, footer);
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