var strings = {
	exam: {
		title: "Enter new title",
		misc: "Additional info (like date or version). Not shown to end user",
		descr: "Full description of this exam. You can use HTML tags in here"
	},
	es: {
		title: "Section's title",
		descr: "Section's description. You can use HTML tags in here"
	},
	eq: {
		text: "Question's text. You can use HTML here"
	}
};
var DBs = {};

function TRACE(_fn){
	//console.log(_fn.name);
}

function extractFname(_path){
	TRACE("extractFname");
	return (_path.split("\\").pop() || _path.split("/").pop()).split(".")[0];
}

function listDBs(){
	TRACE("listDBs");
	// TODO: implement an actual read from disk (current dir only)
	return [""];	// one extra for new (blank) exam
}

function saveExam(){
	TRACE("saveExam");
	// TODO: implement
}

/**************************************************************
	Input data cleansing
***************************************************************/
function correctAnswer2Idx(_str){
	var c = _str.charCodeAt(_str.length - 1);
	if( c > 0x60 )
		return c - 0x61;
	else if( c > 0x40 )
		return c - 0x41;
	else
		return c - 0x30;
}
/**************************************************************
	Locate currently selected objects on our page
***************************************************************/
// go up the hierarchy chain and find the element that has the
// provided property name
function locateJarUpTheChain(_curr, _prop_name){
	if( ! _curr || _curr === document )
		return null;
	if( _curr[_prop_name] !== undefined )
		return _curr;
	return locateJarUpTheChain(_curr.parentNode, _prop_name);
}
// get the DB that is currently selected with a radio button (via it's ID in a form of "<fname>_db")
function getCurrDB(){
	TRACE("getCurrDB");
	return DBs[ $("#db_list input[type=radio]:checked").attr("id").match(/(.*?)_db/)[1] ];
}
// get currently selected Exam (via radio button's ID in a form of "exam_title_<idx>")
// and it's index in DB's list
function getCurrExam(){
	return locateJarUpTheChain( $("#exams_list input[type=radio]:checked")[0], "exam").exam;
}
// get currentl yselected Exam Section via "selected" CSS class and DOM's property "idx"
function getCurrSection(){
	return $("#exam_sections .selected")[0].examSection;
}

/**************************************************************
	Expand input fields as needed to accommodate new entries
***************************************************************/
// add new (created) DB to list if no more empty slots are available in the list
function addDBIfNeeded(){
	var $list = $("#db_list input[type=text]");
	for(var i = 0; i < $list.length; ++i){
		if( $list.get(i).value.length < 1 )
			return;
	}
	// if we are here then that means there are no empty slots left - need to create a new one
	var DB = new ExamDB();
	var fname = DB.getFname();
	DBs[fname] = DB;
	$("#db_list").append( genDomDB(fname) );
}
function addExamIfNeeded(){
	var $list = $("#exams_list input[type=text]");
	if( getCurrDB().getExams()[ $list.length - 1 ].title.length < 1 )
		return;

	// if we are here that means there are no empty slots left - need to create a new one
	$("#exams_list").append( genDomExam( getCurrDB().addExam(), $list.length ) );
}
function addSectionIfNeeded(_jar){
	if( _jar === $("#exam_sections>div.exam_section:last")[0] ){
		var $es = genDomSection( getCurrExam().addSection() );
		$("#exam_sections").append($es);
	}
}
function addQuestionIfNeeded(_jar){
	var db = getCurrDB();
	if( _jar === $("#questions>div.question:last")[0] ){
		var $q = genDomQuestion(db.addQuestion(), $("#questions>div.question").length );
		$("#questions").append($q);
	}
}
function addAnswerIfNeeded(_jar){
	var $list = $(_jar).find(".answers div textarea");
	if( $list.length < 1 || $list.last().val().length > 0 ){
		var q = _jar.question;
		$(_jar).find(".answers").append( genDomOneAnswerSet( $list.length, q.addAnswer()) );
	}
}

