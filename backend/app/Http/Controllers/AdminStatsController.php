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

    public function getRealtimeSurveys() {
        try {
            $responses = \Illuminate\Support\Facades\DB::table('survey_responses')
                ->join('users as assessors', 'survey_responses.user_id', '=', 'assessors.id')
                ->join('users as targets', 'survey_responses.target_id', '=', 'targets.id')
                ->join('survey_questions', 'survey_responses.question_id', '=', 'survey_questions.id')
                ->select(
                    'survey_responses.id',
                    'assessors.name as assessor_name',
                    'targets.name as target_name',
                    'survey_questions.question_text',
                    'survey_responses.answer',
                    'survey_responses.period',
                    'survey_responses.created_at'
                )
                ->orderBy('survey_responses.created_at', 'desc')
                ->limit(50)
                ->get();

            return response()->json($responses);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
