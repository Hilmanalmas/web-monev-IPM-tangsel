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

    public function listSlots() {
        return response()->json(\App\Models\RtlSlot::orderBy('slot_date')->orderBy('start_time')->get());
    }

    public function storeSlot(Request $request) {
        $data = $request->validate([
            'name' => 'required|string',
            'slot_date' => 'required|date',
            'start_time' => 'required',
            'end_time' => 'required'
        ]);
        return response()->json(\App\Models\RtlSlot::create($data));
    }

    public function destroySlot($id) {
        \App\Models\RtlSlot::findOrFail($id)->delete();
        return response()->json(['message' => 'Slot deleted']);
    }

    public function monitor() {
        // Fetch all RTL responses grouped by User
        $responses = clone RtlResponse::join('users', 'rtl_responses.user_id', '=', 'users.id')
            ->join('rtl_questions', 'rtl_responses.question_id', '=', 'rtl_questions.id')
            ->join('rtl_slots', 'rtl_responses.slot_id', '=', 'rtl_slots.id')
            ->select('rtl_responses.*', 'users.name as user_name', 'rtl_questions.question_text', 'rtl_slots.name as slot_name')
            ->orderBy('rtl_responses.user_id')
            ->get();

        $grouped = [];
        foreach($responses as $resp) {
            $groupKey = $resp->user_id . '_' . $resp->slot_id;
            if (!isset($grouped[$groupKey])) {
                $grouped[$groupKey] = [
                    'user_id' => $resp->user_id,
                    'user_name' => $resp->user_name,
                    'selfie_url' => $resp->selfie_url,
                    'date' => $resp->date,
                    'slot' => $resp->slot_name,
                    'answers' => []
                ];
            }
            if ($resp->selfie_url && empty($grouped[$groupKey]['selfie_url'])) {
                $grouped[$groupKey]['selfie_url'] = $resp->selfie_url;
            }
            $grouped[$groupKey]['answers'][] = [
                'question' => $resp->question_text,
                'answer' => $resp->answer
            ];
        }

        return response()->json(array_values($grouped));
    }
}
