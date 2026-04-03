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
        try {
            $data = $request->validate([
                'target_id' => 'required',
                'period' => 'required|string',
                'responses' => 'required|array',
                'responses.*.question_id' => 'required',
                'responses.*.answer' => 'required|integer|min:1|max:4',
            ]);

            $date = \Carbon\Carbon::today()->format('Y-m-d');
            
            // Ambil Hari Aktif (Raw)
            $currentDay = \Illuminate\Support\Facades\DB::table('app_settings')
                ->where('key', 'current_day')
                ->value('value') ?: 1;

            foreach ($data['responses'] as $resp) {
                \Illuminate\Support\Facades\DB::table('survey_responses')->updateOrInsert(
                    [
                        'user_id' => $request->user()->id,
                        'target_id' => $data['target_id'],
                        'question_id' => $resp['question_id'],
                        'period' => $data['period'],
                        'date' => $date,
                        'day' => $currentDay
                    ],
                    [
                        'answer' => $resp['answer'],
                        'created_at' => now(),
                        'updated_at' => now()
                    ]
                );
            }

            return response()->json(['message' => 'Penilaian Manito berhasil disimpan']);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function checkStatus(Request $request)
    {
        try {
            $user = $request->user();
            $now = \Carbon\Carbon::now();
            
            $currentDay = \Illuminate\Support\Facades\DB::table('app_settings')
                ->where('key', 'current_day')
                ->value('value') ?: 1;

            $slots = \Illuminate\Support\Facades\DB::table('survey_slots')
                ->where('day', $currentDay)
                ->get();

            $responses = \Illuminate\Support\Facades\DB::table('survey_responses')
                ->where('user_id', $user->id)
                ->where('day', $currentDay)
                ->get()
                ->groupBy('period');

            $activeQuestionsCount = \Illuminate\Support\Facades\DB::table('survey_questions')
                ->where('is_active', 1)
                ->count();

            $result = $slots->map(function ($slot) use ($responses, $now, $activeQuestionsCount) {
                $start = \Carbon\Carbon::createFromFormat('H:i:s', $slot->start_time);
                $end = \Carbon\Carbon::createFromFormat('H:i:s', $slot->end_time);
                
                if ($end->lessThanOrEqualTo($start)) {
                    $end->addDay();
                }

                $userResponsesForPeriod = isset($responses[$slot->name]) ? collect($responses[$slot->name]) : collect();
                $isFilled = $userResponsesForPeriod->count() >= $activeQuestionsCount && $activeQuestionsCount > 0;

                return [
                    'id' => $slot->id,
                    'name' => $slot->name,
                    'start_time' => $slot->start_time,
                    'end_time' => $slot->end_time,
                    'is_filled' => $isFilled,
                    'is_open' => $now->between($start, $end)
                ];
            });

            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function activeQuestions()
    {
        return response()->json(SurveyQuestion::where('is_active', true)->get());
    }
}
