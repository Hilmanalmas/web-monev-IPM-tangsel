<?php

namespace App\Http\Controllers;

use App\Services\ManitoService;
use App\Models\ManitoMapping;
use App\Models\User;
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
            
            // Bypass app_settings table using raw query for maximum safety
            $currentDaySetting = DB::table('app_settings')
                ->where('key', 'current_day')
                ->first();
            
            $currentDay = $currentDaySetting ? intval($currentDaySetting->value) : 1;
            
            // Step 1: Find the mapping first (Manual query no relations yet)
            $mapping = ManitoMapping::where('assessor_id', $user->id)
                ->where('day', $currentDay)
                ->where('is_active', true)
                ->first();

            if (!$mapping) {
                return response()->json([
                    'message' => 'Target Manito belum ditentukan untukmu hari ini.',
                    'debug' => [
                        'user_id' => $user->id,
                        'day' => $currentDay
                    ]
                ], 404);
            }

            // Step 2: Find the target user manually to avoid relation bugs
            $targetUser = User::select('id', 'name', 'email')
                ->find($mapping->target_id);

            if (!$targetUser) {
                return response()->json([
                    'message' => 'Data target tidak ditemukan di sistem.',
                    'debug' => ['target_id' => $mapping->target_id]
                ], 404);
            }

            return response()->json(['target' => $targetUser], 200);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Sistem gagal mengambil data.',
                'message' => $e->getMessage(),
                'trace' => 'Error at Line ' . $e->getLine() . ' in ' . basename($e->getFile())
            ], 500);
        }
    }
}
