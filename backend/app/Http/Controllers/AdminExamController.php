<?php
namespace App\Http\Controllers;

use App\Models\Exam;
use App\Models\ExamQuestion;
use Illuminate\Http\Request;

class AdminExamController extends Controller {
    public function listExams() { return response()->json(Exam::with('questions')->get()); }

    public function storeExam(Request $request) {
        $data = $request->validate([
            'day' => 'integer',
            'type' => 'required|in:test,archetype',
            'title' => 'required',
            'description' => 'nullable',
            'start_time' => 'required|date',
            'end_time' => 'required|date',
            'duration_minutes' => 'required|integer',
            'show_result' => 'boolean'
        ]);
        return response()->json(Exam::create($data));
    }

    public function updateExam(Request $request, $id) {
        $exam = Exam::findOrFail($id);
        $data = $request->validate([
            'day' => 'integer',
            'type' => 'required|in:test,archetype',
            'title' => 'required',
            'description' => 'nullable',
            'start_time' => 'required|date',
            'end_time' => 'required|date',
            'duration_minutes' => 'required|integer',
            'show_result' => 'boolean'
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
            'questions.*.id' => 'nullable|integer',
            'questions.*.type' => 'required|in:pg,essay',
            'questions.*.question_text' => 'required|string',
            'questions.*.options' => 'nullable|array',
            'questions.*.weights' => 'nullable|array',
            'questions.*.correct_answer' => 'nullable|string',
            'questions.*.points' => 'integer'
        ]);

        $sentIds = [];

        foreach ($questionsData['questions'] as $qData) {
            // Validation logic based on exam type
            if ($exam->type === 'test' && $qData['type'] === 'pg' && (empty($qData['options']) || empty($qData['correct_answer']))) {
                return response()->json(['message' => 'Soal PG untuk tipe Test wajib memiliki opsi dan kunci jawaban.'], 422);
            }
            if ($exam->type === 'archetype' && $qData['type'] === 'pg' && (empty($qData['options']) || empty($qData['weights']))) {
                return response()->json(['message' => 'Soal untuk tipe Archetype wajib memiliki opsi dan bobot (weights).'], 422);
            }

            if ($qData['type'] === 'essay') {
                $qData['options'] = null;
                $qData['correct_answer'] = null;
                $qData['weights'] = null;
            }

            if (isset($qData['id'])) {
                $question = ExamQuestion::where('exam_id', $examId)->find($qData['id']);
                if ($question) {
                    $question->update($qData);
                    $sentIds[] = $question->id;
                }
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
