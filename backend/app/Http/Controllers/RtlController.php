<?php
namespace App\Http\Controllers;

use App\Models\RtlQuestion;
use App\Models\RtlSlot;
use App\Models\RtlResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;

class RtlController extends Controller
{
    public function activeQuestions()
    {
        return response()->json(RtlQuestion::where('is_active', true)->get());
    }

    public function rtlStatus()
    {
        $isActive = Cache::get('is_rtl_active', false);
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

        $isActive = Cache::get('is_rtl_active', false);
        if (!$isActive) {
            return response()->json(['message' => 'Laman RTL belum bisa diakses.'], 403);
        }

        $slot = RtlSlot::first();
        if (!$slot) {
            $slot = RtlSlot::create(['name' => 'Penilaian Pasca Kegiatan', 'start_time' => '00:00:00', 'end_time' => '23:59:59']);
        }

        if (RtlResponse::where('user_id', Auth::id())->where('slot_id', $slot->id)->exists()) {
            return response()->json(['message' => 'Anda sudah mengisi RTL.'], 400);
        }

        foreach ($data['responses'] as $resp) {
            RtlResponse::create([
                'user_id' => Auth::id(),
                'question_id' => $resp['question_id'],
                'slot_id' => $slot->id,
                'selfie_url' => $data['selfie_url'],
                'answer' => $resp['response_text'],
                'date' => today()
            ]);
        }

        return response()->json(['message' => 'RTL berhasil dikirim']);
    }
}
