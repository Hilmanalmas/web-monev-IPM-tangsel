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
use App\Models\AppSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;

class PesertaController extends Controller {
    public function dashboard() {
        $user = Auth::user();
        if ($user->role !== 'peserta') return response()->json(['error' => 'Unauthorized'], 403);

        // Check active tasks
        $now = \Carbon\Carbon::now();
        $currentDay = AppSetting::get('current_day', 1);
        
        $attendance = AttendanceSlot::all()->filter(function($slot) use ($now) {
                $start = \Carbon\Carbon::createFromFormat('H:i:s', $slot->start_time);
                $end = \Carbon\Carbon::createFromFormat('H:i:s', $slot->end_time);
                if ($end->lessThanOrEqualTo($start)) { $end->addDay(); }
                return $now->between($start, $end);
            })->map(function($s) use ($user, $currentDay) {
                $done = Attendance::where('user_id', $user->id)
                    ->where('slot_id', $s->id)
                    ->where('day', $currentDay)
                    ->exists();
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
            })->map(function($s) use ($user, $currentDay) {
                // Check if already responded today
                $done = SurveyResponse::where('user_id', $user->id)
                    ->where('day', $currentDay)
                    ->exists();
                return ['type' => 'manito', 'name' => $s->name, 'done' => $done];
            });

        $exams = Exam::where('day', $currentDay)
            ->where('start_time', '<=', $now->copy()->addMinutes(1))
            ->where('end_time', '>=', $now->copy()->subMinutes(1))
            ->get()->map(function($ex) use ($user) {
                $done = ExamSubmission::where('user_id', $user->id)
                    ->where('exam_id', $ex->id)
                    ->exists();
                return ['type' => 'test', 'name' => $ex->title, 'done' => $done];
            });

        return response()->json([
            'tasks' => collect()
                ->concat($attendance)
                ->concat($rtlTasks)
                ->concat($manito)
                ->concat($exams)
        ]);
    }

    public function getFinalReport() {
        return response()->json(['message' => 'Laporan belum dibuka oleh Admin.']);
    }
}

