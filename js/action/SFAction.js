;
/*!
 *
 *  SpriteForest JavaScript Library v1.0.0
 *  http://github.com/moky/SpriteForest/js/
 *
 *  Copyright (c) 2014 moKy at slanissue.com
 *  Released under the MIT license
 *  http://en.wikipedia.org/wiki/MIT_License
 *
 */
//
//  SFAction.js
//  SpriteForest-HTML5
//
//  Created by moKy on Feb. 28, 2014.
//

//======================================================================= Action

!function(sf) {
	'use strict';
	var cc = sf.cc;
	var cn = sf.cn;
	
	//
	//  constructor
	//
	var Action = function() {
		
	};
	
	//
	//  static functions
	//
	var actionClass = function(name) {
		var Class;
		
		Class = cn.classFromString('SFAction' + name);
		if (Class) {
			return Class;
		}
		
		Class = cn.classFromString('SF' + name);
		if (Class) {
			return Class;
		}
		
		Class = cn.classFromString('SFActionMagic' + name);
		if (Class) {
			return Class;
		}
		
		return null;
	};
	
	var create = function(dict) {
		var Class = actionClass(dict['Name']);
		if (Class) {
			var action = new Class();
			if (action.initWithDictionary(dict)) {
				return action;
			}
		}
		cn.error(dict);
		return null;
	};
	
	//
	//  instance functions
	//
	var init = function() {
		return true;
	};
	var initWithDictionary = function(dict) {
		if (!this.init()) {
			return false;
		}
		return dict != null;
	};
	
	var ccAction = function() {
		cn.error('override me!');
		return null;
	};
	
	var actionByReplaceTarget = function(target, dict) {
		if (!target || !dict) {
			cn.error(target, dict);
			return null;
		}
		if (target instanceof cc.Node) {
			var node = target;
			target = dict['Target'];
			if (!target) {
				target = dict['ss_Target'];
			}
			if (!target) {
				dict['Target'] = node;
			} else if (typeof target === 'string') {
				node = sf.Node.getTarget(target, node);
				if (node) {
					dict['Target'] = node;
				}
			}
		} else if (typeof target === 'string') {
			cn.error('error: ' + target);
			return null;
		} else {
			cn.error(target, dict);
			return null;
		}
		
		var action = sf.Action.create(dict);
		return action ? action.ccAction() : null;
	};
	
	var subActionFromDictionary = function(dict) {
		var action = dict['Action'];
		if (!action) {
			cn.error(dict);
			return null;
		}
		
		if (action instanceof cc.Class) {
			
		} else if (typeof action === 'object') { // maybe already replaced
			var target = dict['Target'];
			if (!target) {
				target = dict['ss_Target'];
			}
			action = actionByReplaceTarget(target, action);
		}
		
		return action instanceof cc.Action ? action : null;
	};
	
	var subActionsFromDictionary = function(dict) {
		var actions = dict['Actions'];
		if (!actions) {
			cn.error(dict);
			return null;
		}
		
		var target = dict['Target'];
		if (!target) {
			target = dict['ss_Target'];
		}
		
		var arr = [];
		var obj;
		for (var i = 0; i < actions.length; ++i) {
			obj = actions[i];
			
			if (obj instanceof cc.Class) {
				
			} else if (typeof obj === 'object') { // maybe already replaced
				obj = actionByReplaceTarget(target, obj);
			}
			
			if (obj instanceof cc.Action) {
				arr.push(obj);
			} else {
				cn.error(obj, actions[i]);
			}
		}
		return arr;
	};
	
	var prop = {
		ctor: Action,
		
		init: init,
		initWithDictionary: initWithDictionary,
		
		ccAction: ccAction,
		
		// properties
	};
	
	// extends
	sf.Action = cc.Class.extend(prop);
	
	// static
	sf.Action.create = create;
	sf.Action.subActionFromDictionary = subActionFromDictionary;
	sf.Action.subActionsFromDictionary = subActionsFromDictionary;
	
}(SpriteForest);

//============================================================= FiniteTimeAction

!function(sf) {
	'use strict';
	var cc = sf.cc;
	var cn = sf.cn;
	
	//
	//  constructor
	//
	var FiniteTimeAction = function() {
		sf.Action.prototype.ctor.call(this);
		this._duration = 0;
	};
	
	//
	//  static functions
	//
	
	//
	//  instance functions
	//
	var init = function() {
		if (!sf.Action.prototype.init.call(this)) {
			return false;
		}
		this._duration = 0;
		return true;
	};
	var initWithDictionary = function(dict) {
		if (!sf.Action.prototype.initWithDictionary.call(this, dict)) {
			return false;
		}
		this._duration = dict['Duration'];
		return true;
	};
	
	var prop = {
		ctor: FiniteTimeAction,
		
		init: init,
		initWithDictionary: initWithDictionary,
		
		// properties
		_duration: 0,
	};
	
	// extends
	sf.FiniteTimeAction = sf.Action.extend(prop);
	
}(SpriteForest);

