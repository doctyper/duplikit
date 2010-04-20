/*
File: segmented-control.js

About: Version
	0.1 pre

Project: DupliKit

Description:
	DupliKit's Segmented Controller

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
Namespace: DupliKit.SegmentedController
	Under the DupliKit.SegmentedController Local Namespace
*/
DupliKit.SegmentedController = (function (object) {
	
	// Storing a variable to reference
	var $space = DupliKit;
	
	// Self reference
	var $self = DupliKit.SegmentedController;
	
	/*
	Namespace: DupliKit.SegmentedController.vars
		Shared local variables
	*/
	$self.vars = {};
	
	/*
	Namespace: DupliKit.SegmentedController.utils
		Shared local utilities
	*/
	$self.utils = {
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
		}
	};
	
	$self.addEventListeners = function(views) {
		for (var i = 0, j = views.length; i < j; i++) {
			// Do something
		}
	};
	
	/*
	Function: init
	*/
	$self.init = function() {
		if (object.context) {
			$self.addEventListeners(object.context);
		}
	}();
});