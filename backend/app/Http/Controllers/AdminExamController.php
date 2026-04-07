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

    public function duplicateExam($id) {
        $exam = Exam::with('questions')->findOrFail($id);
        
        // Duplicate the exam
        $newExam = $exam->replicate();
        $newExam->title = $exam->title . " (Copy)";
        $newExam->save();

        // Duplicate the questions
        foreach ($exam->questions as $question) {
            $newQuestion = $question->replicate();
            $newQuestion->exam_id = $newExam->id;
            $newQuestion->save();
        }

        return response()->json($newExam->load('questions'));
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

    public function resetSubmission(Request $request) {
        $data = $request->validate([
            'user_id' => 'required|exists:users,id',
            'exam_id' => 'required|exists:exams,id',
        ]);

        $submission = \App\Models\ExamSubmission::where('user_id', $data['user_id'])
            ->where('exam_id', $data['exam_id'])
            ->first();

        if (!$submission) {
            return response()->json(['error' => 'Data ujian tidak ditemukan'], 404);
        }

        // Delete answers and the submission
        \App\Models\ExamAnswer::where('submission_id', $submission->id)->delete();
        $submission->delete();

        // Also delete from cognitive_scores if exists
        \Illuminate\Support\Facades\DB::table('cognitive_scores')
            ->where('user_id', $data['user_id'])
            ->where('exam_submission_id', $submission->id)
            ->delete();

        return response()->json(['message' => 'Pengerjaan ujian berhasil direset!']);
    }
}
