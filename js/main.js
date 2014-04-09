var workDiv = document.querySelector('.work_area');

document.onclick = function() {/*alert('the document click processor is still in place');*/};

var optionProcessor = function() {
	alert('value = ' + this.currentTarget.getAttribute('value') + ' : text = ' + this.currentTarget.innerHTML);
};
var beforeOpen = function() {
//	console.log('about to open', this);
};

var afterOpen = function() {
//	console.log('opened', this);
};

var beforeClose = function() {
//	console.log('about to close', this);
};

var afterClose = function() {
//	console.log('closed', this);
};

var beforeSelect = function(ev) {
//	console.log('before select', this.getValue());
};

var afterSelect = function() {
//	console.log('after select before "set"', this.getValue());
	this.selectByValue(2);
//	console.log('after select after "set"', this.getValue());
};

var beforeReset = function() {
//	return false;
};

var firstOptions = {'select': document.getElementById('first_select'),
					'processor': optionProcessor,
					'beforeReset': beforeReset, 
					'beforeSelect': beforeSelect,
					'afterSelect': afterSelect, 
					'cssClass': 'specialClass'};

aTest = new t7DropDown(firstOptions);
test = new t7DropDown({'select': document.getElementById('second_select'), 'processor': optionProcessor, 'beforeOpen': beforeOpen, 'afterOpen': afterOpen, 'beforeClose': beforeClose, 'afterClose': afterClose});

var myOpt = {};
myOpt.value = '10';
myOpt.text = 'Ten';
myOpt.selected = true;
test.addOption(myOpt);

aTest.disable();
alert('pause');
aTest.enable();
alert('pause 2');
test.purge();
alert('pause 3');
myOpt = {};
myOpt.value = 'WHOOP';
myOpt.text = 'Whoop';
aTest.addOption(myOpt);



