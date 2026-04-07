<?php
namespace App\Http\Controllers;

use App\Models\Exam;
use App\Models\ExamSubmission;
use App\Models\ExamAnswer;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use App\Models\AppSetting;
use App\Services\SpreadsheetService;

class ExamController extends Controller {
    public function availableExams(Request $request) {
        $now = Carbon::now();
        $userId = $request->user()->id;
        
        $currentDay = AppSetting::get('current_day', 1);
        
        $exams = Exam::with('questions')
            ->where('day', $currentDay)
            ->where('start_time', '<=', $now->addMinutes(1)) // 1-minute buffer for clock sync
            ->where('end_time', '>=', $now->subMinutes(1))
            ->get();
            
        $mappedExams = $exams->map(function($exam) use ($userId) {
            $submission = ExamSubmission::where('exam_id', $exam->id)
                ->where('user_id', $userId)
                ->first();
            $exam->has_submitted = $submission ? true : false;
            return $exam;
        });

        return response()->json($mappedExams);
    }

    public function submit(Request $request, $examId) {
        $userId = $request->user()->id;
        $now = Carbon::now();
        
        // 1. ATOMIC TRANSACTION: Ensure data integrity even if admin edits questions during submit
        return DB::transaction(function() use ($request, $examId, $userId, $now) {
            $exam = Exam::with('questions')->lockForUpdate()->findOrFail($examId);

            // Double catch: Prevent duplicate submissions
            $existing = ExamSubmission::where('exam_id', $examId)
                ->where('user_id', $userId)
                ->first();
            if ($existing) {
                return response()->json(['message' => 'Anda telah menyelesaikan tes ini sebelumnya.'], 403);
            }

            if ($now->gt($exam->end_time)) {
                return response()->json(['message' => 'Waktu ujian telah berakhir'], 403);
            }

            $data = $request->validate(['answers' => 'required|array']);
            $currentDay = AppSetting::get('current_day', 1);

            // 2. USE updateOrCreate to prevent race condition duplicates
            $submission = ExamSubmission::updateOrCreate(
                ['user_id' => $userId, 'exam_id' => $examId],
                ['day' => $currentDay, 'submitted_at' => $now, 'score' => 0]
            );

            // Clear old answers just in case of retries
            ExamAnswer::where('submission_id', $submission->id)->delete();

            $score = 0;
            foreach ($exam->questions as $q) {
                $userAns = $data['answers'][$q->id] ?? '';
                $isCorrect = false;

                // Dynamic Scoring Logic
                if ($exam->type !== 'archetype' && $q->type === 'pg') {
                    $isCorrect = (strtolower(trim($userAns)) === strtolower(trim($q->correct_answer ?? '')));
                    if ($isCorrect) $score += $q->points;
                }
                
                if ($exam->type === 'archetype') {
                    $weights = $q->weights ?? [];
                    $score += (int)($weights[$userAns] ?? 0);
                }

                // 3. DEFENSIVE CHECK: Ensure question still exists before creating answer record
                if (DB::table('exam_questions')->where('id', $q->id)->exists()) {
                    ExamAnswer::create([
                        'submission_id' => $submission->id,
                        'question_id' => $q->id,
                        'user_answer' => $userAns,
                        'is_correct' => $isCorrect
                    ]);
                }
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

            // Sync to Spreadsheet
            try {
                $user = $request->user();
                SpreadsheetService::postScore([
                    'name'     => $user->name,
                    'instansi' => $user->asal_instansi,
                    'type'     => 'TEST',
                    'item'     => $exam->title,
                    'score'    => $score,
                    'desc'     => $archetype ?? "Score: $score"
                ]);
            } catch (\Exception $e) {
                \Log::warning("Spreadsheet sync failed: " . $e->getMessage());
            }

            return response()->json([
                'message' => 'Ujian berhasil dikirim',
                'score' => $score,
                'archetype' => $archetype
            ]);
        });
    }
}
