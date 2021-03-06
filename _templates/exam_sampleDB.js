﻿/*
	Sample DB to express the structure of the exam and questions and to
	provide sample data for testing purposes
*/

var gQ = [];
var gExam1 = {
	questions: gQ,
	descr: "This is a mock exam, which means it contains real questions from past years' exams",
	mock: true,
	list: [1, 0, 2, 3, 4, 1]
};
var gExam2 = {
	questions: gQ,
	descr: "This is a exercise exam with some questions",
	mock: false, // exercise exam
	list: [0, 1, 0, 1, 23]
};
var gExam3 = {
	questions: gQ,
	descr: "This is a exercise exam, which means it contains real questions from past years' exams",
	mock: false, // exercise exam
	list: [0, 5, 6]
};
var gExam4 = {
	questions: gQ,
	descr: "This is a mock exam",
	mock: true,
	list: [1, 4, 5, 2]
};
var gExam5 = {
	questions: gQ,
	descr: "This is a mock exam to develop feedback system",
	mock: true,
	list: [1, 3, 5, 2]
};
var gExam6 = {
	questions: gQ,
	descr: "This is an exercise exam to develop feedback system",
	mock: false,
	list: [1, 3, 5, 2]
};

gQ[0] = {
	txt: "Question text goes in here. This is for multiple-choice responses",
	a: [
		"Answer 1",
		"Answer 2",
		"Answer 3",
		"Answer 4"
	],
	correct: 2,
	fb: "If there is additional feedback (like an incorrect answer) it will be shown in here"
};
gQ[1] = {
	txt: "Question #2 text goes in here. This is for multiple-choice responses",
	a: [
		"away",
		"Answer 2",
		"Answer 3",
		"Answer 4"
	],
	correct: 1,
	fb: "Another feedback text <a href='#'>link</a>"
};
gQ[2] = {
	txt: "Question #3 (short list of answers)",
	a: [
		"Answer 1", //#0
		"Answer 2" //#1
	],
	correct: 2,	// incorrect index
	fb: "No real feedback"
};
gQ[3] = {
	txt: "Question #4 (too many answers)",
	a: [
		"Answer 1",
		"Answer 2",
		"Answer 3",
		"Answer 4",
		"Answer 5"
	],
	correct: 1,
	fb: "No real feedback"
};
gQ[4] = {
	txt: "Question #5 (no answers)",
	a: [],
	correct: 1,
	fb: "No real feedback"
};
gQ[5] = {
	txt: "Question text goes in here. This is for a \"choose from a list\" type questions. Here's an example of a list to choose an answer from:{вариант1} Once selected the page will check the answer and provide a feedback to use. There could be more than one select. For example you can have {select2} select(s) in addition to the first one. Кстати, а вот и русский текст",
	dropDowns: {
		"вариант1": {
			list: [
				"Answer 1",
				"Answer 2",
				"Answer 3",
				"Answer 4",
				"Answer 5"
			],
			correct: 2
		},
		"select2": {
			list: [
				"Answer 1",
				"Answer 2",
				"Answer 5"
			],
			correct: 0
		}
	},
	fb: "Full text of the correct answer"
};
gQ[6] = {
	txt: "Question text goes in here. This is for a \"choose from a list\" type questions. Here's an example of a list to choose an answer from:{0}Once selected the page will check the answer and provide a feedback to use.",
	dropDowns: {
		"0":{
			list: [
				"Answer 1",
				"Answer 2",
				"Answer 3",
				"Answer 4"
			],
			correct: 2
		}
	},
	fb: "Full text of the correct answer (other)"
};
