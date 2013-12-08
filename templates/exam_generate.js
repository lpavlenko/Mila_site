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
	_$li.addClass("question_list");
	// TODO: add more generation code here later on
	var fullText = _q.txt;
	while(fullText.length > 0){
		// get plain text, everything before the next "{"
		var plain = ""; // TODO: implement the above comment
		// TODO: cut out the portion of the text that is already appended as a text node
		_$li.append(plain);
		// TODO: if we stopped because we found the next substitution token...
		{
			// substitute token with a <select> tag
			var $select = $("<select>");
			// TODO: implement creation of the <select> tag and its elements
			_$li.append($select);
			// TODO: cut out the substituion text
		}
	}
}

function create1Q(_$obj, _q){
	var $li = $("<li>");

	if(_q.listType){
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
