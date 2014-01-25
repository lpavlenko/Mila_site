/*
	Exam object (version 2.0 of the exam rendering and logic code)
*/

/*
	Some common-code utilities. Specifically:
	- LZW compression/decompression
*/

arr2B64 = function(_arr){
	for(rez = "", i = 0; i < _arr.length; ++i) {rez += String.fromCharCode(_arr[i]);}
	return window.btoa(unescape(encodeURIComponent( rez )));
}
b642Arr = function(_str){
	_str = decodeURIComponent(escape(window.atob( _str )));
	for(rez = [], i = 0; i < _str.length; ++i) {rez.push(_str.charCodeAt(i));}
	return rez;
}

var LZW = {
    compress: function (uncompressed){
        "use strict";
        var i, c, wc, w = "", dictionary = {}, result = [], dictSize = 256;
        for(i = 0; i < 256; ++i) {dictionary[String.fromCharCode(i)] = i;}
 
        for(i = 0; i < uncompressed.length; ++i){
            c = uncompressed.charAt(i);
            wc = w + c;
            if (dictionary.hasOwnProperty(wc)){
                w = wc;
            }else{
                result.push(dictionary[w]);
                dictionary[wc] = dictSize++;
                w = String(c);
            }
        }
        if(w !== "") {result.push(dictionary[w]);}
        return arr2B64( result );
    },
 
    decompress: function (compressed){
        "use strict";
		compressed = b642Arr( compressed );
        var i, w, result, k, entry = "", dictionary = [], dictSize = 256;
        for(i = 0; i < 256; i += 1) {dictionary[i] = String.fromCharCode(i);}
 
        w = String.fromCharCode(compressed[0]);
        result = w;
        for(i = 1; i < compressed.length; i += 1){
            k = compressed[i];
            if(dictionary[k]){entry = dictionary[k];}
            else{
                if(k === dictSize) {entry = w + w.charAt(0);}
                else {return null;}
            }
            result += entry;
            dictionary[dictSize++] = w + entry.charAt(0);
            w = entry;
        }
        return result;
    }
}, // For Test Purposes
    comp = LZW.compress("TOBEORNOTTOBEORTOBEORNOT"),
    decomp = LZW.decompress(comp);


// check if this (and all sub-objects) have no data to speak of
function isEmpty(_obj){
	if( _obj === undefined || _obj === null )
		return true;
	switch(typeof _obj)
	{
		case null: return true;
		case "undefined": return true;
		case "function": return true;
		case "string": return _obj.length === 0;
		case "boolean": return _obj === undefined;
		case "number": return _obj === undefined;
		case "object":
			for(var i in _obj){
				if( i === "db" )
					continue;	// very special case for avoiding circular references
				if( ! isEmpty(_obj[i]) )
					return false;
			}
			return true;	// didn't find anything, so this must be truly empty then?
			break;
		default:
			console.log(typeof _obj);
			return true;
	}
}

function numericArray(_arr){
	for(var i = 0; i < _arr.length; ++i){
		_arr[i] = +_arr[i];
	}
}

/**************************************************************
	ExamDB is a file with all the exams for one DB
***************************************************************/
function ExamDB(_fname){
	this.fname = _fname || "";	// the ".edb" suffix is NOT part of this field!
	this.exams = [];			// list of exams in this DB
	this.questions = [];		// a pool of all the questions for this set of exams
	
	this.addExam();
	this.addQuestion();
	
	return this;
}

ExamDB.suffix = ".ebd";

// build this object from a template (loaded from JSON)
ExamDB.prototype.build = function(_obj){
	var i;
	var objList;
	var lastAddedObj;
	this.exams = [];
	this.questions = [];

	objList = _obj.exams;
	for(i = 0; i < objList.length; ++i){
		lastAddedObj = this.addExam().build(objList[i]);
	}
	if( lastAddedObj === undefined || ! isEmpty(lastAddedObj))
		this.addExam();

	lastAddedObj = undefined;
	objList = _obj.questions;
	for(i = 0; i < objList.length; ++i){
		lastAddedObj = this.addQuestion().build(objList[i]);
	}
	if( lastAddedObj === undefined || ! isEmpty(lastAddedObj))
		this.addQuestion();
	return this;
}

