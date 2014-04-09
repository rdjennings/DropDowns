var t7DropDown = function(options) {
	if (!window.t7DropDownController) {
		this.defineController();
	}
	
	this.init(options);
};

t7DropDown.prototype.init = function(options) {
	var optionList = options.select.getElementsByTagName('option'),
		selectedOption = null,
		parentForm,
		holdName = '';
	this.cssClass = options.cssClass || '';
	this.processor = options.processor || function() {return;};
	this.beforeOpen = options.beforeOpen || function() {return;};
	this.afterOpen = options.afterOpen || function() {return;};
	this.beforeOpen = options.beforeOpen || function() {return;};
	this.afterOpen = options.afterOpen || function() {return;};
	this.beforeClose = options.beforeClose || function() {return;};
	this.afterClose = options.afterClose || function() {return;};
	this.beforeSelect = options.beforeSelect || function() {return;};
	this.afterSelect = options.afterSelect || function() {return;};
	this.beforeReset = options.beforeReset || function() {return;};
	this.afterReset = options.afterReset || function() {return;};
	this.base = options.select;
	this.select = document.createElement('div');
	if (this.base.id) {
		this.id = this.base.id;
	} else {
		this.id = 't7DD_' + new Date().getTime();
		while (document.getElementById(this.id)) {
			this.id = 't7DD_' + new Date().getTime();
		}
	}
	
	/*
	 * if the original select is part of a form add a hidden value to the form to pass the value to the form processor
	 */
	parentForm = formParent(this.base);
	if (parentForm) {
		holdName = this.base.name;
		if (holdName) {
			this.select.name = null;
			this.ghostField = document.createElement('input');
			this.ghostField.type = 'hidden';
			this.ghostField.name = holdName;
			parentForm.appendChild(this.ghostField);
		} else {
			this.ghostField = false;
		}
	}
	
	
	this.select.style.display = 'none';
	this.select.className = 't7DD_select';
	if (this.cssClass.length > 0) {
		this.select.className += ' ' + this.cssClass;
	}
	options.select.parentNode.insertBefore(this.select, options.select.nextSibling);
	
	/* the last option in the list with "selected" set gets the selected attribute */
	/* if no option is previously "selected" then IE8 will force select on the FIRST item */
	for (var idx=0, len=optionList.length; idx<len; idx++) {
		if (optionList[idx].getAttribute('selected') !== null) {
			selectedOption = optionList[idx];
		}
	}
	
	/* if there was no option with "selected" set then we will set the first item as selected */
	selectedOption = (selectedOption) ? selectedOption : optionList[0];
	
	/* finalize the new "option" div and get rid of the old select */
	if (selectedOption) {
		value = selectedOption.getAttribute('value') || selectedOption.text;
		this.select.innerHTML = selectedOption.text;
		this.resetText = selectedOption.text;
	} else {
		value = null;
		this.select.innerHTML = '';
		this.resetText = '';
	}
	this.selectedOption = null;
	this.select.setAttribute('value', value);
	if (optionList.length === 0) {
		t7AddClass(this.select, 'empty');
	}
	if (this.ghostField) {
		this.ghostField.value = value;
	}
	this.resetValue = value;
	this.select.id = this.id;
	t7DropDownController.add(this);
	options.select.parentNode.removeChild(options.select);
	this.base = null;
	this.select.style.display = '';

};

t7DropDown.prototype.addOption = function(oItem, isFirst) {
	var list = null;
	option = document.createElement('div');
	option.innerHTML = oItem.text || oItem.text;
	option.setAttribute('value', oItem.value || option.innerHTML);
	option.className = 't7DD_option';
	if (isFirst) {
		option.className = option.className + ' selected';
	}
	this.list.appendChild(option);
	if (oItem.getAttribute !== undefined && oItem.getAttribute('selected')) {
		oItem.selected = oItem.getAttribute('selected');
	}
	if (oItem.selected) {
		list = this.list.getElementsByTagName('div');
		for (var idx=0, len=list.length; idx<len; idx++) {
			t7RemoveClass(list[idx], ' selected');
		}
		t7AddClass(option, 'selected');
		this.currentTarget = option;
		this.select.innerHTML = oItem.text;
		if (this.ghostField) {
			this.ghostField.value = oItem.value;
		}
	}
	t7RemoveClass(this.select, 'empty');
};

t7DropDown.prototype.disable = function() {
	this.close(false);
	if (this.ghostField) {
		this.disabledValue = this.ghostField.getAttribute('value');
		this.ghostField.removeAttribute('value');
	}
	t7AddClass(this.select, 'disabled');
};

t7DropDown.prototype.enable = function() {
	if (this.ghostField) {
		this.ghostField.setAttribute('value', this.disabledValue);
	}
	t7RemoveClass(this.select, 'disabled');
};

