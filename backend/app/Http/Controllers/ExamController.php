<?php
namespace App\Http\Controllers;
use App\Models\Exam;
use App\Models\ExamSubmission;
use App\Models\ExamAnswer;
use Illuminate\Http\Request;
use Carbon\Carbon;

class ExamController extends Controller {
    public function availableExams() {
        $now = Carbon::now();
        return response()->json(
            Exam::where('start_time', '<=', $now)
                ->where('end_time', '>=', $now)
                ->get()
        );
    }

    public function submit(Request $request, $examId) {
        $exam = Exam::with('questions')->findOrFail($examId);
        $now = Carbon::now();

        if ($now->gt($exam->end_time)) {
            return response()->json(['message' => 'Waktu ujian telah berakhir'], 403);
        }

        $data = $request->validate(['answers' => 'required|array']);

        $submission = ExamSubmission::create([
            'user_id' => $request->user()->id,
            'exam_id' => $examId,
            'submitted_at' => $now
        ]);

        $score = 0;
        foreach ($exam->questions as $q) {
            $userAns = $data['answers'][$q->id] ?? '';
            $isCorrect = (strtolower(trim($userAns)) === strtolower(trim($q->correct_answer)));
            if ($isCorrect) $score += $q->points;

            ExamAnswer::create([
                'submission_id' => $submission->id,
                'question_id' => $q->id,
                'user_answer' => $userAns,
                'is_correct' => $isCorrect
            ]);
        }

        $submission->update(['score' => $score]);
        return response()->json(['message' => 'Ujian berhasil dikumpulkan', 'score' => $score]);
    }
}
