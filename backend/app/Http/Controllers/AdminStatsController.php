<?php
namespace App\Http\Controllers;
use App\Models\User;
use App\Models\Attendance;
use App\Models\Evaluation;
use App\Models\ManitoMapping;

use App\Models\AppSetting;
use Illuminate\Http\Request;

class AdminStatsController extends Controller {
    public function stats() {
        return response()->json([
            'peserta' => User::where('role', 'peserta')->count(),
            'attendance_today' => Attendance::whereDate('created_at', today())->count(),
            'evaluations' => Evaluation::count(),
            'manito_pairs' => ManitoMapping::where('is_active', true)->count(),
            'current_day' => (int)AppSetting::get('current_day', 1)
        ]);
    }

    public function getSettings() {
        return response()->json([
            'current_day' => (int)AppSetting::get('current_day', 1)
        ]);
    }

    public function updateSettings(Request $request) {
        $data = $request->validate([
            'current_day' => 'required|integer|min:1'
        ]);
        
        AppSetting::set('current_day', $data['current_day']);
        
        return response()->json(['message' => 'Settings updated', 'current_day' => $data['current_day']]);
    }
}
