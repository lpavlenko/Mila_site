/*
	Functions to validate the content of the exam and questions
	Checks the internal validity and consistency of the data structures
*/

function validateE(_exam){
	var qIsCorrect = true;
	
	return qIsCorrect;
}

function validateQ(_q){
	var /*const*/numAnswers = _q.a.length;
	var qIsCorrect = true;
	
	if(_q.list === undefined){
		console.log("No field `list` defined for answer!!!");
		qIsCorrect = false;
	}
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
