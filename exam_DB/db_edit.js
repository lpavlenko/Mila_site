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

// add new (created) DB to list if no more empty slots are available in the list
function addDBIfNeeded(){
	TRACE("addDBIfNeeded");
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
	TRACE("addExamIfNeeded");
	var exams = getCurrDB().getExams();
	var $list = $("#exams_list input[type=text]");
	for(var i = 0; i < $list.length; ++i){
//		if( $list.get(i).value.length < 1 )
		if(exams[i].title.length < 1)
			return;
	}
	// if we are here then that means there are no empty slots left - need to create a new one
	$("#exams_list").append( genDomExam( getCurrDB().addExam(), i ) );
}
function addSectionIfNeeded(){
	TRACE("addSectionIfNeeded");
	var exam = getCurrExam().exam;
	var idx = getCurrSection().idx;
	if(idx < exam.getSections().length - 1){
		return;
	}
	var es = exam.addSection();
	var $es = genDomSection(es, idx + 1);
	$("#exam_sections").append($es);
}

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

	$("body").delegate("input, select, textarea, button", "blur", saveExam);

	$("#db_list").delegate(".left-right", "focusin", function(){
		$(this).find("input[type=radio]").prop("checked", true);
		renderDB( getCurrDB() );
		$("#exams_list input[type=radio]:first").click();
	});
	$("#db_list").delegate("button", "click", function(){
		//$(this).find("input[type=file]")[0].click();
		this.querySelector("input[type=file]").click();
	});
	$("#db_list").delegate("input[type=file]", "change", function(){
		var new_fname = extractFname(this.value);
		updateCurrDBFname( extractFname(new_fname.trim()) );
	});
	$("#db_list").delegate("input[type=text]", "change", function(){
		this.value = this.value.trim();
		updateCurrDBFname(this.value);
	});

	$("#exams_list").delegate(".left-right", "focusin", function(){
		$(this).find("input[type=radio]").prop("checked", true);
		renderExam( getCurrExam().exam );
	});
	$("#exams_list").delegate("input[type=text]", "change", function(){
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

	$("#exam_sections").delegate("input, textarea", "change", function(){
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

});

function markQuestions(_db, _es){
	TRACE(this);
}

/********************************************************
	render various blocks onto the page
*********************************************************/
function renderDB(_db){
	TRACE(this);
	var exams = _db.getExams();
	$("#exams_list>div").remove();
	for(var i = 0; i < exams.length; ++i){
		$("#exams_list").append( genDomExam( exams[i], i ) );
	}
	$("#exams_list input[type=radio]:first").click();

	// TODO: render questions as well
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
	$("#exam_misc") .val( _exam.getMisc()  || strings.exam.misc );
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

/********************************************************
	generators of DOM structures that represent data
*********************************************************/
function genDomDB(_fname){
	TRACE(this);
	return $("<div>")
			.addClass("left-right")
			.append(
				$("<input>")
					.attr({
						"id": _fname + "_db",
						"type": "radio",
						"name": "db_list"
					})
			)
			.append(
				$("<input>")
					.attr({
						"type": "text",
						"value": _fname
					})
			)
			.append(
				$("<button>")
					.text("...")
				.append(
					$("<input>")
						.attr({
							"type": "file"
						})
				)
			);
}
function genDomExam(_exam, _idx){
	TRACE(this);
	return $("<div>")
			.addClass("left-right")
			.append(
				$("<input>")
					.attr({
						"id": "exam_title_" + _idx,
						"type": "radio",
						"name": "exam_list"
					})
			)
			.append(
				$("<input>")
					.attr({
						"type": "text",
						"value": _exam.getTitle() || strings.exam.title
					})
			);
}
function genDomSection(_s, _idx){
	TRACE(this);
	var es_id = "section_" + _idx;
	var t_id = es_id + "_title";
	var d_id = es_id + "_descr";
	var l_id = es_id + "_list";
	var $jar = $("<div>").addClass("exam_section left-right")
		.append(
			$("<div>")
				.append(
					$("<label>")
						.attr("for", t_id)
						.text("Title:")
					.append(
						$("<input>")
							.attr({
								"id": t_id,
								"type": "text"
							})
							.val( _s.getTitle() || strings.es.title )
					)
				)
		)
		.append(
			$("<div>")
				.append(
					$("<label>")
						.attr("for", d_id)
						.text("Descr.:")
					.append(
						$("<textarea>")
							.attr("id", d_id)
							.addClass("tall")
							.text( _s.getDescr() || strings.es.descr )
					)
				)
		)
		.append(
			$("<div>")
				.append(
					$("<label>")
						.attr("for", l_id)
						.text("List:")
					.append(
						$("<textarea>")
							.attr("id", l_id)
							.text( _s.getList().join(", ") )
					)
				)
		);
	if(_idx > 0){
		$jar.append(
			$("<button>")
				.text("Delete this exam section")
				.addClass("alert")
		);
	}
	$jar[0].idx = _idx;
	return $jar;
}
function genDomQuestion(_q, _idx){
	TRACE(this);
}

