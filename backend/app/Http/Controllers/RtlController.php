<?php
namespace App\Http\Controllers;

use App\Models\RtlQuestion;
use App\Models\RtlSlot;
use App\Models\RtlResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class RtlController extends Controller
{
    public function activeQuestions()
    {
        return response()->json(RtlQuestion::where('is_active', true)->get());
    }

    private function checkRtlActive()
    {
        $isActive = Cache::get('is_rtl_active', false);
        $start = \App\Models\AppSetting::get('rtl_start_datetime');
        $end = \App\Models\AppSetting::get('rtl_end_datetime');
        
        if ($start && $end) {
            $now = now();
            if ($now->gte(\Carbon\Carbon::parse($start)) && $now->lte(\Carbon\Carbon::parse($end))) {
                $isActive = true;
            } else {
                $isActive = false; // Always override using dates if available
            }
        }
        return $isActive;
    }

    public function rtlStatus()
    {
        $isActive = $this->checkRtlActive();
        $isFilled = false;
        
        if ($isActive) {
            $slot = RtlSlot::first();
            if ($slot) {
                $isFilled = RtlResponse::where('user_id', Auth::id())
                    ->where('slot_id', $slot->id)
                    ->exists();
            }
        }

        return response()->json([
            'is_active' => $isActive,
            'is_filled' => $isFilled
        ]);
    }

    public function storeResponse(Request $request)
    {
        $data = $request->validate([
            'selfie_url' => 'nullable|string', 
            'responses' => 'required|array',
            'responses.*.question_id' => 'required',
            'responses.*.response_text' => 'required|string'
        ]);

        if (!$this->checkRtlActive()) {
            return response()->json(['message' => 'Laman RTL belum bisa diakses atau telah ditutup.'], 403);
        }

        return DB::transaction(function() use ($data) {
            $slot = RtlSlot::first();
            if (!$slot) {
                $slot = RtlSlot::create(['name' => 'Penilaian Pasca Kegiatan', 'start_time' => '00:00:00', 'end_time' => '23:59:59']);
            }

            $userId = Auth::id();
            
            // Optimize database inserts: delete old responses and run a fast bulk insert
            RtlResponse::where('user_id', $userId)
                ->where('slot_id', $slot->id)
                ->delete();

            $inserts = [];
            $now = now();
            foreach ($data['responses'] as $resp) {
                $inserts[] = [
                    'user_id' => $userId,
                    'question_id' => $resp['question_id'],
                    'slot_id' => $slot->id,
                    'selfie_url' => $data['selfie_url'],
                    'answer' => $resp['response_text'],
                    'date' => $now->toDateString(),
                    'created_at' => $now,
                    'updated_at' => $now
                ];
            }
            RtlResponse::insert($inserts);

            // Sync to Spreadsheet (Batch)
            try {
                $user = Auth::user();
                \App\Services\SpreadsheetService::postScore([
                    'name'     => $user->name,
                    'instansi' => $user->asal_instansi,
                    'type'     => 'RTL',
                    'item'     => 'Submission RTL',
                    'score'    => 100, // Participation score
                    'desc'     => 'Submission completed'
                ]);
            } catch (\Exception $e) {}

            return response()->json(['message' => 'RTL berhasil dikirim']);
        });
    }
}
