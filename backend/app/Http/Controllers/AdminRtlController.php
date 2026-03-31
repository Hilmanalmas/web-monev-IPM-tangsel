<?php
namespace App\Http\Controllers;

use App\Models\RtlQuestion;
use App\Models\RtlSlot;
use Illuminate\Http\Request;

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

    public function listSlots() { return response()->json(RtlSlot::all()); }
    
    public function storeSlot(Request $request) {
        $data = $request->validate([
            'name' => 'required|string',
            'start_time' => 'required',
            'end_time' => 'required'
        ]);
        return response()->json(RtlSlot::create($data));
    }

    public function destroySlot($id) {
        RtlSlot::findOrFail($id)->delete();
        return response()->json(['message' => 'Slot deleted']);
    }
}
