/*
	Exam object (version 2.0 of the exam rendering and logic code)
*/

/*
	Some common-code utilities. Specifically:
	- LZW compression/decompression
*/
var LZW = {
	arr2Str: function(_arr){
		for(var rez = "", i = 0; i < _arr.length; ++i) {rez += String.fromCharCode(_arr[i]);}
		return window.btoa(unescape(encodeURIComponent( rez )));
	},
	str2Arr: function(_str){
		_str = decodeURIComponent(escape(window.atob( _str )));
		for(rez = [], i = 0; i < _str.length; ++i) {rez.push(_str.charCodeAt(i));}
		return rez;
	},

    compress: function (uncompressed){
        "use strict";
        var i, c, wc, w = "", dictionary = {}, result = [], dictSize = 256;
        for(i = 0; i < 256; ++i) {dictionary[String.fromCharCode(i)] = i;}
 
		uncompressed = encodeURIComponent(uncompressed);
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
        return this.arr2Str( result );
    },
 
    decompress: function (compressed){
        "use strict";
		compressed = this.str2Arr( compressed );
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
        return decodeURIComponent(result);
    }
}, // For Test Purposes
    comp = LZW.compress("TOBEORNOTTOBEORTOBEORNOT"),
    decomp = LZW.decompress(comp);

// replace new-line characters with <br /> HTML tags
function EOL2BR(_str){
	return _str.replace(/\n/g, "<br />");
}

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

