<?php
namespace App\Http\Controllers;
use App\Models\User;
use App\Models\Attendance;
use App\Models\Evaluation;
use App\Models\ManitoMapping;

class AdminStatsController extends Controller {
    public function stats() {
        return response()->json([
            'peserta' => User::where('role', 'peserta')->count(),
            'attendance_today' => Attendance::whereDate('created_at', today())->count(),
            'evaluations' => Evaluation::count(),
            'manito_pairs' => ManitoMapping::where('is_active', true)->count()
        ]);
    }
}
