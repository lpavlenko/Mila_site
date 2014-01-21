/*
	Exam object (version 2.0 of the exam rendering and logic code)
*/

/**************************************************************
	ExamDB is a file with all the exams for one DB
***************************************************************/
function ExamDB(_fname){
	this.fname = _fname || "";	// the ".edb" suffix is NOT part of this field!
	this.list = [];
	this.questions = [];		// a pool of all the questions for this exam
	
	this.addExam();
	this.addQuestion();
}

ExamDB.suffix = ".ebd";

ExamDB.prototype.getFname = function(){
	return this.fname;
}

ExamDB.prototype.getQuestions = function(){
	return this.questions;
}

ExamDB.prototype.addExam = function(){
	var exam = new Exam(this);
	this.list.push(exam);
	return exam;
}

ExamDB.prototype.getExams = function(){
	return this.list;
}
ExamDB.prototype.addQuestion = function(){
	var eq = new ExamQuestion;
	this.questions.push(eq);
	return eq;
}

ExamDB.prototype.changeFname = function(_fname){
	var oldName = this.fname;
	this.fname = _fname;
	// TODO: save under new file name
	// TODO: remove old file from disk
	return this;
}

ExamDB.prototype.getExams = function(){
	return this.list;
}

/**************************************************************
	One exam of a specific type with a list of questions in it
***************************************************************/
function Exam(_db){
	this.db = _db;	// so we can get to the list of questions

	this.title = "";
	this.misc = "";
	this.mock = undefined;	// either mock or excercise
	this.descr = "";

	this.sections = [];

	this.addSection();
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

Exam.prototype.addSection = function(){
	var es = new ExamSection;
	this.sections.push(es);
	return es;
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

/**************************************************************
	One exam can have multiple sections, each with it's
	title/description and a lsit of questions (from general
	DB pool)
***************************************************************/
function ExamSection(){
	this.title = "";
	this.descr = "";
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

/**************************************************************
	Exam Questions could be used more than in one exam
***************************************************************/
function ExamQuestion(){
	this.mc = undefined;	// multi-choice (if true) or plain text (if false)
	this.text = "";
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