/**************************************************************
	Non-trivial data updates
***************************************************************/
function updateCurrDBFname(_new_fname){
	TRACE("updateCurrDBFname");
	var db = getCurrDB();
	var old_fname = db.getFname();
	if(DBs[_new_fname]){
		alert("That file name already exists, can't use it twice");
		$("#" + old_fname + "_db").siblings("input[type=text]").val(old_fname);
		return;
	}
	db.changeFname(_new_fname);
	$("#" + old_fname + "_db")
		.attr("id", _new_fname + "_db")
		.siblings("input[type=text]").val(_new_fname);
	DBs[_new_fname] = db;
	delete DBs[old_fname];
	addDBIfNeeded();
}
function updateCurrExamTitle(_new_title){
	getCurrExam().setTitle(_new_title);
	$("#exams_list input[type=radio]:checked").siblings("input[type=text]").val(_new_title);
	$("#exam_title").val(_new_title);
	addExamIfNeeded();
}

/**************************************************************
	Main init function
***************************************************************/
$(document).ready(function(){
	var i;
	var dbList = listDBs();
	for(var i in dbList){
		var db = new ExamDB(dbList[i]);
		DBs[db.getFname()] = db;
		$("#db_list").append( genDomDB( db.getFname() ) );
	}
	$("#db_list input[type=radio]:first").click();

	renderDB( DBs[ dbList[0] ] );

	$("body")
		.delegate("input, select, textarea, button", "blur", saveExam);

	$("#db_list")
		.delegate("input[type=radio]", "change", function(){
			if(this.checked){
				var firstExam = locateJarUpTheChain( $("#exams_list input[type=radio]:first")[0], "exam").exam;
				var db = getCurrDB();
				if(firstExam !== db.getExams()[0]){
					renderDB( db );
				}
			}
		})
		.delegate(".left-right", "focusin", function(){
			if( $(this).find("input[type=radio]").prop("checked") !== true )
				$(this).find("input[type=radio]").prop("checked", true).change();
		})
		.delegate("button", "click", function(){
			$(this).find("input[type=file]")[0].click();
		})
		.delegate("input[type=file]", "change", function(){
			var new_fname = extractFname(this.value);
			updateCurrDBFname( extractFname(new_fname.trim()) );
		})
		.delegate("input[type=text]", "change", function(){
			this.value = this.value.trim();
			updateCurrDBFname(this.value);
		});

	$("#exams_list")
		.delegate(".left-right", "focusin", function(){
			$(this).find("input[type=radio]").prop("checked", true);
			renderExam( getCurrExam() );
		})
		.delegate("input[type=text]", "change", function(){
			updateCurrExamTitle(this.value);
			addExamIfNeeded();
		});

	$("#exam_misc") .change(function(){getCurrExam().setMisc (this.value);});
	$("#exam_descr").change(function(){getCurrExam().setDescr(this.value);});
	$("#exam_title").change(function(){updateCurrExamTitle(this.value);});
	$("#exam_type_mock, #exam_type_exe").click(function(){
		switch(this.id){
			case "exam_type_mock":
				getCurrExam().setMock(true);
				break;
			case "exam_type_exe":
				getCurrExam().setMock(false);
				break;
		}
	});

	$("#exam_sections")
		.delegate("input, textarea", "change", function(){
			var jar = locateJarUpTheChain(this, "examSection");
			var es = jar.examSection;
			if(this.id.match(/title/)){
				es.setTitle(this.value);
			}else if(this.id.match(/descr/)){
				es.setDescr(this.value);
			}else if(this.id.match(/list/)){
				getCurrSection().setList(this.value, ",");
				markQuestions( getCurrDB() );
			}
			addSectionIfNeeded(jar);
		})
		.delegate(".exam_section", "focusin", function(){
			$("#exam_sections .exam_section").removeClass("selected");
			$(this).addClass("selected");
			markQuestions( getCurrDB() );
		})
		.delegate(".exam_section button", "click", function(){
			// TODO: implement deletion of a section
		})
		.delegate("button.alert", "click", function(){
			var jar = locateJarUpTheChain(this, "examSection");
			getCurrExam().removeSection( jar.examSection );
			$(jar).prev().trigger("focusin");
			$(jar).remove();
		});

	$("#questions")
		.delegate("input[type=checkbox]", "change", function(){
			var es = getCurrSection();
			var idx = getCurrDB().getQuestions().indexOf( locateJarUpTheChain(this, "question").question );
			if(this.checked)
				es.appendToList(idx);
			else
				es.removeFromList(idx);
			$("#exam_sections .selected").find("textarea:last").val( es.getList().join(",") );
		})
		.delegate("input[type=radio]", "change", function(){
			var qJar = locateJarUpTheChain(this, "question");
			var mc = !! this.id.match(/_mc/);
			qJar.question.setMC( mc );
			if(mc){
				$(qJar).find("fieldset.answers").css( {"display": ""} );
				addAnswerIfNeeded(qJar);
			}else{
				$(qJar).find("fieldset.answers").css( {"display": "none"} );
			}
		})
		.delegate("input, textarea", "change", function(){
			addQuestionIfNeeded( locateJarUpTheChain(this, "question") );
		})
		.delegate(".question textarea", "change", function(){
			locateJarUpTheChain(this, "question").question.setText(this.value);
		})
		.delegate(".answers textarea", "keyup", function(){
			locateJarUpTheChain(this, "answerSet").answerSet.setList(this.value, "\n");
			addAnswerIfNeeded(locateJarUpTheChain(this, "question"));
		})
		.delegate(".correct-answer input[type=text]", "keyup", function(){
			var correct = correctAnswer2Idx(this.value);
			locateJarUpTheChain(this, "answerSet").answerSet.setCorrectAnswer(correct);
			this.value = String.fromCharCode(0x40 + correct);
		});
});

