
function check_exam(_$jar, _exam){
	_$jar.find("div>ol>li").each(function(_idx, _el){check_question(_idx, _el, _exam);});
}

function check_question(_idx, _el, _exam){
	var $answer = $(_el);	// user's answer
	var question = _exam.questions[ _exam.list[_idx] ];	// question data from DB
	var valid = undefined;
	if(question.dropDowns === undefined){
		valid = check_Q_MC(question, $answer);
	}else{
		valid = check_Q_LIST(question, $answer);
	}
	
	switch(valid){
		true:
			//alert("Молодец");
		break;
		false:
			$answer.find("div.feedback").css("display", "block");
		break;
		default:
			alert("You must select an answer for question [" + question.txt + "]");
		break;
	}
}

function check_Q_LIST(_q, _$a){
	// TODO: implement
	return true;
}

function check_Q_MC(_q, _$a){
	var radioName = _$a.find("div.answer>span:first>input").attr("name");
	var $checked = $('input[name="' + radioName + '"]:checked');
	if( $checked.length > 0 ){
		var answerNo = Number( $checked.attr("idx") );
		if(answerNo === Number(_q.correct)){
			return true;
		}else{
			return false;
		}
	}else{
		// TODO: nothing is selected
		return undefined;
	}
}
