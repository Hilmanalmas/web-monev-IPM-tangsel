<?php
namespace App\Http\Controllers;

use App\Models\SurveyQuestion;
use App\Models\SurveySlot;
use Illuminate\Http\Request;

class AdminManitoController extends Controller {
    public function listQuestions() { return response()->json(SurveyQuestion::all()); }
    
    public function storeQuestion(Request $request) {
        $data = $request->validate([
            'question_text' => 'required',
            'category' => 'nullable|in:afektif,psikomotorik'
        ]);
        
        // Default to afektif if not provided
        if (!isset($data['category'])) {
            $data['category'] = 'afektif';
        }

        return response()->json(SurveyQuestion::create($data));
    }

    public function destroyQuestion($id) {
        SurveyQuestion::findOrFail($id)->delete();
        return response()->json(['message' => 'Question deleted']);
    }

    public function listSlots() { return response()->json(SurveySlot::all()); }
    
    public function storeSlot(Request $request) {
        $data = $request->validate([
            'name' => 'required|string',
            'start_time' => 'required',
            'end_time' => 'required',
            'day' => 'required|integer'
        ]);
        return response()->json(SurveySlot::create($data));
    }

    public function destroySlot($id) {
        SurveySlot::findOrFail($id)->delete();
        return response()->json(['message' => 'Slot deleted']);
    }

    public function resetResponse(Request $request) {
        $data = $request->validate([
            'user_id' => 'required',
            'day' => 'required|integer',
            'period' => 'required|string'
        ]);

        \Illuminate\Support\Facades\DB::table('survey_responses')
            ->where('user_id', $data['user_id'])
            ->where('day', $data['day'])
            ->where('period', $data['period'])
            ->delete();

        return response()->json(['message' => 'Penilaian berhasil direset untuk sesi ' . $data['period'] . ' hari ' . $data['day']]);
    }
}