function markQuestions(_db){
	var list = getCurrSection().getList();
	$("#questions .question input[type=checkbox]").each(function(_idx, _el){
		var q_idx = _db.getQuestions().indexOf( locateJarUpTheChain(_el, "question").question );
		if( list.indexOf(q_idx) !== -1){
			$(_el).prop("checked", true);
		}else{
			$(_el).prop("checked", false);
		}
	});
	// TODO: implement
}

/**************************************************************
	render various blocks onto the page
***************************************************************/
function renderDB(_db){
	var exams = _db.getExams();
	$("#exams_list>div").remove();
	for(var i = 0; i < exams.length; ++i){
		$("#exams_list").append( genDomExam( exams[i], i ) );
	}
	$("#exams_list input[type=radio]:first").click();

	$("#questions>div").remove();
	var qs = _db.getQuestions();
	for(i = 0; i < qs.length; ++i){
		var $q = genDomQuestion(qs[i], i);
		$("#questions").append($q);
	}

	renderExam(exams[0]);
	
	markQuestions(_db);
}
function renderExam(_exam){
	$("#exam_type_mock, #exam_type_exe").prop("checked", false);
	$("#exam_type_" + _exam.getType()).prop("checked", true);
	$("#exam_title").val( _exam.getTitle() || strings.exam.title );
	$("#exam_misc") .val( _exam.getMisc()  || strings.exam.misc  );
	$("#exam_descr").val( _exam.getDescr() || strings.exam.descr );
	
	renderSections(_exam);
}
function renderSections(_exam){
	$("#exam_sections>div").remove();
	for(var i = 0; i < _exam.getSections().length; ++i){
		var $es = genDomSection( _exam.getSections()[i], (i === 0) );
		if(i === 0)
			$es.addClass("selected");
		$("#exam_sections").append($es);
	}
}

