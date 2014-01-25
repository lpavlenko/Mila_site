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
	},
	qa: {
		text: "Feedback's text. You can use HTML here"
	}
};
var DBs = {};

function listDBs(){
	var list = ExamDB.list();
	if(list[ list.length - 1 ].length > 0)
		list.push("");
	return list;
}

var saveExamScheduledJob = null;
var saveExamScheduledList = [];	// list of exams scheduled to be saved
function scheduleSaveExam(){
	var dbIdx = makeSafeFname( getCurrDB().getFname() );
	if( saveExamScheduledJob != null ){
		window.clearTimeout(saveExamScheduledJob);
		var idx = saveExamScheduledList.indexOf(dbIdx);
		if(idx > -1){
			saveExamScheduledList.splice(idx, 1);
		}
	}
	$("#" + dbIdx + "_db").siblings(".file-status").addClass("scheduled");
	saveExamScheduledJob = window.setTimeout(launchSaveExam, 5 * 1000);
	saveExamScheduledList.push(dbIdx);
}
function launchSaveExam(){
	saveExamScheduledJob = null;

	// perform the actual saving of DBs
	window.setTimeout(function(){
		saveExamScheduledList = saveExamScheduledList.sort();
		for(i in saveExamScheduledList){
			var dbIdx = saveExamScheduledList[i];
			$("#" + dbIdx + "_db").siblings(".file-status").removeClass("scheduled").addClass("busy");
			if( DBs[ dbIdx ].save() ){
				saveExamScheduledList[i] = null;
				$("#" + dbIdx + "_db").siblings(".file-status").removeClass("busy");
			}
		}
		saveExamScheduledList = saveExamScheduledList.sort();
		var idxOfNull = saveExamScheduledList.indexOf(null);
		if( idxOfNull > -1 ){
			saveExamScheduledList.splice( idxOfNull );
		}
	}, 1);
}

/**************************************************************
	Input data cleansing
***************************************************************/
function correctAnswer2Idx(_str){
	var c = _str.charCodeAt(_str.length - 1);
	if( c > 0x60 )
		return c - 0x60;
	else if( c > 0x40 )
		return c - 0x40;
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
	var db = new ExamDB();
	var fname = db.getFname();
	DBs[ makeSafeFname(fname) ] = db;
	$("#db_list").append( genDomDB(fname) );
}
function addExamIfNeeded(){
	var $list = $("#exams_list input[type=text]");
	if( getCurrDB().getExams()[ $list.length - 1 ].title.length > 0 )
		$("#exams_list").append( genDomExam( getCurrDB().addExam() ) );
}
function addSectionIfNeeded(_jar){
	if( _jar === $("#exam_sections>div.exam_section:last")[0] ){
		var $es = genDomSection( getCurrExam().addSection(), true );
		$("#exam_sections").append($es);
	}
}
function addQuestionIfNeeded(_jar){
	if( _jar === $("#questions>div.question:last")[0] ){
		var $q = genDomQuestion(getCurrDB().addQuestion(), $("#questions>div.question").length );
		$("#questions").append($q);
	}
}
function addAnswerIfNeeded(_jar){
	var $list = $(_jar).find(".answers div textarea.answer-list");
	if( $list.length < 1 || $list.last().val().length > 0 ){
		$(_jar).find(".answers").append( genDomOneAnswerSet( $list.length, _jar.question.addAnswer()) );
	}
}

/**************************************************************
	Non-trivial data updates
***************************************************************/
function updateCurrDBFname(_new_fname){
	var db = getCurrDB();
	var old_fname = db.getFname();
	if(DBs[ makeSafeFname(_new_fname) ]){
		alert("That file name already exists, can't use it twice");
		$("#" + makeSafeFname(old_fname) + "_db").siblings("input[type=text]").val(old_fname);
		return;
	}
	db.changeFname(_new_fname);
	$("#" + makeSafeFname(old_fname) + "_db")
		.attr("id", makeSafeFname(_new_fname) + "_db")
		.siblings("input[type=text]").val(_new_fname);
	DBs[ makeSafeFname(_new_fname) ] = db;
	delete DBs[ makeSafeFname(old_fname) ];
	addDBIfNeeded();
}
function updateCurrExamTitle(_new_title){
	getCurrExam().setTitle(_new_title);
	$("#exam_title, #exams_list input[type=radio]:checked+input[type=text]").val(_new_title);
	addExamIfNeeded();
}

