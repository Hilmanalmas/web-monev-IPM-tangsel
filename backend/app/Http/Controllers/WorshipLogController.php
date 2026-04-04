<?php

namespace App\Http\Controllers;

use App\Models\WorshipLog;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class WorshipLogController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'activity_name' => 'required|string|max:255',
        ]);

        $user = $request->user();

        // 🛡️ ATOMIC PROTECTION: Use transaction and updateOrCreate based on DATE
        return DB::transaction(function() use ($request, $user) {
            $log = WorshipLog::updateOrCreate(
                [
                    'user_id' => $user->id,
                    'activity_name' => $request->activity_name,
                    'date' => Carbon::today() // Ensure uniqueness per day
                ],
                [
                    'score' => 10, // Base score for attendance in worship
                    'bonus_points' => 2,
                    'created_at' => now(),
                    'updated_at' => now()
                ]
            );

            // Sync to Spreadsheet (Incremental)
            try {
                \App\Services\SpreadsheetService::postScore([
                    'name'     => $user->name,
                    'instansi' => $user->asal_instansi,
                    'type'     => 'IBADAH',
                    'item'     => $request->activity_name,
                    'score'    => 10,
                    'desc'     => 'Aktivitas Ibadah Terverifikasi'
                ]);
            } catch (\Exception $e) {}

            return response()->json([
                'message' => 'Aktivitas ibadah berhasil dicatat.',
                'log' => $log
            ], 201);
        });
    }
    
    public function index(Request $request)
    {
        $logs = WorshipLog::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json(['logs' => $logs]);
    }
}
