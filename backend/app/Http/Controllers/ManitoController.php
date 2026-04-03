<?php

namespace App\Http\Controllers;

use App\Services\ManitoService;
use App\Models\ManitoMapping;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ManitoController extends Controller
{
    protected $manitoService;

    public function __construct(ManitoService $manitoService)
    {
        $this->manitoService = $manitoService;
    }

    public function shuffle(Request $request)
    {
        $day = $request->input('day');
        $result = $this->manitoService->shuffleAll($day);
        
        if ($result['success']) {
            return response()->json($result, 200);
        } else {
            return response()->json($result, 400);
        }
    }

    public function getTarget(Request $request)
    {
        try {
            $user = $request->user();
            
            // Ambil hari aktif dari database, default ke 1 jika tidak ada
            $currentDay = DB::table('app_settings')
                ->where('key', 'current_day')
                ->value('value') ?: 1;
            
            $mapping = ManitoMapping::where('assessor_id', $user->id)
                ->where('day', $currentDay)
                ->where('is_active', true)
                ->with(['target' => function($query) {
                    $query->select('id', 'name', 'email');
                }])
                ->first();

            if (!$mapping) {
                return response()->json([
                    'message' => 'Target Manito belum ditentukan untukmu hari ini (Hari ' . $currentDay . ').',
                    'debug_user_id' => $user->id,
                    'debug_day' => $currentDay
                ], 404);
            }

            if (!$mapping->target) {
                return response()->json(['message' => 'Target tidak ditemukan dalam sistem.'], 404);
            }

            return response()->json(['target' => $mapping->target], 200);

        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ], 500);
        }
    }
}
