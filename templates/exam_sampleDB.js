/*
	Sample DB to express the structure of the exam and questions and to
	provide sample data for testing purposes
*/

var gExam1 = {
	descr: "This is a mock exam, which means it contains real questions from past years' exams",
	mock: true,
	list: [1, 0, 2, 3, 4, 1]
};
var gExam2 = {
	descr: "This is a mock exam, which means it contains real questions from past years' exams",
	mock: false, // exercise exam
	list: [0, 1, 0, 1]
};
var gQ = [];
gQ[0] = {
	txt: "Question text goes in here. This is for multiple-choice responses",
	list: false,
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
	list: false,
	a: [
		"Answer 1",
		"Answer 2",
		"Answer 3",
		"Answer 4"
	],
	correct: 1,
	fb: "Another feedback text <a href='#'>link</a>"
};
gQ[2] = {
	txt: "Question #3 (short list of answers)",
	list: false,
	a: [
		"Answer 1", //#0
		"Answer 2", //#1
	],
	correct: 2,	// incorrect index
	fb: "No real feedback"
};
gQ[3] = {
	txt: "Question #4 (too many answers)",
	list: false,
	a: [
		"Answer 1",
		"Answer 2",
		"Answer 3",
		"Answer 4",
		"Answer 5",
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

