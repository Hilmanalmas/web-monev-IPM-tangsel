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
            Exam::with('questions')
                ->where('start_time', '<=', $now)
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

        $currentDay = \App\Models\AppSetting::get('current_day', 1);

        $submission = ExamSubmission::create([
            'user_id' => $request->user()->id,
            'exam_id' => $examId,
            'day' => $currentDay,
            'submitted_at' => $now
        ]);

        $score = 0;
        foreach ($exam->questions as $q) {
            $userAns = $data['answers'][$q->id] ?? '';
            
            $isCorrect = false;
            // Standard Test Logic
            if ($exam->type !== 'archetype' && $q->type === 'pg') {
                $isCorrect = (strtolower(trim($userAns)) === strtolower(trim($q->correct_answer ?? '')));
                if ($isCorrect) $score += $q->points;
            }
            
            // Archetype Scaling Logic
            if ($exam->type === 'archetype') {
                $weights = $q->weights ?? [];
                $score += (int)($weights[$userAns] ?? 0);
            }

            ExamAnswer::create([
                'submission_id' => $submission->id,
                'question_id' => $q->id,
                'user_answer' => $userAns,
                'is_correct' => $isCorrect
            ]);
        }

        $archetype = null;
        if ($exam->type === 'archetype') {
            if ($score >= 31) $archetype = 'The Visionary';
            else if ($score >= 21) $archetype = 'The Executor';
            else $archetype = 'The Observer';
        }

        $submission->update([
            'score' => $score,
            'archetype' => $archetype
        ]);

        return response()->json([
            'message' => 'Ujian berhasil dikumpulkan',
            'score' => $exam->show_result ? $score : null,
            'archetype' => $exam->show_result ? $archetype : null,
            'show_result' => $exam->show_result
        ]);
    }
}
