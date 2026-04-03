<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ManitoController extends Controller
{
    /**
     * Get the target for the current authenticated user
     */
    public function getTarget(Request $request)
    {
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            // 1. Ambil Hari Aktif (Raw DB)
            $day = DB::table('app_settings')
                ->where('key', 'current_day')
                ->value('value') ?: 1;

            // 2. Ambil Mapping (Raw DB)
            $mapping = DB::table('manito_mappings')
                ->where('assessor_id', $user->id)
                ->where('day', $day)
                ->where('is_active', 1)
                ->first();

            if (!$mapping) {
                return response()->json([
                    'message' => 'Target Manito belum ditentukan untukmu hari ini (Hari ' . $day . ').',
                    'debug' => ['user_id' => $user->id, 'day' => $day]
                ], 404);
            }

            // 3. Ambil Nama Target (Raw DB)
            $target = DB::table('users')
                ->where('id', $mapping->target_id)
                ->select('id', 'name', 'email')
                ->first();

            if (!$target) {
                return response()->json(['message' => 'Data target tidak ditemukan.'], 404);
            }

            return response()->json(['target' => $target], 200);

        } catch (\Exception $e) {
            // Jika masih error, tampilkan detailnya di sini
            return response()->json([
                'error' => 'Gagal mengambil data Manito',
                'details' => $e->getMessage(),
                'line' => $e->getLine()
            ], 500);
        }
    }

    /**
     * Admin function for shuffling (Uses Service)
     */
    public function shuffle(Request $request)
    {
        try {
            $day = $request->input('day');
            $service = app(\App\Services\ManitoService::class);
            $result = $service->shuffleAll($day);

            return response()->json($result, $result['success'] ? 200 : 400);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
