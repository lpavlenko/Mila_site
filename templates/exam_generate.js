/*
	Set of functions to traverse a given exam with its questions in order
	to create an HTML rendering of it
*/

function createExamDiv(_$obj, _exam){
	var $div = $("<div>");
	
	$div.addClass("exam");
	$div.addClass( _exam.mock ? "mock" : "exercise" );
	
	$div.append(
		$("<p>").append(
			$("<span>").append(
				_exam.descr
			)
		)
	);
	
	createQList($div, _exam);

	_$obj.append($div);
}

function createQList(_$obj, _exam){
	var $ol = $("<ol>");
	
	$ol.addClass("question_container");
	
	for(var i = 0; i < _exam.list.length; ++i){
		var /*const*/idx = _exam.list[i];
		create1Q($ol, gQ[idx]);
	}
	
	_$obj.append($ol);
}

function create1Q_MC(_$li, _q){
	_$li.addClass("question_mc");

	_$li.append(_q.txt);

	var $divA = $("<div>");	// answer
	$divA.addClass("answer");

	var /*const*/nameAttr = "answer_" + Math.random();
	var /*const*/numAnswers = _q.a.length;

	if( ! validateQ(_q) ){
		numAnswers = limit(numAnswers, 0, 4);
	}

	for(var i = 0; i < numAnswers; ++i){
		var $span = $("<span>");
		var $input = $("<input>");
		$input.attr({
			type: "radio",
			name: nameAttr
		});
		
		$divA.append(
			$span.append(_q.a[i]).append($input)
		);
	}

	var $divF = $("<div>");	// feedback
	$divF.addClass("feedback");
	$divF.html(_q.fb);

	_$li.append($divA).append($divF);
}

function create1Q_LIST(_$li, _q){
/*
	1. tokenize question's text
	2. create a list of pieces, each one being either a plain text or a select
	3. combine the pieces together to produce a final HTML markup
*/
	_$li.addClass("question_list");
	/*
		3 types of objects are stored in pieces:
		1. type: 't' - this is a plain text that doesn't need any further processing
		2. type: 'i' - an "id" of a select element that will be substituted by a big <select> markup
		3. type: 's' - an actual <select> object to be put into the final HTML markup
	*/
	// accumulate bits of original text into here
	var pieces = [];

	pieces = tokenize(_q.txt);
	substitute(_q, pieces);
	for(var i = 0; i < pieces.length; ++i){
		_$li.append(pieces[i].data);
	}
}

// split the given text into tokens and return it as an array of objects
function tokenize(_txt){
	var rez = [];
	var state = 'text';
	var arrIdx = 0;
	var currText = '';
	for(var i = 0; i < _txt.length; ++i){
		switch(_txt[i]){
			case '{':
				if(state === 'text'){
					state = 'token';
					if(currText.length > 0){
						rez[arrIdx] = {type: 't', data: currText};
						arrIdx++;
					}
					currText = '';
				}
				break;
			case '}':
				if(state === 'token'){
					state = 'text';
					if(currText.length > 0){
						rez[arrIdx] = {type: 'i', data: currText};
						arrIdx++;
					}
					currText = '';
				}
			break;
			default:
				currText += _txt[i];
			break;
		}
	}
	if(state === 'text'){
		rez[arrIdx] = {type: 't', data: currText};
	}
	return rez;
}

// substitute 'id' type objects with full-fledged <select> object in a given array
function substitute(_q, _arr){
	for(var i = 0; i < _arr.length; ++i){
		if(_arr[i].type === 'i'){
			var options = _q.dropDowns[_arr[i].data].list;
			var $sel = $("<select>");
			$sel.append( $("<option>").append("Select one...").attr("selected", "selected") );
			for(var j = 0; j < options.length; ++j){
				$sel.append( $("<option>").append(options[j]));
			}
			_arr[i].type = 's';
			_arr[i].data = $sel;
		}
	}
}

function create1Q(_$obj, _q){
	if( ! _q )
		return;

	var $li = $("<li>");

	if(_q.dropDowns){
		create1Q_LIST($li, _q);
	}else{
		create1Q_MC($li, _q);
	}
	
	_$obj.append($li);
}
function limit(_val, _min, _max){
	_val = Math.min(_val, _max);
	_val = Math.max(_val, _min);
	return _val;
}
