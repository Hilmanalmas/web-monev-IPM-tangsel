<?php
namespace App\Http\Controllers;
use App\Models\SurveyResponse;
use App\Models\SurveyQuestion;
use App\Models\SurveySlot;
use App\Models\AppSetting;
use Illuminate\Http\Request;
use Carbon\Carbon;

class ResponseController extends Controller
{
    public function storeSurvey(Request $request)
    {
        $data = $request->validate([
            'target_id' => 'required|exists:users,id',
            'period' => 'required|string', // name of the slot
            'responses' => 'required|array',
            'responses.*.question_id' => 'required|exists:survey_questions,id',
            'responses.*.answer' => 'required|integer|min:1|max:4',
        ]);

        $date = Carbon::today()->format('Y-m-d');
        $currentDay = AppSetting::get('current_day', 1);

        // Verify slot is still open
        $slot = SurveySlot::where('name', $data['period'])->first();
        if (!$slot)
            return response()->json(['message' => 'Slot tidak ditemukan'], 404);

        $now = \Carbon\Carbon::now();
        $start = \Carbon\Carbon::createFromFormat('H:i:s', $slot->start_time);
        $end = \Carbon\Carbon::createFromFormat('H:i:s', $slot->end_time);
        if ($end->lessThanOrEqualTo($start)) { $end->addDay(); }

        if (!$now->between($start, $end)) {
            return response()->json(['message' => 'Waktu evaluasi sudah ditutup'], 403);
        }

        foreach ($data['responses'] as $resp) {
            SurveyResponse::updateOrCreate(
                [
                    'user_id' => $request->user()->id,
                    'target_id' => $data['target_id'],
                    'question_id' => $resp['question_id'],
                    'period' => $data['period'],
                    'date' => $date,
                    'day' => $currentDay
                ],
                ['answer' => $resp['answer']]
            );
        }

        return response()->json(['message' => 'Penilaian Manito berhasil disimpan']);
    }

    public function checkStatus(Request $request)
    {
        $date = \Carbon\Carbon::today()->format('Y-m-d');
        $user = $request->user();
        $now = \Carbon\Carbon::now();

        $currentDay = AppSetting::get('current_day', 1);
        $responses = SurveyResponse::where('user_id', $user->id)
            ->where('day', $currentDay)
            ->get()
            ->groupBy('period');

        $result = $slots->map(function ($slot) use ($responses, $now) {
            $start = \Carbon\Carbon::createFromFormat('H:i:s', $slot->start_time);
            $end = \Carbon\Carbon::createFromFormat('H:i:s', $slot->end_time);
            if ($end->lessThanOrEqualTo($start)) { $end->addDay(); }

            return [
                'name' => $slot->name,
                'start_time' => $slot->start_time,
                'end_time' => $slot->end_time,
                'is_filled' => isset($responses[$slot->name]),
                'is_open' => $now->between($start, $end)
            ];
        });

        return response()->json($result);
    }

    public function activeQuestions()
    {
        return response()->json(SurveyQuestion::where('is_active', true)->get());
    }
}
