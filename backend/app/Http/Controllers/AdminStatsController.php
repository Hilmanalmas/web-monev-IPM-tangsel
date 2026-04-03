<?php
namespace App\Http\Controllers;
use App\Models\User;
use App\Models\Attendance;
use App\Models\Evaluation;
use App\Models\ManitoMapping;

use App\Models\AppSetting;
use Illuminate\Http\Request;

class AdminStatsController extends Controller {
    public function stats() {
        return response()->json([
            'peserta' => User::where('role', 'peserta')->count(),
            'attendance_today' => Attendance::whereDate('created_at', today())->count(),
            'evaluations' => Evaluation::count(),
            'manito_pairs' => ManitoMapping::where('is_active', true)->count(),
            'current_day' => (int)AppSetting::get('current_day', 1)
        ]);
    }

    public function getSettings() {
        return response()->json([
            'current_day' => (int)AppSetting::get('current_day', 1)
        ]);
    }

    public function updateSettings(Request $request) {
        $data = $request->validate([
            'current_day' => 'required|integer|min:1'
        ]);
        
        \Illuminate\Support\Facades\DB::table('app_settings')->updateOrInsert(
            ['key' => 'current_day'],
            ['value' => $data['current_day'], 'updated_at' => now()]
        );
        
        return response()->json(['message' => 'Settings updated', 'current_day' => $data['current_day']]);
    }

    public function getRealtimeFeed() {
        try {
            // 1. Manito Surveys
            $manito = \Illuminate\Support\Facades\DB::table('survey_responses')
                ->join('users as assessors', 'survey_responses.user_id', '=', 'assessors.id')
                ->join('users as targets', 'survey_responses.target_id', '=', 'targets.id')
                ->join('survey_questions', 'survey_responses.question_id', '=', 'survey_questions.id')
                ->select(
                    'survey_responses.id',
                    \Illuminate\Support\Facades\DB::raw("'MANITO' as type"),
                    'assessors.name as user_name',
                    'targets.name as target_name',
                    'survey_questions.question_text as description',
                    'survey_responses.answer as score',
                    'survey_responses.created_at'
                )
                ->orderBy('survey_responses.created_at', 'desc')
                ->limit(20)
                ->get();

            // 2. Game Scores
            $games = \Illuminate\Support\Facades\DB::table('game_scores')
                ->join('users', 'game_scores.user_id', '=', 'users.id')
                ->join('game_slots', 'game_scores.slot_id', '=', 'game_slots.id')
                ->select(
                    'game_scores.id',
                    \Illuminate\Support\Facades\DB::raw("'GAMES' as type"),
                    'users.name as user_name',
                    \Illuminate\Support\Facades\DB::raw("NULL as target_name"),
                    'game_slots.name as description',
                    'game_scores.score',
                    'game_scores.created_at'
                )
                ->orderBy('game_scores.created_at', 'desc')
                ->limit(20)
                ->get();

            // 3. Practice Scores
            $practice = \Illuminate\Support\Facades\DB::table('practice_scores')
                ->join('users', 'practice_scores.user_id', '=', 'users.id')
                ->join('practice_slots', 'practice_scores.slot_id', '=', 'practice_slots.id')
                ->select(
                    'practice_scores.id',
                    \Illuminate\Support\Facades\DB::raw("'PRAKTEK' as type"),
                    'users.name as user_name',
                    \Illuminate\Support\Facades\DB::raw("NULL as target_name"),
                    'practice_slots.name as description',
                    'practice_scores.score',
                    'practice_scores.created_at'
                )
                ->orderBy('practice_scores.created_at', 'desc')
                ->limit(20)
                ->get();

            // 4. Worship Logs
            $worship = \Illuminate\Support\Facades\DB::table('worship_logs')
                ->join('users', 'worship_logs.user_id', '=', 'users.id')
                ->join('worship_slots', 'worship_logs.slot_id', '=', 'worship_slots.id')
                ->select(
                    'worship_logs.id',
                    \Illuminate\Support\Facades\DB::raw("'IBADAH' as type"),
                    'users.name as user_name',
                    \Illuminate\Support\Facades\DB::raw("NULL as target_name"),
                    'worship_slots.name as description',
                    'worship_logs.score',
                    'worship_logs.created_at'
                )
                ->orderBy('worship_logs.created_at', 'desc')
                ->limit(20)
                ->get();

            // 5. Cognitive Scores (Tests)
            $tests = \Illuminate\Support\Facades\DB::table('cognitive_scores')
                ->join('users', 'cognitive_scores.user_id', '=', 'users.id')
                ->select(
                    'cognitive_scores.id',
                    \Illuminate\Support\Facades\DB::raw("'TEST' as type"),
                    'users.name as user_name',
                    \Illuminate\Support\Facades\DB::raw("NULL as target_name"),
                    'cognitive_scores.notes as description',
                    'cognitive_scores.score',
                    'cognitive_scores.created_at'
                )
                ->orderBy('cognitive_scores.created_at', 'desc')
                ->limit(20)
                ->get();

            // Merge and sort
            $all = $manito->concat($games)->concat($practice)->concat($worship)->concat($tests)
                ->sortByDesc('created_at')
                ->take(50)
                ->values();

            return response()->json($all);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
