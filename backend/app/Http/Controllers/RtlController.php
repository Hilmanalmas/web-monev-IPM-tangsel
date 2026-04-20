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
        $slots = \App\Models\RtlSlot::all();
        
        $mapped = $slots->map(function($slot) use ($now) {
            $baseDate = $slot->slot_date ?: $now->toDateString();
            $start = \Carbon\Carbon::parse($baseDate . ' ' . $slot->start_time);
            $end = \Carbon\Carbon::parse($baseDate . ' ' . $slot->end_time);
            
            if ($end->lessThanOrEqualTo($start)) {
                $end->addDay();
            }
            
            $isOpen = $now->between($start, $end);
            
            $isFilled = \DB::table('rtl_responses')
                ->where('user_id', \Auth::id())
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
        
        return response()->json($mapped);
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
        $start = \Carbon\Carbon::parse($baseDate . ' ' . $slot->start_time);
        $end = \Carbon\Carbon::parse($baseDate . ' ' . $slot->end_time);
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
                
                // Format pertanyaan dan jawaban untuk dikirim ke Spreadsheet
                $questions = \DB::table('rtl_questions')->whereIn('id', collect($data['responses'])->pluck('question_id'))->get()->keyBy('id');
                $descText = "";
                $idx = 1;
                foreach ($data['responses'] as $resp) {
                    $qText = $questions[$resp['question_id']]->question_text ?? 'Pertanyaan ' . $idx;
                    $aText = $resp['response_text'];
                    $descText .= "Q{$idx}: {$qText}\nA: {$aText}\n\n";
                    $idx++;
                }

                // Pengiriman langsung ke Google Sheets tanpa file Service tambahan
                $webhookUrl = config('spreadsheet.webhook_rtl') ?: config('spreadsheet.webhook_url');
                
                if ($webhookUrl) {
                    \Illuminate\Support\Facades\Http::timeout(10)->post($webhookUrl, [
                        'timestamp'  => now()->format('d/m/Y H:i:s'),
                        'sheet_name' => 'RTL',
                        'name'       => $user->name,
                        'instansi'   => $user->asal_instansi,
                        'type'       => 'RTL',
                        'item'       => $slot->name,
                        'score'      => 100,
                        'desc'       => trim($descText)
                    ]);
                }
            } catch (\Exception $e) {
                // Abaikan error spreadsheet agar database tetap tersimpan
            }

            return response()->json(['message' => 'RTL berhasil dikirim']);
        });
    }

}
