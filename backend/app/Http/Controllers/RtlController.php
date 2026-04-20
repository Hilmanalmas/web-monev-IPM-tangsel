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

    public function availableSlots(Request $request)
    {
        $now = now();
        
        $slots = RtlSlot::all()->map(function($slot) use ($now) {
            $baseDate = $slot->slot_date ? $slot->slot_date : now()->toDateString();
            $start = \Carbon\Carbon::createFromFormat('Y-m-d H:i:s', $baseDate . ' ' . $slot->start_time);
            $end = \Carbon\Carbon::createFromFormat('Y-m-d H:i:s', $baseDate . ' ' . $slot->end_time);
            
            if ($end->lessThanOrEqualTo($start)) {
                $end->addDay();
            }
            
            $isOpen = $now->between($start, $end);
            
            $isFilled = clone RtlResponse::where('user_id', Auth::id())
                ->where('slot_id', $slot->id)
                ->exists();
                
            return [
                'id' => $slot->id,
                'name' => $slot->name,
                'slot_date' => $slot->slot_date,
                'start_time' => $slot->start_time,
                'end_time' => $slot->end_time,
                'is_open' => $isOpen,
                'is_filled' => $isFilled
            ];
        });
        return response()->json($slots);
    }

    public function storeResponse(Request $request)
    {
        $data = $request->validate([
            'slot_id' => 'required',
            'selfie_url' => 'nullable|string', 
            'responses' => 'required|array',
            'responses.*.question_id' => 'required',
            'responses.*.response_text' => 'required|string'
        ]);

        $slot = RtlSlot::findOrFail($data['slot_id']);
        
        $now = now();
        $baseDate = $slot->slot_date ? $slot->slot_date : now()->toDateString();
        $start = \Carbon\Carbon::createFromFormat('Y-m-d H:i:s', $baseDate . ' ' . $slot->start_time);
        $end = \Carbon\Carbon::createFromFormat('Y-m-d H:i:s', $baseDate . ' ' . $slot->end_time);
        if ($end->lessThanOrEqualTo($start)) $end->addDay();
        
        $isOpen = $now->between($start, $end);
        if (!$isOpen) {
            return response()->json(['message' => 'Laman RTL ini sudah ditutup atau belum bisa diakses pada waktu ini.'], 403);
        }

        return DB::transaction(function() use ($data, $slot) {
            $userId = Auth::id();
            
            // Delete old responses and bulk insert
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
                    'selfie_url' => $data['selfie_url'] ?? null,
                    'answer' => $resp['response_text'],
                    'date' => $now->toDateString(),
                    'created_at' => $now,
                    'updated_at' => $now
                ];
            }
            RtlResponse::insert($inserts);

            try {
                $user = Auth::user();
                \App\Services\SpreadsheetService::postScore([
                    'name'     => $user->name,
                    'instansi' => $user->asal_instansi,
                    'type'     => 'RTL',
                    'item'     => $slot->name,
                    'score'    => 100,
                    'desc'     => 'Submission completed for ' . $slot->name
                ]);
            } catch (\Exception $e) {}

            return response()->json(['message' => 'RTL berhasil dikirim']);
        });
    }

}
