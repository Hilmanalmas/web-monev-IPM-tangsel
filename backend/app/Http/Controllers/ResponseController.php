<?php
namespace App\Http\Controllers;
use App\Models\SurveyResponse;
use App\Models\SurveyQuestion;
use App\Models\SurveySlot;
use Illuminate\Http\Request;
use Carbon\Carbon;

class ResponseController extends Controller {
    public function storeSurvey(Request $request) {
        $data = $request->validate([
            'target_id' => 'required|exists:users,id',
            'period' => 'required|string', // name of the slot
            'responses' => 'required|array',
        ]);

        $date = Carbon::today()->format('Y-m-d');

        // Verify slot is still open
        $slot = SurveySlot::where('name', $data['period'])->first();
        if (!$slot) return response()->json(['message' => 'Slot tidak ditemukan'], 404);

        $now = Carbon::now()->format('H:i:s');
        if ($now < $slot->start_time || $now > $slot->end_time) {
            return response()->json(['message' => 'Waktu evaluasi sudah ditutup'], 403);
        }

        foreach ($data['responses'] as $resp) {
            SurveyResponse::updateOrCreate(
                [
                    'user_id' => $request->user()->id,
                    'target_id' => $data['target_id'],
                    'question_id' => $resp['question_id'],
                    'period' => $data['period'],
                    'date' => $date
                ],
                ['answer' => $resp['answer']]
            );
        }

        return response()->json(['message' => 'Penilaian Manito berhasil disimpan']);
    }

    public function checkStatus(Request $request) {
        $date = Carbon::today()->format('Y-m-d');
        $user = $request->user();
        $now = Carbon::now()->format('H:i:s');
        
        $slots = SurveySlot::all();
        $responses = SurveyResponse::where('user_id', $user->id)
            ->where('date', $date)
            ->get()
            ->groupBy('period');

        $result = $slots->map(function($slot) use ($responses, $now) {
            return [
                'name' => $slot->name,
                'start_time' => $slot->start_time,
                'end_time' => $slot->end_time,
                'is_filled' => isset($responses[$slot->name]),
                'is_open' => $now >= $slot->start_time && $now <= $slot->end_time
            ];
        });

        return response()->json($result);
    }

    public function activeQuestions() {
        return response()->json(SurveyQuestion::where('is_active', true)->get());
    }
}