t7DropDown.prototype.getValue = function() {
	return this.select.getAttribute('value');
};

t7DropDown.prototype.open = function() {
	
	if (t7HasClass(this.select, 'disabled') || t7HasClass(this.select, 'empty')) {
		return;
	}
	/* if the drop down will extend past the bottom of the page then open it up ... 
	 * if that makes it go above the TOP of the page then just give up and drop it down.
	 */
	var offset = t7GetOffset(this.select),
		selHeight = this.select.clientHeight,
		top = offset.top + selHeight,
		left = offset.left,
		winHeight = window.innerHeight||document.documentElement.clientHeight||document.body.clientHeight||0,
		clientHeight = 0;

	this.beforeOpen.call(this.select);
		
	this.list.style.display = 'block';
	clientHeight = this.list.clientHeight;
	this.list.style.display = '';
	
	if ((top + clientHeight) > winHeight) {
		if (top - (2 * clientHeight) - selHeight > 0) {
			top = top - clientHeight - selHeight;
		} 
	}
	this.list.style.top = top + 'px';
	this.list.style.left = left + 'px';
	this.list.style.display = 'block';

	this.afterOpen.call(this.select);
		
};

t7DropDown.prototype.close = function(processCalls) {
	if (this.list.style.display === 'block') {
		this.beforeClose.call(this.select);
		this.list.style.display = '';
		if (typeof processCalls !== 'undefined' && !processCalls) {
			return;
		}
		this.afterClose.call(this.select);
	}
};

t7DropDown.prototype.selectByValue = function(oValue) {
	var oList = this.list.getElementsByTagName('div'),
		targetIndex = null;
	for(var idx=0, len=oList.length; idx<len; idx++) {
		if (oList[idx].getAttribute('value') === oValue+'') {
			targetIndex = idx;
			break;
		}
	}
	if (!targetIndex) {
		return;
	}
	if (t7HasClass(oList[targetIndex], 'selected')) {
		return;
	}
	for(var idx=0, len=oList.length; idx<len; idx++) {
		t7RemoveClass(oList[idx], 'selected');
	}
	t7AddClass(oList[targetIndex], 'selected');
	this.select.innerHTML = oList[targetIndex].innerHTML;
	this.select.setAttribute('value',  oList[targetIndex].getAttribute('value'));
	if (this.ghostField) {
		this.ghostField.setAttribute('value', oList[targetIndex].getAttribute('value'));
	}
};

t7DropDown.prototype.purge = function() {
	this.select.innerHTML = '';
	this.select.removeAttribute('value');
	this.list.innerHTML = '';
	this.resetValue = null;
	this.resetText = '';
	t7AddClass(this.select, 'empty');
	if (this.ghostField) {
		this.ghostField.removeAttribute('value');
	}
};

