<?php
namespace App\Http\Controllers;
use App\Models\SurveyResponse;
use Illuminate\Http\Request;

class ResponseController extends Controller {
    public function storeSurvey(Request $request, $surveyId) {
        $data = $request->validate([
            'responses' => 'required|array',
            'target_id' => 'nullable|exists:users,id'
        ]);

        foreach ($data['responses'] as $resp) {
            SurveyResponse::updateOrCreate(
                [
                    'user_id' => $request->user()->id,
                    'target_id' => $data['target_id'] ?? null,
                    'question_id' => $resp['question_id'],
                ],
                ['answer' => $resp['answer']]
            );
        }

        return response()->json(['message' => 'Responses saved successfully']);
    }
}
