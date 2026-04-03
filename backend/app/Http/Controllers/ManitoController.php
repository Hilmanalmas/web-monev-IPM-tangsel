<?php

namespace App\Http\Controllers;

use App\Services\ManitoService;
use App\Models\ManitoMapping;
use Illuminate\Http\Request;

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
            // Hardcode day 1 for testing to bypass app_settings table issues
            $currentDay = 1; 
            
            $mapping = ManitoMapping::where('assessor_id', $user->id)
                ->where('day', $currentDay)
                ->where('is_active', true)
                ->with(['target' => function($query) {
                    $query->select('id', 'name', 'email');
                }])
                ->first();

            if (!$mapping) {
                return response()->json(['message' => 'No mapping found for User ID: ' . $user->id . ' on Day ' . $currentDay], 404);
            }

            if (!$mapping->target) {
                return response()->json(['message' => 'Target not found in mapping.'], 404);
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
