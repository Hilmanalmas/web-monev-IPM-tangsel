<?php

namespace App\Http\Controllers;

use App\Models\Evaluation;
use App\Models\ManitoMapping;
use App\Models\AppSetting;
use Illuminate\Http\Request;

class EvaluationController extends Controller
{
    public function store(Request $request)
    {
        $user = $request->user();

        $currentDay = AppSetting::get('current_day', 1);

        // 1. Dapatkan target_id dari mapping yang aktif untuk assessor ini pada hari ini
        $mapping = ManitoMapping::where('assessor_id', $user->id)
            ->where('day', $currentDay)
            ->where('is_active', true)
            ->first();

        if (!$mapping) {
            return response()->json(['message' => 'Anda belum mendapatkan peserta target (Manito) untuk dinilai.'], 403);
        }

        // 2. Validasi input
        $validated = $request->validate([
            'psychomotor_precision' => 'required|integer|min:1|max:5',
            'psychomotor_efficiency' => 'required|integer|min:1|max:5',
            'psychomotor_independence' => 'required|integer|min:1|max:5',
            'psychomotor_quality' => 'required|integer|min:1|max:5',
            'affective_initiative' => 'required|integer|min:1|max:5',
            'affective_resilience' => 'required|integer|min:1|max:5',
            'affective_ethics' => 'required|integer|min:1|max:5',
            'affective_collaboration' => 'required|integer|min:1|max:5',
            'evidence_notes' => 'required|string|min:10',
        ]);

        // Cek jika sudah mengevaluasi target ini pada hari ini
        $alreadyEvaluated = Evaluation::where('assessor_id', $user->id)
            ->where('target_id', $mapping->target_id)
            ->where('day', $currentDay)
            ->exists();

        if ($alreadyEvaluated) {
            return response()->json(['message' => 'Anda sudah memberikan penilaian hari ini.'], 400);
        }

        // 3. Simpan evaluasi
        $evaluation = Evaluation::create([
            'assessor_id' => $user->id,
            'target_id' => $mapping->target_id,
            'psychomotor_precision' => $validated['psychomotor_precision'],
            'psychomotor_efficiency' => $validated['psychomotor_efficiency'],
            'psychomotor_independence' => $validated['psychomotor_independence'],
            'psychomotor_quality' => $validated['psychomotor_quality'],
            'affective_initiative' => $validated['affective_initiative'],
            'affective_resilience' => $validated['affective_resilience'],
            'affective_ethics' => $validated['affective_ethics'],
            'affective_collaboration' => $validated['affective_collaboration'],
            'evidence_notes' => $validated['evidence_notes'],
            'status' => 'pending', 
            'day' => $currentDay,
        ]);

        return response()->json([
            'message' => 'Penilaian berhasil disimpan secara rahasia.',
            'evaluation' => $evaluation
        ], 201);
    }

    public function pending(Request $request)
    {
        $evaluations = Evaluation::with(['assessor:id,name', 'target:id,name'])
            ->where('status', 'pending')
            ->get();
            
        return response()->json(['evaluations' => $evaluations]);
    }
}
