<?php
namespace App\Http\Controllers;

use App\Models\AttendanceSlot;
use App\Models\RtlSlot;
use App\Models\SurveySlot;
use App\Models\Exam;
use App\Models\Attendance;
use App\Models\RtlResponse;
use App\Models\SurveyResponse;
use App\Models\ExamSubmission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;

class PesertaController extends Controller {
    public function dashboard() {
        $user = Auth::user();
        if ($user->role !== 'peserta') return response()->json(['error' => 'Unauthorized'], 403);

        // Check active tasks
        $now = \Carbon\Carbon::now();
        
        $attendance = AttendanceSlot::all()->filter(function($slot) use ($now) {
                $start = \Carbon\Carbon::createFromFormat('H:i:s', $slot->start_time);
                $end = \Carbon\Carbon::createFromFormat('H:i:s', $slot->end_time);
                if ($end->lessThanOrEqualTo($start)) { $end->addDay(); }
                return $now->between($start, $end);
            })->map(function($s) use ($user) {
                $done = Attendance::where('user_id', $user->id)->where('slot_id', $s->id)
                    ->whereDate('recorded_at', \Carbon\Carbon::today())->exists();
                return ['type' => 'absensi', 'name' => $s->name, 'done' => $done];
            });

        // RTL: only show as task if admin has activated it
        $rtlTasks = collect();
        $isRtlActive = Cache::get('is_rtl_active', false);
        if ($isRtlActive) {
            $slot = RtlSlot::first();
            $done = false;
            if ($slot) {
                $done = RtlResponse::where('user_id', $user->id)
                    ->where('slot_id', $slot->id)
                    ->exists();
            }
            $rtlTasks->push(['type' => 'rtl', 'name' => 'Penilaian RTL', 'done' => $done]);
        }

        $manito = SurveySlot::all()->filter(function($slot) use ($now) {
                $start = \Carbon\Carbon::createFromFormat('H:i:s', $slot->start_time);
                $end = \Carbon\Carbon::createFromFormat('H:i:s', $slot->end_time);
                if ($end->lessThanOrEqualTo($start)) { $end->addDay(); }
                return $now->between($start, $end);
            })->map(function($s) use ($user) {
                // Approximate done check
                $done = false; // We use simplified survey so we don't fully block here.
                return ['type' => 'manito', 'name' => $s->name, 'done' => $done];
            });

        return response()->json([
            'tasks' => collect()->concat($attendance)->concat($rtlTasks)->concat($manito)
        ]);
    }

    public function getFinalReport() {
        return response()->json(['message' => 'Laporan belum dibuka oleh Admin.']);
    }
}

