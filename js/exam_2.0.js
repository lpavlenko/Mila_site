/*
	Exam object (version 2.0 of the exam rendering and logic code)
*/

function Exam(_fname){
	this.fname = _fname || "";	// the ".edb" suffix is NOT part of this field!
	this.title = "Enter new title";
	this.misc = "Additional info (like date or version). Not shown to end user";
	this.mock = undefined;	// either mock or excercise
	this.descr = "Full description of this exam. You can use HTML tags in here";

	this.questions = [];	// a pool of all the questions for this exam
	this.sections = [];

	this.addSection();
	this.addQuestion();
}

Exam.suffix = ".ebd";

Exam.prototype.valid = function(){
	return this.fname.length > 0;
}

Exam.prototype.getFname = function(){
	return this.fname;
}

Exam.prototype.getTitle = function(){
	return this.title;
}

Exam.prototype.getMisc = function(){
	return this.misc;
}

Exam.prototype.getType = function(){
	switch(this.mock){
		case true:
			return "mock";
		case false:
			return "exe";
		default:
			return null;
	}
}

Exam.prototype.getDescr = function(){
	return this.descr;
}

Exam.prototype.changeFname = function(_fname){
	var oldName = this.fname;
	this.fname = _fname;
	// TODO: save under new file name
	// TODO: remove old file from disk
	return this;
}

Exam.prototype.addSection = function(){
	var es = new ExamSection;
	this.sections.push(es);
	return es;
}

Exam.prototype.addQuestion = function(){
	var eq = new ExamQuestion;
	this.questions.push(eq);
	return eq;
}

Exam.prototype.getSections = function(){
	return this.sections;
}

Exam.prototype.setMock = function(_b){
	return this.mock = _b;
}

Exam.prototype.setTitle = function(_str){
	return this.title = _str;
}

Exam.prototype.setMisc = function(_str){
	return this.misc = _str;
}

Exam.prototype.setDescr = function(_str){
	return this.descr = _str;
}

function ExamSection(){
	this.title = "Section's title";
	this.descr = "Section's description. You can use HTML tags in here";
	this.list = [];
}

ExamSection.prototype.getTitle = function(){
	return this.title;
}

ExamSection.prototype.getDescr = function(){
	return this.descr;
}

ExamSection.prototype.getList = function(){
	return this.list;
}

ExamSection.prototype.setTitle = function(_str){
	this.title = _str;
	return this;
}

ExamSection.prototype.setDescr = function(_str){
	this.descr = _str;
	return this;
}

function ExamQuestion(){
	this.mc = undefined;	// multi-choice (if true) or plain text (if false)
	this.text = "Question's text. You can use HTML here";
	this.answers = [];
}

ExamQuestion.prototype.addAnswer = function(){
	var eqa = new ExamQuestionAnswer;
	this.answers.push(eqa);
	return eqa;
}

function ExamQuestionAnswer(){
	this.list = [];
}