//================================================================ RepeatForever

!function(sf) {
	'use strict';
	var cc = sf.cc;
	var cn = sf.cn;
	
	//
	//  constructor
	//
	var RepeatForever = function() {
		sf.Action.prototype.ctor.call(this);
		this._action = null;
	};
	
	//
	//  static functions
	//
	
	//
	//  instance functions
	//
	var init = function() {
		if (!sf.Action.prototype.init.call(this)) {
			return false;
		}
		this._action = null;
		return true;
	};
	var initWithDictionary = function(dict) {
		if (!sf.Action.prototype.initWithDictionary.call(this, dict)) {
			return false;
		}
		var action = sf.Action.subActionFromDictionary(dict);
		if (action instanceof cc.ActionInterval) {
			this._action = action;
			return true;
		}
		cn.error(dict, action);
		return false;
	};
	
	var ccAction = function() {
		return this._action ? cc.RepeatForever.create(this._action) : null;
	};
	
	var prop = {
		ctor: RepeatForever,
		
		init: init,
		initWithDictionary: initWithDictionary,
		
		ccAction: ccAction,
		
		// properties
		_action: null,
	};
	
	// extends
	sf.RepeatForever = sf.Action.extend(prop);
	
}(SpriteForest);

//======================================================================== Speed

!function(sf) {
	'use strict';
	var cc = sf.cc;
	var cn = sf.cn;
	
	//
	//  constructor
	//
	var Speed = function() {
		sf.Action.prototype.ctor.call(this);
		this._action = null;
		this._rate = 0;
	};
	
	//
	//  static functions
	//
	
	//
	//  instance functions
	//
	var init = function() {
		if (!sf.Action.prototype.init.call(this)) {
			return false;
		}
		this._action = null;
		this._rate = 0;
		return true;
	};
	var initWithDictionary = function(dict) {
		if (!sf.Action.prototype.initWithDictionary.call(this, dict)) {
			return false;
		}
		var action = sf.Action.subActionFromDictionary(dict);
		if (action instanceof cc.ActionInterval) {
			this._action = action;
		} else {
			cn.error(dict);
			return false;
		}
		
		var rate = dict['Rate'];
		this._rate = rate;
		
		return true;
	};
	
	var ccAction = function() {
		return this._action ? cc.Speed.create(this._action, this._rate) : null;
	};
	
	var prop = {
		ctor: Speed,
		
		init: init,
		initWithDictionary: initWithDictionary,
		
		ccAction: ccAction,
		
		// properties
		_action: null,
		_rate: 0,
	};
	
	// extends
	sf.Speed = sf.Action.extend(prop);
	
}(SpriteForest);

//======================================================================= Follow

!function(sf) {
	'use strict';
	var cc = sf.cc;
	var cn = sf.cn;
	
	//
	//  constructor
	//
	var Follow = function() {
		sf.Action.prototype.ctor.call(this);
		this._target = null;
		this._followedNode = null;
		this._rect = null;
	};
	
	//
	//  static functions
	//
	
	//
	//  instance functions
	//
	var init = function() {
		if (!sf.Action.prototype.init.call(this)) {
			return false;
		}
		this._target = null;
		this._followedNode = null;
		this._rect = cc.RectZero();
		return true;
	};
	var initWithDictionary = function(dict) {
		if (!sf.Action.prototype.initWithDictionary.call(this, dict)) {
			return false;
		}
		
		var target = dict['Target'];
		if (!target) {
			target = dict['ss_Target'];
		}
		this._target = target;
		this._followedNode = dict['FollowedNode'];
		
		var rect = dict['Rect'];
		if (rect !== undefined) {
			this._rect = cc.RectFromString(rect);
		}
		
		return true;
	};
	
	var ccAction = function() {
		// check followed node
		if (typeof this._followedNode === 'string') {
			if (this._target instanceof cc.Node) {
				this._followedNode = sf.Node.getTarget(this._followedNode, this._target);
			}
		}
		
		if (this._followedNode instanceof cc.Node) {
			return cc.Follow.create(this._followedNode, this._rect);
		}
		
		cn.error('invalid followed node');
		return null;
	};
	
	var prop = {
		ctor: Follow,
		
		init: init,
		initWithDictionary: initWithDictionary,
		
		ccAction: ccAction,
		
		// properties
		_target: null,
		_followedNode: null,
		_rect: null,
	};
	
	// extends
	sf.Follow = sf.Action.extend(prop);
	
}(SpriteForest);
