<?php
namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Attendance;
use App\Models\CognitiveScore;
use App\Models\GameScore;
use App\Models\PracticeScore;
use App\Models\WorshipSlot;
use App\Models\WorshipLog;
use App\Models\ExamSubmission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use App\Models\AppSetting;
use App\Models\RtlResponse;

class ObserverController extends Controller {
    /**
     * Read a selfie from disk and return as base64 data URI.
     */
    private function selfieToBase64(?string $rawPath): ?string {
        if (!$rawPath) return null;
        if (str_starts_with($rawPath, 'data:')) return $rawPath;

        // Normalize: strip 'storage/' or 'public/' prefix
        if (str_starts_with($rawPath, 'storage/')) {
            $rawPath = substr($rawPath, strlen('storage/'));
        } elseif (str_starts_with($rawPath, 'public/')) {
            $rawPath = substr($rawPath, strlen('public/'));
        }

        try {
            if (!Storage::disk('public')->exists($rawPath)) return null;
            
            $data = Storage::disk('public')->get($rawPath);
            $mime = Storage::disk('public')->mimeType($rawPath) ?: 'image/jpeg';
            
            return 'data:' . $mime . ';base64,' . base64_encode($data);
        } catch (\Exception $e) {
            return null;
        }
    }

    public function getPesertaList() {
        $peserta = User::where('role', 'peserta')->get()->map(function($p) {
            $firstAttendance = Attendance::where('user_id', $p->id)->orderBy('recorded_at', 'asc')->first();
            $selfie = null;

            if ($firstAttendance) {
                $selfie = $this->selfieToBase64($firstAttendance->selfie_url);
            }

            // If no attendance selfie, check RTL selfie (which is base64)
            if (!$selfie) {
                $rtl = RtlResponse::where('user_id', $p->id)->whereNotNull('selfie_url')->first();
                if ($rtl) $selfie = $rtl->selfie_url;
            }

            return [
                'id' => $p->id,
                'name' => $p->name,
                'nip' => $p->nip,
                'instansi' => $p->asal_instansi,
                'first_selfie' => $selfie
            ];
        });
        return response()->json(['peserta' => $peserta]);
    }

    public function getPesertaAttendance(Request $request, $id) {
        $day = $request->query('day');
        $query = Attendance::where('user_id', $id);
        
        if ($day) {
            $query->where('day', $day);
        }

        $attendances = $query->with('slot')->orderBy('recorded_at', 'asc')->get()->map(function($att) {
            // Convert to plain array first — avoids Eloquent re-casting selfie_url on serialization
            $item = $att->toArray();
            $item['selfie_url'] = $this->selfieToBase64($att->selfie_url); // use original model value for rawPath
            $item['type'] = 'Absensi';
            return $item;
        });

        $rtlQuery = RtlResponse::where('user_id', $id)->whereNotNull('selfie_url');
        if ($day) {
            // Mapping for RTL Day? For now just show all if day is not matched or add day to RTL too
            // Assuming RTL also has day if we added it in migration
            $rtlQuery->where('day', $day);
        }
        
        $rtlResponses = $rtlQuery->get();
        foreach ($rtlResponses as $rtlRes) {
            $attendances->push([
                'id' => 'rtl-' . $rtlRes->id,
                'selfie_url' => $rtlRes->selfie_url, // Already base64
                'type' => 'RTL',
                'recorded_at' => $rtlRes->created_at,
                'slot' => ['name' => 'Penilaian RTL']
            ]);
        }

        return response()->json(['attendances' => $attendances]);
    }

    public function getPesertaExams(Request $request, $id) {
        $day = $request->query('day');
        
        $submissions = \Illuminate\Support\Facades\DB::table('exam_submissions')
            ->join('exams', 'exam_submissions.exam_id', '=', 'exams.id')
            ->where('exam_submissions.user_id', $id)
            ->where('exam_submissions.day', $day)
            ->select('exam_submissions.*', 'exams.title as exam_title')
            ->get();
        
        $allScores = \Illuminate\Support\Facades\DB::table('cognitive_scores')
            ->where('user_id', $id)
            ->where('day', $day)
            ->get();

        $submissionScores = $allScores->whereNotNull('exam_submission_id')->keyBy('exam_submission_id');
        $manualScores = $allScores->whereNull('exam_submission_id');
        
        $mapped = $submissions->map(function($sub) use ($submissionScores) {
            // Get answers manually for this submission
            $answers = \Illuminate\Support\Facades\DB::table('exam_answers')
                ->leftJoin('exam_questions', 'exam_answers.question_id', '=', 'exam_questions.id')
                ->where('exam_answers.submission_id', $sub->id)
                ->select('exam_answers.*', 'exam_questions.question_text', 'exam_questions.correct_answer')
                ->get();

            // DEBUG: Count raw answers without join to see if ID mismatch
            $rawAnswerCount = \Illuminate\Support\Facades\DB::table('exam_answers')
                ->where('submission_id', $sub->id)
                ->count();

            return [
                'submission_id' => $sub->id,
                'exam_title' => $sub->exam_title,
                'submitted_at' => $sub->submitted_at,
                'participant_score' => $sub->score,
                'answers' => $answers,
                'debug_info' => [
                    'raw_answer_count' => $rawAnswerCount,
                    'is_zero_answers' => $answers->count() === 0
                ],
                'archetype' => $sub->archetype,
                'observer_score' => isset($submissionScores[$sub->id]) ? $submissionScores[$sub->id]->score : null
            ];
        });

        // Append manual scores
        foreach ($manualScores as $ms) {
            $mapped->push([
                'submission_id' => null,
                'exam_title' => $ms->notes ?: 'Hasil Tes Kognitif Manual',
                'submitted_at' => $ms->created_at,
                'participant_score' => null,
                'answers' => [],
                'archetype' => null,
                'observer_score' => $ms->score
            ]);
        }

        return response()->json(['exams' => $mapped]);
    }