ExamDB.prototype.save = function(){
	if( ! this.fname )
		throw "No filename specified";

	var i;
	// temporarily break up the circular references to allow for JSON's stringification
	for(i = 0; i < this.exams.length; ++i)
		delete this.exams[i].db;
	var str = JSON.stringify(this);
	// re-introduce the circular references back in the hierarchy
	for(i = 0; i < this.exams.length; ++i)
		this.exams[i].db = this;

	try{
		var data = LZW.compress(str);
		var fso = new ActiveXObject("Scripting.FileSystemObject");
	}catch(_e){
	}
	return this;
}
// load from either a file or a JSON string
ExamDB.prototype.load = function(_str){
	if( this.fname ){
		// TODO: implement
		//_str = read_from_file();
	}
	
	if( _str ){
		var obj = JSON.parse(_str);
		this.build(obj);
/*		// re-introduce the circular references back in the hierarchy
		for(i = 0; i < this.exams.length; ++i)
			this.exams[i].db = this;*/
		return this;
	}else{
		throw "No filename or JSON string";
	}
}

ExamDB.prototype.getFname = function(){
	return this.fname;
}

ExamDB.prototype.getQuestions = function(){
	return this.questions;
}

ExamDB.prototype.addExam = function(){
	var exam = new Exam(this);
	this.exams.push(exam);
	return exam;
}

ExamDB.prototype.getExams = function(){
	return this.exams;
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
	return this.exams;
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
	
	return this;
}

// build this object from a template (loaded from JSON)
Exam.prototype.build = function(_obj){
	this.title = _obj.title;
	this.misc = _obj.misc;
	this.mock = _obj.mock;
	this.descr = _obj.descr;
	this.sections = [];
	var objList = _obj.sections;
	var i;
	var lastAddedObj;
	for(i = 0; i < objList.length; ++i){
		lastAddedObj = this.addSection().build(objList[i]);
	}
	if( lastAddedObj === undefined || ! isEmpty(lastAddedObj))
		this.addSection();
	return this;
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

Exam.prototype.removeSection = function(_s){
	this.sections.splice( this.sections.indexOf(_s), 1 );
	return this;
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
	this.list = [];	// list of questions for this exam section
	
	return this;
}

// build this object from a template (loaded from JSON)
ExamSection.prototype.build = function(_obj){
	this.title = _obj.title;
	this.descr = _obj.descr;
	this.list = _obj.list;
	return this;
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

ExamSection.prototype.setList = function(_str, _delim){
	this.list = _str.split(_delim);
	numericArray(this.list);
	return this;
}

ExamSection.prototype.appendToList = function(_idx){
	this.list.push(_idx);
	return this;
}

ExamSection.prototype.removeFromList = function(_i){
	this.list.splice( this.list.indexOf(_i), 1 );
	return this;
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
	
	return this;
}

// build this object from a template (loaded from JSON)
ExamQuestion.prototype.build = function(_obj){
	this.mc = _obj.mc;
	this.text = _obj.text;
	this.answers = [];
	var objList = _obj.answers;
	var i;
	for(i = 0; i < objList.length; ++i){
		this.addAnswer().build(objList[i]);
	}
	return this;
}

ExamQuestion.prototype.getText = function(_str){
	return this.text;
}
ExamQuestion.prototype.setText = function(_str){
	this.text = _str;
	return this;
}
ExamQuestion.prototype.addAnswer = function(){
	var eqa = new ExamQuestionAnswerSet;
	this.answers.push(eqa);
	return eqa;
}
ExamQuestion.prototype.getType = function(){
	switch(this.mc){
		case true: return "mc";
		case false: return "text";
	}
	return "";
}
ExamQuestion.prototype.setMC = function(_b){
	this.mc = _b;
	return this;
}
ExamQuestion.prototype.getAnswers = function(){
	return this.answers;
}

/**************************************************************
	List of possible answers to a question
***************************************************************/
function ExamQuestionAnswerSet(){
	this.list = [];
	this.correct = "";	// index to the correct asnwer
	this.feedback = "";	// text (HTML) to show if the answer is incorrect
	
	return this;
}

// build this object from a template (loaded from JSON)
ExamQuestionAnswerSet.prototype.build = function(_obj){
	this.list = _obj.list;
	this.correct = _obj.correct;
	this.feedback = _obj.feedback;
	
	return this;
}

ExamQuestionAnswerSet.prototype.getList = function(){
	return this.list;
}
ExamQuestionAnswerSet.prototype.setList = function(_str, _delim){
	this.list = _str.split(_delim);
	return this;
}
ExamQuestionAnswerSet.prototype.getCorrectAnswer = function(){
	return this.correct;
}
ExamQuestionAnswerSet.prototype.setCorrectAnswer = function(_idx){
	this.correct = _idx;
	return this;
}
ExamQuestionAnswerSet.prototype.getFeedback = function(){
	return this.feedback;
}
ExamQuestionAnswerSet.prototype.setFeedback = function(_fb){
	this.feedback = _fb;
	return this;
}
