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
            'category' => 'required|in:afektif,psikomotorik'
        ]);
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
            'end_time' => 'required'
        ]);
        return response()->json(SurveySlot::create($data));
    }

    public function destroySlot($id) {
        SurveySlot::findOrFail($id)->delete();
        return response()->json(['message' => 'Slot deleted']);
    }
}
