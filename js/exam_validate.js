/*
	Functions to validate the content of the exam and questions
	Checks the internal validity and consistency of the data structures
*/

function validateE(_exam){
	var eIsCorrect = true;
	
/*the function is figure out if the exam is mock or there is an exercise or plain text*/

	if(_exam.mock === undefined){
		eIsCorrect = false;
		console.log("No field `mock` defined for exam!!!");
	}
	
	if(eIsCorrect === true){
		if(_exam.mock)
			if(validateEM(_exam) !== true){
				eIsCorrect = false;
			}
		else
			if(validateEE(_exam) !== true){
				eIsCorrect = false;
			}
	}
	
	
/* the functions shows that no question text, no list of answers set up for Mock Exam or Exercise */

	if(_exam.questions === undefined || _exam.list === undefined || _exam.list.length < 1){
		eIsCorrect = false;
		console.log("No list of questions set for exam!!!");
	}else{
		for(var i = 0; i < _exam.list.length; ++i){ 		
			var /*const*/ idx = _exam.list[i];
			var /*const*/ q = _exam.questions[idx];
			if(q === undefined){
				console.log("%cQuestion # [%i] at index [%i] is not defined", "color:red;", i, idx);
				eIsCorrect = false;
			}else{
				if(validateQ(q) === false){
					eIsCorrect = false;
				}
			}
		}
		if(validateNonDuplicateQuestions(_exam.list)){   /* identify the duplicates */ 
//			console.log("There are duplicate questions in the list");
			eIsCorrect = false;
		}
	}

	if(eIsCorrect !== true){
		console.log("%cexam failed validation", "color:red;");
	}
	return eIsCorrect;
}

// exam MOCK
function validateEM(_exam){
	return true;
}

// exam Exercise
function validateEE(_exam){
	return true;
}

function validateNonDuplicateQuestions(_list){
	if(_list.length < 2){
		return true;
	}
	
	var isCorrect = true;   
	var all = [];
	var idx; 
	for(idx = 0; idx < _list.length; ++idx){
		var listidx = _list[idx];
		if(all[listidx] === undefined)
			all[listidx] = 1;
		else
			all[listidx]++;
	}
	for(idx = 0; idx < all.length; ++idx){
		if(all[idx] > 1){
			console.log("Question index [%i] occurred [%i] times", idx, all[idx]);
			isCorrect = false;
		}
	}
	
	return isCorrect;
}

/*
	Block of functions to validate questions from the previous consultation
*/
function validateQ(_q){
	var qIsCorrect = true;
	
	// TODO: check the validity of common fields, like question's text

	if(_q.dropDowns){
		qIsCorrect = validateQ_LIST(_q);
	}else{
		qIsCorrect = validateQ_MC(_q);
	}

	return qIsCorrect;
}

function validateQ_LIST(_q){
	var qIsCorrect = true;
	
	if(_q.list === undefined){
		console.log("No field `list` defined for answer for question [%s]!", _q.txt);
		qIsCorrect = false;
	}

	return qIsCorrect;
}

function validateQ_MC(_q){
	var /*const*/numAnswers = _q.a.length;
	var qIsCorrect = true;
	
	if(numAnswers <= 0 || numAnswers > 4){
		console.log("%cNumber of answers for question [%s] is [%i], which is not between 1 and 4. Ignoring the rest of answers choices", "color:red;", _q.txt, numAnswers);
		qIsCorrect = false;
	}
	if(_q.correct >= numAnswers){
		console.log("%cIndex of the correct answer is [%i] but the total number of answers is [%i] for answer [%s]", "color:red;", _q.correct, numAnswers, _q.txt);
		qIsCorrect = false;
	}

	return qIsCorrect;
}

