/*
	Exam object (version 2.0 of the exam rendering and logic code)
*/

function Exam(_fname){
	this.fname = _fname || "noname.edb";
}

Exam.prototype.valid = function(){
	return this.fname.length > 0;
}

Exam.prototype.getFname = function(){
	return this.fname;
}