t7DropDown.prototype.defineController = function() {
	t7DropDownController = window.t7DropDownController = function() {
		this.objectStack = [];
		this.body = document.getElementsByTagName('body')[0];
	};
	
	t7DropDownController.prototype.add = function(dropDownObj) {
		var context = this;
		var select = dropDownObj.base,
			options = select.getElementsByTagName('option'),
			option = null,
			value = null,
			test = null,
			isFirst = true;

		dropDownObj.list = document.createElement('div');
		dropDownObj.list.style.display = 'none';
		dropDownObj.list.id = dropDownObj.id + '_options';
		dropDownObj.list.className = 't7DD_options';
		this.body.appendChild(dropDownObj.list);

		for (idx=0, len=options.length; idx<len; idx++) {
			dropDownObj.addOption(options[idx], isFirst);
			isFirst = false;
		}

		this.objectStack.push(dropDownObj);
		 if (!context.docClick) {
		 	context.docClick = document.onclick || function() {return true;};
		 }
		document.onclick = function(ev) {
			var oEv = ev,
				form = null,
				object = null,
				formMembers = null,
				workEl = null,
				options = null;
			context.docClick();
			if (!oEv) {
				var ev = window.event;
			}
			var target = ev.target || ev.srcElement;
			if (t7HasClass(target, 't7DD_select')) {
				context.toggleAll(target);
			} else if (t7HasClass(target, 't7DD_option')) {
				context.processOption(target,ev);
			} else {
				context.closeAll();
				if (target.tagName.toLowerCase() === 'input' && target.type.toLowerCase() === 'reset') {
					form = formParent(target);
					if (form) {
						formMembers = form.getElementsByTagName('div');
						for (var idx=0, len=formMembers.length; idx<len; idx++) {
							workEl = formMembers[idx];
							if (t7HasClass(workEl, 't7DD_select')) {
								object = window.t7DropDownController.getSelObjByID(workEl.id);
								if (object.beforeReset() === false) {
									continue;
								}
								options = object.list.getElementsByTagName('div');
								for (var idx2=0, len2=options.length; idx2<len2; idx2++) {
									if (options[idx2].getAttribute('value') === object.resetValue) {
										t7AddClass(options[idx2], 'selected');
									} else {
										t7RemoveClass(options[idx2], 'selected');
									}
								}
								object.enable();
								object.afterReset();
								workEl.setAttribute('value', object.resetValue);
								workEl.innerHTML = object.resetText;
								if (object.ghostField) {
									object.ghostField.value = object.resetValue;
								}
							}
						}
					}
				}
			}
		};
		
		if (!t7DropDownController.winScroll) {
			t7DropDownController.winScroll = window.onscroll || function() {return true;};
		}
		
		window.onscroll = function(ev) {
			var context = this;
			var oEv = ev;
			t7DropDownController.winScroll();
			t7DropDownController.closeAll();
		};
		if (!t7DropDownController.winResize) {
			t7DropDownController.winResize = window.onresize || function() {return true;};
		}
		
		window.onresize = function(ev) {
			var context = this;
			var oEv = ev;
			t7DropDownController.winResize();
			t7DropDownController.closeAll();
		};
	};
	
	t7DropDownController.prototype.list = function() {
		/*
		 * this is a DEBUG function!!! Only use it if you are debugging and have a console available!!!
		 */
		for (var idx=0, len=this.objectStack.length; idx<len; idx++) {
			console.log(this.objectStack[idx]);
		}
	};
	
	t7DropDownController.prototype.toggleAll = function(oSelect) {
		var id = oSelect.id,
			targetList = document.getElementById(id + '_options');
		for (idx=0, len=this.objectStack.length; idx<len; idx++) {
			if (this.objectStack[idx].id === id && !t7SelIsOpen(oSelect)) {
				this.objectStack[idx].open();
			} else {
				this.objectStack[idx].close();
			}
		}
	};
	
	t7DropDownController.prototype.closeAll = function() {
		for (idx=0, len=this.objectStack.length; idx<len; idx++) {
			this.objectStack[idx].close();
		}
	};
	
	t7DropDownController.prototype.getSelObjByID = function(id) {
		for (idx=0, len=this.objectStack.length; idx<len; idx++) {
			if(this.objectStack[idx].id === id) {
				return this.objectStack[idx];
			}
		}
		return null;
	};
	
	t7DropDownController.prototype.processOption = function(target,ev) {
		var topNode = target.parentNode,
			id = topNode.id,
			containerID = id.replace('_options', ''),
			object = this.getSelObjByID(containerID),
			list = topNode.getElementsByTagName('div');
		/* find the object that owns the target */
		if (object.beforeSelect.call(object, ev) === false) {
			object.close();
			return;
		}
		if (object.select.innerHTML === target.innerHTML && object.select.getAttribute('value') === target.getAttribute('value')) {
			return;
		}
		for (var idx=0, len=list.length; idx<len; idx++) {
			t7RemoveClass(list[idx], 'selected');
		}
		t7AddClass(target, 'selected');
		object.close();
		object.currentTarget = target;
		object.select.setAttribute('value', target.getAttribute('value'));
		object.select.innerHTML = target.innerHTML;
		if (object.ghostField) {
			object.ghostField.value = target.getAttribute('value');
		}
		object.processor.call(object);
		object.afterSelect.call(object, ev);
	};
	
	t7DropDownController = new t7DropDownController();
};

function t7AddClass(el, newClass) {
	if (el.className.indexOf(newClass) > -1) {
		return;
	}
	
	el.className = el.className + ' ' + newClass;
}

function t7RemoveClass(el, newClass) {
	el.className = el.className.replace(' ' + newClass, '' );
	el.className = el.className.replace(newClass + ' ', '' );
	el.className = el.className.replace(newClass, '' );
}

function t7HasClass(el, testClass) {
	var elClassName = el.className;
	if (elClassName === testClass || elClassName.indexOf(' ' + testClass) > -1 || elClassName.indexOf(testClass + ' ') > -1) {
		return true;
	}
	return false;
}

function t7SelIsOpen(oSelect) {
	var id = oSelect.id,
		targetList = document.getElementById(id + '_options');
	if (targetList.style.display === 'block') {
		return true;
	}
	return false;
}

function formParent(select) {
	var testEl = select;
		
	while (testEl.tagName.toLowerCase() !== 'body') {
		if (testEl.tagName.toLowerCase() === 'form') {
			return testEl;
		}
		testEl = testEl.parentNode;
	}
	return false;
}

function t7GetOffset( el ) {
    var _x = 0;
    var _y = 0;
    while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
        _x += el.offsetLeft - el.scrollLeft;
        _y += el.offsetTop - el.scrollTop;
        el = el.offsetParent;
    }
    return { top: _y, left: _x };
}