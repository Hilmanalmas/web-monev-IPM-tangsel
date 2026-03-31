<?php
namespace App\Http\Controllers;

use App\Models\Exam;
use App\Models\ExamQuestion;
use Illuminate\Http\Request;

class AdminExamController extends Controller {
    public function listExams() { return response()->json(Exam::with('questions')->get()); }

    public function storeExam(Request $request) {
        $data = $request->validate([
            'title' => 'required',
            'description' => 'nullable',
            'start_time' => 'required|date',
            'end_time' => 'required|date',
            'duration_minutes' => 'required|integer'
        ]);
        return response()->json(Exam::create($data));
    }

    public function updateExam(Request $request, $id) {
        $exam = Exam::findOrFail($id);
        $data = $request->validate([
            'title' => 'required',
            'description' => 'nullable',
            'start_time' => 'required|date',
            'end_time' => 'required|date',
            'duration_minutes' => 'required|integer'
        ]);
        $exam->update($data);
        return response()->json($exam);
    }

    public function destroyExam($id) {
        Exam::findOrFail($id)->delete();
        return response()->json(['message' => 'Exam deleted']);
    }

    public function storeExamQuestion(Request $request, $examId) {
        $data = $request->validate([
            'question_text' => 'required',
            'type' => 'required|in:pg,essay',
            'options' => 'nullable|array',
            'correct_answer' => 'nullable|string',
            'points' => 'integer'
        ]);
        $data['exam_id'] = $examId;
        return response()->json(ExamQuestion::create($data));
    }

    public function batchUpdateExamQuestions(Request $request, $examId) {
        $exam = Exam::findOrFail($examId);
        $questionsData = $request->validate([
            'questions' => 'required|array',
            'questions.*.id' => 'nullable|integer|exists:exam_questions,id',
            'questions.*.type' => 'required|in:pg,essay',
            'questions.*.question_text' => 'required|string',
            'questions.*.options' => 'nullable|array',
            'questions.*.correct_answer' => 'nullable|string',
            'questions.*.points' => 'integer'
        ]);

        $sentIds = [];

        foreach ($questionsData['questions'] as $qData) {
            if ($qData['type'] === 'pg' && (empty($qData['options']) || empty($qData['correct_answer']))) {
                return response()->json(['message' => 'Soal PG wajib memiliki opsi dan kunci jawaban.'], 422);
            }
            if ($qData['type'] === 'essay') {
                $qData['options'] = null;
                $qData['correct_answer'] = null;
            }

            if (isset($qData['id'])) {
                $question = ExamQuestion::where('exam_id', $examId)->findOrFail($qData['id']);
                $question->update($qData);
                $sentIds[] = $question->id;
            } else {
                $qData['exam_id'] = $examId;
                $newQuestion = ExamQuestion::create($qData);
                $sentIds[] = $newQuestion->id;
            }
        }

        ExamQuestion::where('exam_id', $examId)->whereNotIn('id', $sentIds)->delete();

        return response()->json(['message' => 'Questions updated successfully', 'exam' => $exam->load('questions')]);
    }
}
