<?php
namespace App\Http\Controllers;

use App\Models\RtlQuestion;
use App\Models\RtlSlot;
use App\Models\RtlResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RtlController extends Controller {
    public function activeQuestions() {
        return response()->json(RtlQuestion::where('is_active', true)->get());
    }

    public function availableSlots() {
        $now = now()->format('H:i');
        $slots = RtlSlot::all()->map(function($slot) use ($now) {
            $isOpen = $now >= $slot->start_time && $now <= $slot->end_time;
            $isFilled = RtlResponse::where('user_id', Auth::id())
                ->where('slot_id', $slot->id)
                ->whereDate('date', today())
                ->exists();
            
            return [
                'id' => $slot->id,
                'name' => $slot->name,
                'start_time' => $slot->start_time,
                'end_time' => $slot->end_time,
                'is_open' => $isOpen,
                'is_filled' => $isFilled
            ];
        });
        return response()->json($slots);
    }

    public function storeResponse(Request $request) {
        $data = $request->validate([
            'slot_name' => 'required',
            'selfie_url' => 'nullable|string', // RTL requires selfie basically, but leaving nullable for flexibility
            'responses' => 'required|array',
            'responses.*.question_id' => 'required',
            'responses.*.answer' => 'required|integer|min:1|max:4'
        ]);

        $slot = RtlSlot::where('name', $data['slot_name'])->firstOrFail();

        // Ensure not filled today
        if (RtlResponse::where('user_id', Auth::id())->where('slot_id', $slot->id)->whereDate('date', today())->exists()) {
            return response()->json(['message' => 'Anda sudah mengisi RTL pada sesi ini hari ini.'], 400);
        }

        foreach ($data['responses'] as $resp) {
            RtlResponse::create([
                'user_id' => Auth::id(),
                'question_id' => $resp['question_id'],
                'slot_id' => $slot->id,
                'selfie_url' => $data['selfie_url'],
                'answer' => $resp['answer'],
                'date' => today()
            ]);
        }

        return response()->json(['message' => 'RTL berhasil dikirim']);
    }
}
