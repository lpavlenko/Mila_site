/*
	Functions to validate the content of Mock exam (question generator, feedback field, question text )
	Checks the internal validity and consistency of the data structures
*/

function validateM(_exam, _feedback, _q.Txt){
	var examIsCorrect = true;
	
	return examIsCorrect;
}

function validateM(_q.Txt){
	var /*const*/questionText = _q.Txt.length;
	var examIsCorrect = true;
	
	if(_q.text === undefined){
		console.log("No field `text` defined for answer!!!");
		examIsCorrect = false;
	}
	if(_q.Txt <= 0 || _q.Txt > 5){
		console.log("%cNumber of signs for question [%s] is [%i], which is not between 0 and 5. Ignore the question", 
		"color:red;", _q.txt);
		examIsCorrect = false;
	}
	if(_q.correct >= _q.Txt){
		console.log("%cIndex of the correct answer is [%i] but the total number of answers is [%i] for answer [%s]", "color:red;", _q.correct, _q.txt);
		examIsCorrect = false;
	}
	
	return examIsCorrect;
}

function validateM(_exam, _feedback, _q.Txt){
	var examIsCorrect = true;
	
	return examIsCorrect;
	
}

function validateM(_feedback){
	var /*const*/feedbackfield = _feedback;
	var examIsCorrect = true;
	
	if(_feedback === undefined){
		console.log("No field `feedback` defined for answer!!!");
		examIsCorrect = false;
	}
	if(_feedback <= 0 || _feedback > 1){
		console.log("%c feedback field for feedback [%s] is [%i], which is not between 0 and 1. Accepting the answer move to next question", 
		"color:red;", _feedback);
		examIsCorrect = false;
	}
	if(_feedback.correct >= _feedback){
		console.log("%cIndex of the correct answer is [%i] but the total number of answers is [%i] for answer [%s]", "color:red;", _feedback.correct, _feedback);
		examIsCorrect = false;
	}
	
	return examIsCorrect;
}