function makeSafeFname(_fname){
	return encodeURIComponent(_fname);
}
/**************************************************************
	Main init function
***************************************************************/
$(document).ready(function(){
	var dbList = listDBs();
	for(var i in dbList){
		var db = new ExamDB(dbList[i]);
		var fname = db.getFname();
		if(fname)
			db.load();
		DBs[ makeSafeFname(fname) ] = db;
		$("#db_list").append( genDomDB( fname ) );
	}
	$("#db_list input[type=radio]:first").prop("checked", true);

	renderDB( DBs[ makeSafeFname(dbList[0]) ] );

	$("body")
		.delegate("input, select, textarea, button", "change", scheduleSaveExam);

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
		.delegate("*", "focusin", function(){
			if( $(this).find("input[type=radio]").prop("checked") !== true )
				$(this).find("input[type=radio]").prop("checked", true).change();
		})
		.delegate("button", "click", function(){
			$(this).find("input[type=file]")[0].click();
		})
		.delegate("input[type=text]", "change", function(){
			this.value = this.value.trim();
			updateCurrDBFname(this.value);
		});

	$("#exams_list")
		.delegate("*", "focusin", function(){
			$(this).find("input[type=radio]").prop("checked", true);
			// as a nice side-effect this causes the redraw even if we click on the selected exam
			renderExam( getCurrExam() );
		})
		.delegate("input[type=text]", "change", function(){
			updateCurrExamTitle(this.value);
		});

	$("#exam_misc") .change(function(){getCurrExam().setMisc (this.value);});
	$("#exam_descr").change(function(){getCurrExam().setDescr(this.value);});
	$("#exam_title").change(function(){updateCurrExamTitle(this.value);});
	$("[id^=exam_type]").click(function(){getCurrExam().setMock( !! this.id.match(/mock/) );});

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
				markQuestions();
			}
			addSectionIfNeeded(jar);
		})
		.delegate(".exam_section", "focusin", function(){
			$("#exam_sections .exam_section").removeClass("selected");
			$(this).addClass("selected");
			markQuestions();
		})
		.delegate(".exam_section button.alert", "click", function(){
			var jar = locateJarUpTheChain(this, "examSection");
			getCurrExam().removeSection( jar.examSection );
			$(jar).prev().trigger("focusin");
			$(jar).remove();
		});

	$("#questions")
		.delegate("input, textarea", "change", function(){
			addQuestionIfNeeded( locateJarUpTheChain(this, "question") );
		})
		.delegate("input[type=checkbox]", "change", function(){
			var es = getCurrSection();
			var idx = getCurrDB().getQuestions().indexOf( locateJarUpTheChain(this, "question").question );
			if(this.checked)
				es.appendToList(idx);
			else
				es.removeFromList(idx);
			$("#exam_sections .selected textarea:last").val( es.getList().join(",") );
		})
		.delegate("input[id*=_type_][type=radio]", "change", function(){
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
		.delegate(".question textarea.question-text", "change", function(){
			locateJarUpTheChain(this, "question").question.setText(this.value);
		})
		.delegate(".question span.feedback", "mouseover", function(){
			var $ta = $(this).siblings("textarea.feedback");
			$ta.addClass("active").focus();
			if( locateJarUpTheChain(this, "answerSet").answerSet.getFeedback().length < 5 ){
				$ta.select();
			}
		})
		.delegate(".question textarea.feedback", "mouseout", function(){
			$(this).removeClass("active");
			$(this).next().focus();
		})
		.delegate(".question textarea.feedback", "change", function(){
			locateJarUpTheChain(this, "answerSet").answerSet.setFeedback(this.value);
		})
		.delegate(".answers textarea.answer-list", "keyup", function(){
			locateJarUpTheChain(this, "answerSet").answerSet.setList(this.value, "\n");
			addAnswerIfNeeded(locateJarUpTheChain(this, "question"));
		})
		.delegate(".correct-answer input[type=text]", "keyup", function(){
			var correct = correctAnswer2Idx(this.value);
			locateJarUpTheChain(this, "answerSet").answerSet.setCorrectAnswer(correct);
			this.value = String.fromCharCode(0x40 + correct);
			addAnswerIfNeeded(locateJarUpTheChain(this, "question"));
		});
});

function markQuestions(){
	$("#questions .question input[type=checkbox]").each(function(_idx, _el){
		var q_idx = getCurrDB().getQuestions().indexOf( locateJarUpTheChain(_el, "question").question );
		if( getCurrSection().getList().indexOf(q_idx) !== -1){
			$(_el).prop("checked", true);
		}else{
			$(_el).prop("checked", false);
		}
	});
}

/**************************************************************
	render various blocks onto the page
***************************************************************/
function renderDB(_db){
	var exams = _db.getExams();
	$("#exams_list>div").remove();
	for(var i = 0; i < exams.length; ++i){
		$("#exams_list").append( genDomExam( exams[i] ) );
	}
	$("#exams_list input[type=radio]:first").click();

	// we always bundle up exam and questions 1-to-1, so render them together as well
	$("#questions>div").remove();
	var qs = _db.getQuestions();
	for(i = 0; i < qs.length; ++i){
		var $q = genDomQuestion(qs[i], i);
		$("#questions").append($q);
	}

	renderExam(exams[0]);
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
	$("#exam_sections").empty();
	for(var i = 0; i < _exam.getSections().length; ++i){
		var $es = genDomSection( _exam.getSections()[i], (i > 0) );
		if(i === 0)
			$es.addClass("selected");
		$("#exam_sections").append($es);
	}
	
	markQuestions();
}

