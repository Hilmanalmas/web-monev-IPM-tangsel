<?php
namespace App\Http\Controllers;

use App\Models\RtlQuestion;
use App\Models\RtlResponse;
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
}
