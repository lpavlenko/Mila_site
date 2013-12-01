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
function create1Q(_$obj, _q){
	var $li = $("<li>");

	$li.append(_q.txt);

	if(_q.list){
		$li.addClass("question_list");
		// TODO: add more generation code here later on
	}else{
		$li.addClass("question_mc");

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

		$li.append($divA).append($divF);
	}
	
	_$obj.append($li);
}
function limit(_val, _min, _max){
	_val = Math.min(_val, _max);
	_val = Math.max(_val, _min);
	return _val;
}
