<?php

namespace App\Http\Controllers;

use App\Models\WorshipLog;
use Illuminate\Http\Request;
use Carbon\Carbon;

class WorshipLogController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'activity_name' => 'required|string|max:255',
        ]);

        $user = $request->user();

        // Check if already reported this specific activity today
        $alreadyReported = WorshipLog::where('user_id', $user->id)
            ->where('activity_name', $request->activity_name)
            ->whereDate('created_at', Carbon::today())
            ->exists();

        if ($alreadyReported) {
            return response()->json(['message' => 'Anda sudah melaporkan aktivitas ibadah ini hari ini.'], 400);
        }

        $log = WorshipLog::create([
            'user_id' => $user->id,
            'activity_name' => $request->activity_name,
            'bonus_points' => 2 // Default bonus according to Brief
        ]);

        return response()->json([
            'message' => 'Aktivitas ibadah berhasil dilaporkan. (+2 Poin Bonus)',
            'log' => $log
        ], 201);
    }
    
    public function index(Request $request)
    {
        $logs = WorshipLog::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json(['logs' => $logs]);
    }
}
