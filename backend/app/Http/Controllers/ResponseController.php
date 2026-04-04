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
            
            $currentDay = \Illuminate\Support\Facades\DB::table('app_settings')
                ->where('key', 'current_day')
                ->value('value') ?: 1;
            
            $slot = \Illuminate\Support\Facades\DB::table('survey_slots')
                ->where('name', $data['period'])
                ->first();

            $targetDay = $slot ? $slot->day : $currentDay;

            \Illuminate\Support\Facades\DB::transaction(function() use ($data, $request, $date, $targetDay) {
                foreach ($data['responses'] as $resp) {
                    \Illuminate\Support\Facades\DB::table('survey_responses')->updateOrInsert(
                        [
                            'user_id' => $request->user()->id,
                            'target_id' => $data['target_id'],
                            'question_id' => $resp['question_id'],
                            'period' => $data['period'],
                            'date' => $date,
                            'day' => $targetDay
                        ],
                        [
                            'answer' => $resp['answer'],
                            'created_at' => now(),
                            'updated_at' => now()
                        ]
                    );
                }
            });

            // Sync to Spreadsheet
            try {
                $user = $request->user();
                $target = \App\Models\User::find($data['target_id']);
                
                // Calculate average for this specific period submission
                $avgScore = collect($data['responses'])->avg('answer');
                
                \App\Services\SpreadsheetService::postScore([
                    'name'     => $user->name,
                    'nip'      => $user->nip,
                    'instansi' => $user->asal_instansi,
                    'category' => 'MANITO',
                    'title'    => "Penilaian " . $data['period'],
                    'score'    => number_format($avgScore, 2),
                    'day'      => $targetDay,
                    'notes'    => "Menilai: " . ($target->name ?? 'Unknown')
                ]);
            } catch (\Exception $e) {}

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
            
            // Tampilkan SEMUA slot dari SEMUA hari agar peserta bisa melihat progressnya
            $slots = \Illuminate\Support\Facades\DB::table('survey_slots')
                ->orderBy('day', 'asc')
                ->orderBy('start_time', 'asc')
                ->get();

            // Ambil semua respon user ini
            $responses = \Illuminate\Support\Facades\DB::table('survey_responses')
                ->where('user_id', $user->id)
                ->get();

            $activeQuestionsCount = \Illuminate\Support\Facades\DB::table('survey_questions')
                ->where('is_active', 1)
                ->count();

            $result = $slots->map(function ($slot) use ($responses, $now, $activeQuestionsCount) {
                // Parsing waktu dengan mempertimbangkan hari operasional
                // Namun untuk deteksi buka/tutup, kita gunakan waktu sekarang
                $start = \Carbon\Carbon::createFromFormat('H:i:s', $slot->start_time);
                $end = \Carbon\Carbon::createFromFormat('H:i:s', $slot->end_time);
                
                if ($end->lessThanOrEqualTo($start)) {
                    $end->addDay();
                }

                // Cek apakah sudah diisi untuk slot & hari yang spesifik ini
                $isFilled = $responses->where('period', $slot->name)
                                    ->where('day', $slot->day)
                                    ->count() >= $activeQuestionsCount && $activeQuestionsCount > 0;

                return [
                    'id' => $slot->id,
                    'name' => $slot->name,
                    'day' => $slot->day,
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
