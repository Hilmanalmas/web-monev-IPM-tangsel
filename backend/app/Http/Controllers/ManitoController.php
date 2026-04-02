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
        $user = $request->user();
        $currentDay = \App\Models\AppSetting::get('current_day', 1);
        
        $mapping = ManitoMapping::where('assessor_id', $user->id)
            ->where('day', $currentDay)
            ->where('is_active', true)
            ->with(['target' => function($query) {
                $query->select('id', 'name', 'email', 'nip', 'asal_instansi');
            }])
            ->first();

        if (!$mapping || !$mapping->target) {
            return response()->json(['message' => 'No target assigned for today.'], 404);
        }

        return response()->json(['target' => $mapping->target], 200);
    }
}