/**************************************************************
	generators of DOM structures that represent data
***************************************************************/
function genDomDB(_fname){
	return $("<div>")
			.addClass("left-right")
			.appendRadioWithTextInput(_fname + "_db", "db_list", _fname)
			.append( $("<button>").text("...").append( $("<input>").attr( {"type": "file" } ) ) );
}
function genDomExam(_exam, _idx){
	var $jar = $("<div>")
			.addClass("left-right")
			.appendRadioWithTextInput("exam_title_" + _idx, "exam_list", _exam.getTitle() || strings.exam.title);

	$jar[0].exam = _exam;

	return $jar;
}
function genDomSection(_s, _no_delete_button){
	var es_id = "section_" + Math.random();
	var $jar = $("<div>").addClass("exam_section left-right")
		.append(
			$("<div>")
				.appendTextInputWithLabel(
					es_id + "_title",
					"Title:",
					_s.getTitle() || strings.es.title
				)
		)
		.append(
			$("<div>")
				.appendLabelWithTextarea(
					es_id + "_descr",
					"Descr.:",
					_s.getDescr() || strings.es.descr,
					"tall"
				)
		)
		.append(
			$("<div>")
				.appendLabelWithTextarea(
					es_id + "_list",
					"List:",
					_s.getList().join(", "),
					""
				)
		);
	if( ! _no_delete_button ){
		$jar.append( $("<button>").text("Delete this exam section").addClass("alert") );
	}
	$jar[0].examSection = _s;
	return $jar;
}
function genDomQuestion(_q, _idx){
	var b_id = "q_" + _idx;
	var r_name = b_id + "_type";
	var $jar = $("<div>").addClass("question")
		.append(
			$("<span>").addClass("grouped left-right")
				.appendCheckboxWithLabel(b_id, "Include in this exam section")
		)
		.append(
			$("<span>").addClass("grouped left-right")
				.appendRadioWithLabel(b_id + "_type_mc", r_name, "Multi-choice")
				.appendRadioWithLabel(b_id + "_type_text", r_name, "Text")
		)
		.append(
			$("<span>").addClass("question_info").text("Question#: " + (_idx + 1))
		)
		.append(
			$("<textarea>").val(_q.getText())/*.attr( {"id": b_id + "_full_text"} )*/
		)
		.append( genDomAnswers(_q) );

	$jar[0].question = _q;
	$jar.find("#" + b_id + "_type_" + _q.getType()).prop("checked", true);

	return $jar;
}
function genDomAnswers(_q){
	var $jar = $("<fieldset>").addClass("answers")
		/*.append( $("<legend>").text("Lists of answers, one per line") )*/;
	var list = _q.getAnswers();
	for(var i = 0; i < list.length; ++i){
		$jar.append( genDomOneAnswerSet( i, list[i]) );
	}
	if( _q.getType() === "text" )
		$jar.css( {"display": "none"} );
	return $jar;
}
function genDomOneAnswerSet(_a_idx, _as){
	//var b_id = "q" + _q_idx + "_a" + _a_idx;
	var $inset = $("<span>")
		.addClass("grouped left-right correct-answer")
		.appendTextInputWithLabel(
			"",//b_id + "_correct",
			"Correct answer:",
			_as.getCorrectAnswer()
		);

	var $answer = $("<div>")
		.addClass("left-right")
		.appendLabelWithTextarea(
			"",//b_id + "_set",
			String.fromCharCode(65 + _a_idx) + ")",
			_as.getList().join("\n"),
			"",
			$inset
		);

	$answer[0].answerSet = _as;

	return $answer;
}

/**************************************************************
	generators of DOM - helper functions to reduce repetitivness
***************************************************************/
$.prototype.appendRadioWithLabel = function(_id, _name, _label){
	this
		.append( $("<input>").attr( {"id": _id, "type": "radio", "name": _name} ) )
		.append( $("<label>").attr( {"for": _id} ).text(_label) );
	return this;
}
$.prototype.appendRadioWithTextInput = function(_id, _name, _value){
	this
		.append( $("<input>").attr( {"id": _id, "type": "radio", "name": _name} ) )
		.append( $("<input>").attr( {"type": "text", "value": _value} ) );
	return this;
}

$.prototype.appendCheckboxWithLabel = function(_id, _label){
	this
		.append( $("<input>").attr( {"id": _id, "type": "checkbox"} ) )
		.append( $("<label>").attr( {"for": _id} ).text(_label) );
	return this;
}

$.prototype.appendTextInputWithLabel = function(_id, _label, _value){
	this
		.append( $("<label>").attr( {"for": _id} ).text(_label) )
		.append( $("<input>").attr( {"id": _id, "type": "text"} ).val(_value) );
	return this;
}
$.prototype.appendLabelWithTextarea = function(_id, _label, _value, _class, _$inset){
	this
		.append( $("<label>").attr( {"for": _id} ).text(_label) )
		.append( _$inset )
		.append( $("<textarea>").attr( {"id": _id} ).addClass(_class || "").text(_value) );
	return this;
}
