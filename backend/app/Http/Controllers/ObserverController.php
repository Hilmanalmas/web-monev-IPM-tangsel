<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\CognitiveScore;

class ObserverController extends Controller {
    public function getPeserta() {
        // Observers can see all peserta
        $peserta = User::where('role', 'peserta')->select('id', 'name', 'asal_instansi')->get();
        // Also load if they already have a score
        $scores = CognitiveScore::all()->keyBy('user_id');
        
        $peserta->map(function($p) use ($scores) {
            $p->has_score = $scores->has($p->id);
            $p->score_value = $scores->has($p->id) ? $scores[$p->id]->score : null;
            return $p;
        });
        
        return response()->json(['peserta' => $peserta]);
    }

    public function storeScore(Request $request) {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'score' => 'required|numeric|min:0|max:100',
            'notes' => 'nullable|string'
        ]);

        CognitiveScore::updateOrCreate(
            ['user_id' => $request->user_id],
            [
                'observer_id' => $request->user()->id,
                'score' => $request->score,
                'notes' => $request->notes
            ]
        );

        return response()->json(['message' => 'Nilai Kognitif berhasil disimpan dengan aman!']);
    }
}