    public function storeCognitiveScore(Request $request) {
        $data = $request->validate([
            'user_id' => 'required',
            'exam_submission_id' => 'nullable',
            'score' => 'required|integer|min:0|max:100',
            'notes' => 'nullable|string'
        ]);

        $currentDay = AppSetting::get('current_day', 1);

        // For manual input (null submission_id), we use updateOrCreate with user_id + maybe notes? 
        // Or just allow multiple manual scores per day.
        $score = CognitiveScore::create([
            'user_id' => $data['user_id'],
            'exam_submission_id' => $data['exam_submission_id'],
            'observer_id' => Auth::id(),
            'score' => $data['score'],
            'notes' => $data['notes'],
            'day' => $currentDay
        ]);

        return response()->json($score);
    }

    public function getGamesPractice(Request $request, $id) {
        $day = $request->query('day');
        
        $gamesQuery = GameScore::where('user_id', $id)->with('slot');
        $practiceQuery = PracticeScore::where('user_id', $id)->with('slot');
        $ibadahQuery = WorshipLog::where('user_id', $id)->with('slot');

        if ($day) {
            $gamesQuery->where('day', $day);
            $practiceQuery->where('day', $day);
            $ibadahQuery->where('day', $day);
        }

        return response()->json([
            'games' => $gamesQuery->get(), 
            'practice' => $practiceQuery->get(), 
            'ibadah' => $ibadahQuery->get()
        ]);
    }

    public function getAvailableSlots(Request $request) {
        $day = $request->query('day', AppSetting::get('current_day', 1));
        return response()->json([
            'games' => \App\Models\GameSlot::where('day', $day)->get(),
            'practice' => \App\Models\PracticeSlot::where('day', $day)->get(),
            'ibadah' => \App\Models\WorshipSlot::where('day', $day)->get()
        ]);
    }

    public function storeGameScore(Request $request) {
        $data = $request->validate([
            'user_id' => 'required',
            'score' => 'required|integer|min:0|max:100',
            'notes' => 'nullable|string',
            'slot_id' => 'required'
        ]);

        $slot = \App\Models\GameSlot::findOrFail($data['slot_id']);

        $score = GameScore::updateOrCreate(
            ['user_id' => $data['user_id'], 'slot_id' => $data['slot_id'], 'day' => $slot->day],
            ['observer_id' => Auth::id(), 'score' => $data['score'], 'notes' => $data['notes'] ?? $slot->name]
        );
        return response()->json($score);
    }

    public function storePracticeScore(Request $request) {
        $data = $request->validate([
            'user_id' => 'required',
            'score' => 'required|integer|min:0|max:100',
            'notes' => 'nullable|string',
            'slot_id' => 'required'
        ]);

        $slot = \App\Models\PracticeSlot::findOrFail($data['slot_id']);

        $score = PracticeScore::updateOrCreate(
            ['user_id' => $data['user_id'], 'slot_id' => $data['slot_id'], 'day' => $slot->day],
            ['observer_id' => Auth::id(), 'score' => $data['score'], 'notes' => $data['notes'] ?? $slot->name]
        );
        return response()->json($score);
    }

    public function storeWorshipScore(Request $request) {
        $data = $request->validate([
            'user_id' => 'required',
            'score' => 'required|integer|min:0|max:100',
            'notes' => 'nullable|string',
            'slot_id' => 'required'
        ]);

        $slot = \App\Models\WorshipSlot::findOrFail($data['slot_id']);

        $score = WorshipLog::updateOrCreate(
            ['user_id' => $data['user_id'], 'slot_id' => $data['slot_id'], 'day' => $slot->day],
            ['observer_id' => Auth::id(), 'score' => $data['score'], 'notes' => $data['notes'] ?? $slot->name]
        );
        return response()->json($score);
    }
}
