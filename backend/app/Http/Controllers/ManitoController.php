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
        $result = $this->manitoService->shuffleAll();
        
        if ($result['success']) {
            return response()->json($result, 200);
        } else {
            return response()->json($result, 400);
        }
    }

    public function getTarget(Request $request)
    {
        $user = $request->user();
        
        $mapping = ManitoMapping::where('assessor_id', $user->id)
            ->where('is_active', true)
            ->with(['target' => function($query) {
                $query->select('id', 'name', 'email', 'nip', 'asal_instansi');
            }])
            ->first();

        if (!$mapping || !$mapping->target) {
            return response()->json(['message' => 'No target assigned yet.'], 404);
        }

        return response()->json(['target' => $mapping->target], 200);
    }
}
