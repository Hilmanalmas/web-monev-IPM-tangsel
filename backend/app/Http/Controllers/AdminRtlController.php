<?php
namespace App\Http\Controllers;

use App\Models\RtlQuestion;
use App\Models\RtlResponse;
use App\Models\AppSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class AdminRtlController extends Controller {
    public function listQuestions() { return response()->json(RtlQuestion::all()); }
    
    public function storeQuestion(Request $request) {
        $data = $request->validate([
            'question_text' => 'required',
            'is_active' => 'boolean'
        ]);
        return response()->json(RtlQuestion::create($data));
    }

    public function destroyQuestion($id) {
        RtlQuestion::findOrFail($id)->delete();
        return response()->json(['message' => 'Question deleted']);
    }

    public function getSchedule() {
        return response()->json([
            'is_active' => Cache::get('is_rtl_active', false),
            'start_datetime' => AppSetting::get('rtl_start_datetime', ''),
            'end_datetime' => AppSetting::get('rtl_end_datetime', '')
        ]);
    }

    public function saveSchedule(Request $request) {
        $data = $request->validate([
            'is_active' => 'required|boolean',
            'start_datetime' => 'nullable|string',
            'end_datetime' => 'nullable|string'
        ]);
        Cache::forever('is_rtl_active', $data['is_active']);
        AppSetting::set('rtl_start_datetime', $data['start_datetime'] ?? null);
        AppSetting::set('rtl_end_datetime', $data['end_datetime'] ?? null);
        return response()->json([
            'message' => 'Jadwal dan status RTL berhasil disimpan',
            'schedule' => $data
        ]);
    }

    public function getStatus() {
        return response()->json([
            'is_active' => Cache::get('is_rtl_active', false)
        ]);
    }

    public function toggleStatus(Request $request) {
        $data = $request->validate([
            'is_active' => 'required|boolean'
        ]);
        Cache::forever('is_rtl_active', $data['is_active']);
        return response()->json([
            'is_active' => $data['is_active'],
            'message' => $data['is_active'] ? 'RTL telah diaktifkan' : 'RTL telah dinonaktifkan'
        ]);
    }

    public function monitor() {
        // Fetch all RTL responses grouped by User
        $responses = RtlResponse::join('users', 'rtl_responses.user_id', '=', 'users.id')
            ->join('rtl_questions', 'rtl_responses.question_id', '=', 'rtl_questions.id')
            ->select('rtl_responses.*', 'users.name as user_name', 'rtl_questions.question_text')
            ->orderBy('rtl_responses.user_id')
            ->get();

        $grouped = [];
        foreach($responses as $resp) {
            if (!isset($grouped[$resp->user_id])) {
                $grouped[$resp->user_id] = [
                    'user_id' => $resp->user_id,
                    'user_name' => $resp->user_name,
                    'selfie_url' => $resp->selfie_url,
                    'date' => $resp->date,
                    'answers' => []
                ];
            }
            if ($resp->selfie_url) {
                $grouped[$resp->user_id]['selfie_url'] = $resp->selfie_url;
            }
            $grouped[$resp->user_id]['answers'][] = [
                'question' => $resp->question_text,
                'answer' => $resp->answer
            ];
        }

        return response()->json(array_values($grouped));
    }
}
