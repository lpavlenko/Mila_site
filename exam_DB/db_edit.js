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

function locateQuestionUpTheChain(_curr){
	if( ! _curr || _curr === document )
		return document;
	if( _curr.question !== undefined )
		return _curr;
	return locateQuestionUpTheChain(_curr.parentNode);
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
	Locate currently selected objects on our page
***************************************************************/
// get the DB that is currently selected with a radio button (via it's ID in a form of "<fname>_db")
function getCurrDB(){
	TRACE("getCurrDB");
	return DBs[ $("#db_list input[type=radio]:checked").attr("id").match(/(.*?)_db/)[1] ];
}
// get currently selected Exam (via radio button's ID in a form of "exam_title_<idx>")
// and it's index in DB's list
function getCurrExam(){
	TRACE("getCurrExam");
	var idx = $("#exams_list input[type=radio]:checked").attr("id").match(/exam_title_(.*?)$/)[1];
	return {exam: getCurrDB().getExams()[idx], idx: idx};
}
// get currentl yselected Exam Section via "selected" CSS class and DOM's property "idx"
function getCurrSection(){
	TRACE("getCurrSection");
	var i = $("#exam_sections .selected")[0].idx;
	return {section: getCurrExam().exam.getSections()[i], idx: i};
}

/**************************************************************
	Expand input fields as needed to accommodate new entries
***************************************************************/
// add new (created) DB to list if no more empty slots are available in the list
function addDBIfNeeded(){
	TRACE(this);
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
	TRACE(this);
	var $list = $("#exams_list input[type=text]");
	if( getCurrDB().getExams()[ $list.length - 1 ].title.length < 1 )
		return;

	// if we are here that means there are no empty slots left - need to create a new one
	$("#exams_list").append( genDomExam( getCurrDB().addExam(), $list.length ) );
}
function addSectionIfNeeded(){
	TRACE(this);
	var exam = getCurrExam().exam;
	var idx = getCurrSection().idx;
	if(idx < exam.getSections().length - 1){
		return;
	}
	var es = exam.addSection();
	var $es = genDomSection(es, idx + 1);
	$("#exam_sections").append($es);
}
function addQuestionIfNeeded(_jar){
	TRACE(this);
	var db = getCurrDB();
	if( _jar === $("#questions>div.question:last")[0] ){
		var $q = genDomQuestion(db.addQuestion(), $("#questions>div.question").length );
		$("#questions").append($q);
	}
}
function addAnswerIfNeeded(_jar){
	TRACE(this);
	var $list = $(_jar).find(".answers div textarea");
	if( $list.length < 1 || $list.last().val().length > 0 ){
		var q = _jar.question;
		$(_jar).find(".answers").append( genDomOneAnswer(q.getAnswers().length, $list.length, q.addAnswer()) );
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
	TRACE("updateCurrExamTitle");
	getCurrExam().exam.setTitle(_new_title);
	$("#exams_list input[type=radio]:checked").siblings("input[type=text]").val(_new_title);
	$("#exam_title").val(_new_title);
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
		.delegate(".left-right", "focusin", function(){
			$(this).find("input[type=radio]").prop("checked", true);
			renderDB( getCurrDB() );
			$("#exams_list input[type=radio]:first").click();
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
			renderExam( getCurrExam().exam );
		})
		.delegate("input[type=text]", "change", function(){
			updateCurrExamTitle(this.value);
			addExamIfNeeded();
		});

	$("#exam_misc") .change(function(){getCurrExam().exam.setMisc (this.value);});
	$("#exam_descr").change(function(){getCurrExam().exam.setDescr(this.value);});
	$("#exam_title").change(function(){updateCurrExamTitle(this.value);});
	$("#exam_type_mock, #exam_type_exe").click(function(){
		switch(this.id){
			case "exam_type_mock":
				getCurrExam().exam.setMock(true);
				break;
			case "exam_type_exe":
				getCurrExam().exam.setMock(false);
				break;
		}
	});

	$("#exam_sections")
		.delegate("input, textarea", "change", function(){
			var es = getCurrSection();
			if(this.id.match(/title/)){
				es.section.setTitle(this.value);
			}else if(this.id.match(/descr/)){
				es.section.setDescr(this.value);
			}else if(this.id.match(/list/)){
				// TODO: implement ticking of selected questions in the general pool
			}
			addSectionIfNeeded();
		})
		.delegate(".exam_section", "focusin", function(){
			$("#exam_sections .exam_section").removeClass("selected");
			$(this).addClass("selected");
		});

	$("#questions")
		.delegate("input[type=radio]", "change", function(){
			var $q = $(this).parent(/*span*/).parent(/*div.question*/);
			var mc = this.id.match(/_mc/);
			$q[0].question.setMC( !! mc );
			if(mc){
				$q.find("fieldset.answers").css( {"display": ""} );
				addAnswerIfNeeded($q[0]);
			}else{
				$q.find("fieldset.answers").css( {"display": "none"} );
			}
		})
		.delegate("input, textarea", "change", function(){
			addQuestionIfNeeded( locateQuestionUpTheChain(this) );
		})
		.delegate(".answers textarea", "keyup", function(){
			// q0_a0_set
			//var $q = $(this).parent(/*div*/).parent(/*fieldset.answers*/).parent(/*div.question*/);
			var qJar = locateQuestionUpTheChain(this);
			var info = this.id.match(/q(.*?)_a(.*?)_set/);
			var q_idx = info[1];
			var a_idx = info[2];
			if( getCurrDB().getQuestions()[0] !== qJar.question ){
				console.log("Corruption in DB. Question at index [" + q_idx + "] doesn't match the one DOM!");
			}
			qJar.question.getAnswers()[a_idx].setList(this.value, "\n");
			addAnswerIfNeeded(qJar);
		});
});

function markQuestions(_db, _es){
	TRACE(this);
	// TODO: implement
}

/**************************************************************
	render various blocks onto the page
***************************************************************/
function renderDB(_db){
	TRACE(this);
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
	
	markQuestions(_db, getCurrSection().section);
}
function renderExam(_exam){
	TRACE(this);
	$("#exam_type_mock, #exam_type_exe").prop("checked", false);
	$("#exam_type_" + _exam.getType()).prop("checked", true);
	$("#exam_title").val( _exam.getTitle() || strings.exam.title );
	$("#exam_misc") .val( _exam.getMisc()  || strings.exam.misc  );
	$("#exam_descr").val( _exam.getDescr() || strings.exam.descr );
	
	renderSections(_exam);
}
function renderSections(_exam){
	TRACE(this);
	$("#exam_sections>div").remove();
	for(var i = 0; i < _exam.getSections().length; ++i){
		var $es = genDomSection( _exam.getSections()[i], i );
		if(i === 0)
			$es.addClass("selected");
		$("#exam_sections").append($es);
	}
}

/**************************************************************
	generators of DOM structures that represent data
***************************************************************/
function genDomDB(_fname){
	TRACE(this);
	return $("<div>")
			.addClass("left-right")
			.appendRadioWithTextInput(_fname + "_db", "db_list", _fname)
			.append( $("<button>").text("...").append( $("<input>").attr( {"type": "file" } ) ) );
}
function genDomExam(_exam, _idx){
	TRACE(this);
	return $("<div>")
			.addClass("left-right")
			.appendRadioWithTextInput("exam_title_" + _idx, "exam_list", _exam.getTitle() || strings.exam.title);
}
function genDomSection(_s, _idx){
	TRACE(this);
	var es_id = "section_" + _idx;
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
	if(_idx > 0){
		$jar.append( $("<button>").text("Delete this exam section").addClass("alert") );
	}
	$jar[0].idx = _idx;
	return $jar;
}
function genDomQuestion(_q, _idx){
	TRACE(this);
	function randomize(){
		var mc = Math.random() > 0.5;
		_q.setMC(mc);
	}
	randomize();
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
			$("<textarea>").attr( {"id": b_id + "_full_text"} )
		)
		.append( genDomAnswers(_q, _idx) );

	$jar[0].question = _q;
	$jar.find("#" + b_id + "_type_" + _q.getType()).prop("checked", true);

	return $jar;
}
function genDomAnswers(_q, _idx){
	var $jar = $("<fieldset>").addClass("answers")
		.append(
			$("<legend>").text("Lists of answers, one per line")
		);
	var list = _q.getAnswers();
	for(var i = 0; i < list.length; ++i){
		$jar.append( genDomOneAnswer(_idx, i, list[i]) );
	}
	if( _q.getType() === "text" )
		$jar.css( {"display": "none"} );
	return $jar;
}
function genDomOneAnswer(_q_idx, _a_idx, _list){
	return $answer = $("<div>")
		.addClass("left-right")
		.appendLabelWithTextarea(
			"q" + _q_idx + "_a" + _a_idx + "_set",
			String.fromCharCode(65 + _a_idx) + ")",
			_list.getList().join("\n")
		);
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
$.prototype.appendLabelWithTextarea = function(_id, _label, _value, _class){
	this
		.append( $("<label>").attr( {"for": _id} ).text(_label) )
		.append( $("<textarea>").attr( {"id": _id} ).addClass(_class || "").text(_value) );
	return this;
}