/**************************************************************
	generators of DOM structures that represent data
***************************************************************/
function genDomDB(_fname){
	var safeName = makeSafeFname(_fname);
	return $("<div>")
			.addClass("left-right")
			.appendRadioWithTextInput( safeName + "_db", "db_list", _fname)
			/*.append(
				$("<button>").text("...")
				.append( $("<input>").attr( {"type": "file" } ) )
			)*/
			.append($("<div>").addClass("file-status").attr("id", safeName).append("&nbsp;"));
}
function genDomExam(_exam){
	var $jar = $("<div>")
			.addClass("left-right")
			.appendRadioWithTextInput("", "exam_list", _exam.getTitle() || strings.exam.title);

	$jar[0].exam = _exam;
	return $jar;
}
function genDomSection(_s, _delete_button){
	var es_id = "section_" + Math.random();
	var $jar = $("<div>").addClass("exam_section left-right")
		.append(
			$("<div>")
				.appendTextInputWithLabel(es_id + "_title", "Title:", _s.getTitle() || strings.es.title)
		)
		.append(
			$("<div>")
				.appendLabelWithTextarea(es_id + "_descr", "Descr.:", _s.getDescr() || strings.es.descr, "tall")
		)
		.append(
			$("<div>")
				.appendLabelWithTextarea(es_id + "_list", "List:", _s.getList().join(", "), "")
		);
	if( _delete_button ){
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
		.append( $("<span>").addClass("question_info").text("Question#: " + (_idx + 1)) )
		.append( $("<textarea>").addClass("question-text").val( _q.getText() || strings.eq.text ) )
		.append( genDomAnswers(_q) );

	$jar.find("#" + b_id + "_type_" + _q.getType()).prop("checked", true);
	$jar[0].question = _q;
	return $jar;
}
function genDomAnswers(_q){
	var $jar = $("<fieldset>").addClass("answers");	// no <legend>
	var list = _q.getAnswers();
	for(var i = 0; i < list.length; ++i){
		$jar.append( genDomOneAnswerSet( i, list[i]) );
	}
	switch( _q.getType() ){
		case "mc":
			$jar.css( {"display": ""} );
			break;
		case "text":
		default:
			$jar.css( {"display": "none"} );
	}
	return $jar;
}
function genDomOneAnswerSet(_idx, _as){
	var $answer = $("<div>")
		.addClass("left-right")
		.append( $("<label>").text(String.fromCharCode(65 + _idx) + ")") )
		.append(
			$("<span>")
				.addClass("grouped left-right correct-answer")
				.appendTextInputWithLabel("", "Correct#:", _as.getCorrectAnswer())
		)
		.append( $("<span>").addClass("feedback left-right").append("Feedback...") )
		.append( $("<textarea>").addClass("feedback").val(_as.getFeedback() || strings.qa.text) )
		.append( $("<textarea>").addClass("answer-list").text( _as.getList().join("\n") ) );

	$answer[0].answerSet = _as;
	return $answer;
}

/**************************************************************
	generators of DOM - helper functions to reduce repetitivness
***************************************************************/
$.prototype.appendRadioWithLabel = function(_id, _name, _label){
	return this
		.append( $("<input>").attr( {"id": _id, "type": "radio", "name": _name} ) )
		.append( $("<label>").attr( {"for": _id} ).text(_label) );
}
$.prototype.appendRadioWithTextInput = function(_id, _name, _value){
	return this
		.append( $("<input>").attr( {"id": _id, "type": "radio", "name": _name} ) )
		.append( $("<input>").attr( {"type": "text", "value": _value} ) );
}

$.prototype.appendCheckboxWithLabel = function(_id, _label){
	return this
		.append( $("<input>").attr( {"id": _id, "type": "checkbox"} ) )
		.append( $("<label>").attr( {"for": _id} ).text(_label) );
}

$.prototype.appendTextInputWithLabel = function(_id, _label, _value){
	return this
		.append( $("<label>").attr( {"for": _id} ).text(_label) )
		.append( $("<input>").attr( {"id": _id, "type": "text"} ).val(_value) );
}
$.prototype.appendLabelWithTextarea = function(_id, _label, _value, _class){
	return this
		.append( $("<label>").attr( {"for": _id} ).text(_label) )
		.append( $("<textarea>").attr( {"id": _id} ).addClass(_class || "").text(_value) );
}