function loadExamDB(_uri, _success){
	if($ === undefined)
		return;

	var jqxhr = $.get(_uri, function(_data, _textStatus, _jqXHR){
		var db = new ExamDB(_uri);
		db.load( LZW.decompress(_data) );
		if( _success && typeof _success === 'function'){
			_success(db);
		}
	})
	.fail(function(){alert("Error loading exam DB. Most probable cause is that you are running the HTML file from local file system. This will no longer work - you HAVE to run it in a real web server.");})
	.always(function(){});

//	jqxhr.done(function(){alert("Success loading exam DB");});
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

ExamDB.suffix = "edb";
ExamDB.defaultName = "---noname---";
// read directory and return list of DBs in it
ExamDB.list = function(){
	var rez = [];
	try{
		var fso = new ActiveXObject("Scripting.FileSystemObject");
		var files = new Enumerator( fso.getFolder("./").files );
		for(; !files.atEnd(); files.moveNext()){
			var file = files.item();
			if(fso.getExtensionName(file) === ExamDB.suffix){
				rez.push( fso.getBaseName(file) );
			}
		}
		if(rez.length < 1)
			throw "No DB files found";
		rez = rez.sort();
	}catch(_e){
		alert(_e);
		rez.push(ExamDB.defaultName);
	}
	return rez;
}

ExamDB.prototype.makeFullFName = function(){
	return "./" + this.fname + "." + ExamDB.suffix;
}

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

ExamDB.prototype.toString = function(){
	var i;
	// temporarily break up the circular references to allow for JSON's stringification
	for(i = 0; i < this.exams.length; ++i)
		delete this.exams[i].db;

	var str = LZW.compress( JSON.stringify(this) );

	// re-introduce the circular references back into the hierarchy
	for(i = 0; i < this.exams.length; ++i)
		this.exams[i].db = this;

	return str;
}

ExamDB.prototype.save = function(){
	try{
		if( ! this.fname )
			return false;

		var fso = new ActiveXObject("Scripting.FileSystemObject");
		var fileOut = fso.openTextFile(this.makeFullFName(), 2, true, 0);
		fileOut.write( this.toString() );
		fileOut.close();
		delete fileOut;
		return true;
	}catch(_e){
		alert(_e);
	}
	return false;
}
// load from either a file or a JSON string
ExamDB.prototype.load = function(_str){
	if( ! _str ){
		if(this.fname){
			try{
				var fname = this.makeFullFName();
				var fso = new ActiveXObject("Scripting.FileSystemObject");
				var fileIn = fso.openTextFile(fname, 1, false, 0);
				_str = LZW.decompress( fileIn.readAll() );
				fileIn.close();
				delete fileIn;
			}catch(_e){
				alert(_e);
				_str = "";
			}
		}else{
			alert("Filename is empty, cannot load DB from disk");
			return this;
		}
	}
	
	if( _str ){
		return this.build(JSON.parse(_str));
	}else{
		//alert("DB is empty");
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
	//var oldName = this.fname;
	this.fname = _fname;
/*	if( oldName === ExamDB.defaultName ){
		this.load();
	}else{
		this.save();
	}*/
	this.save();
	return this;
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

Exam.prototype.domHeader = function(){
	var $jar = $("<div>").addClass("jar-exam-title");
	$jar.append( $("<h1>").append( EOL2BR(this.getTitle()) ) );
	$jar.append( $("<h2>").append( EOL2BR(this.getDescr()) ) );
	return $jar;
}

Exam.prototype.runCheck = function( _$jar ){
	var $sections = _$jar.find(".jar-exam-section");
	var correctCount = 0;
	var totalCount = 0;
	for(var i = 0; i < $sections.length; ++i){
		var dom = $sections[i];
		correctCount += dom.examSection.runCheck( dom );
		totalCount += dom.examSection.getList().length;
	}
	return {correct: correctCount, total: totalCount};
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

ExamSection.prototype.dom = function(_qs){
	var $jar = $("<div>").addClass("jar-exam-section");
	$jar.append( $("<h1>").append( EOL2BR(this.getTitle()) ) );
	$jar.append( $("<h2>").append( EOL2BR(this.getDescr()) ) );
	for(var i in this.list){
		var q = _qs[ this.list[i] ];
		$jar.append( q.dom(i) );
	}
	$jar[0].examSection = this;
	return $jar;
}

ExamSection.prototype.runCheck = function( _jar ){
	var $questions = $(_jar).find(".jar-exam-question");
	var correctCount = 0;
	for(var i = 0; i < $questions.length; ++i){
		var dom = $questions[i];
		if( dom.examQuestion.runCheck( dom ) ){
			++correctCount
		}
	}
	return correctCount;
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
ExamQuestion.prototype.dom = function(_idx){
	var $jar = $("<div>").addClass("jar-exam-question");
	$jar.append( $("<div>").addClass("question-text").html("#" + (+_idx+1) + ": " + this.text) );
	if(this.mc){
		for(var i in this.answers){
			if( ! isEmpty(this.answers[i]) )
				$jar.append( this.answers[i].dom(i) );
		}
	}
	$jar[0].examQuestion = this;
	return $jar;
}

ExamQuestion.prototype.runCheck = function( _jar ){
	var $as = $(_jar).find(".jar-answer-set");
	var allCorrect = true;
	for(var i = 0; i < $as.length; ++i){
		var dom = $as[i];
		allCorrect &= dom.examAnswerSet.runCheck( dom );
	}
	return allCorrect;
}

/**************************************************************
	List of possible answers to a question
***************************************************************/
function ExamQuestionAnswerSet(){
	this.list = [];
	this.correct = "";	// index to the correct asnwer
	this.feedback = "";	// text (HTML) to show when the answer is incorrect
	
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
ExamQuestionAnswerSet.prototype.getCorrectAnswerAsChar = function(){
	return this.correct !== "" ? String.fromCharCode(64 + this.correct) : "";
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
ExamQuestionAnswerSet.prototype.dom = function(_label){
	var $jar = $("<div>").addClass("jar-answer-set");
	$jar.append( $("<span>").addClass("answer-set-label").append((+_label+1)+")") );
	var name = "qas_" + Math.random();
	for(var i in this.list){
		if( ! this.list[i] ){
			continue;	// skip empty answers
		}
		var $a = $("<span>").addClass("answer");
		var $t = $("<table>");
		var $radio = $("<input>").attr({"id": name + i, "type": "radio", "name": name});
		var $label = $("<label>").attr("for", name + i);//.text( this.list[i] );
		$radio[0].examAnswerIdx = +i + 1;
/*		$t.append(
			$("<tr>")
				.append( $("<td>").append( $radio ) )
				.append( $("<td>").append( $label ) )
		);
		$jar.append( $a.append( $t ) );*/
		$jar.append( $a.append(
			$label.append(
				$t.append(
					$("<tr>")
						.append( $("<td>").append( $radio ) )
						.append( $("<td>").text( this.list[i] ) )
					)
				)
			)
		);
	}
	$jar.append( $("<div>").addClass("pusher") );
	if( this.feedback ){
		$jar.append( $("<div>").addClass("feedback").html(this.feedback) );
	}
	$jar[0].examAnswerSet = this;
	$jar[0].rbName = name;	// so that later on we can find our radiobuttons :)
	return $jar;
}

// check the answer and return true/false - the result of the check
ExamQuestionAnswerSet.prototype.runCheck = function( _jar ){
	var rbName = _jar.rbName;
	var $selected = $(_jar).find("input[type=radio]:checked");
	var idx = $selected[0] && $selected[0].examAnswerIdx || -1;
	var correct = ( idx === +this.correct );
	var $feedback = $(_jar).find(".feedback");
	$feedback.css("display", (correct ? "none" : "block") );
	$(_jar).removeClass("correct wrong");
	$(_jar).addClass( correct ? "correct" : "wrong" );
	return correct;
}

/**************************************************************
	Generators of HTML elements representing the exam
***************************************************************/
var Exam;