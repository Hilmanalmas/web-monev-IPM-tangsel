<?php
namespace App\Http\Controllers;

use App\Models\User;
use App\Models\SurveyResponse;
use App\Models\CognitiveScore;
use App\Models\WorshipLog;
use App\Models\Attendance;
use App\Models\GameScore;
use App\Models\PracticeScore;
use App\Models\AppSetting;
use App\Models\Exam;
use App\Models\SurveySlot;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\DB;

class AdminReportController extends Controller {
    public function index() {
        $users = User::where('role', 'peserta')->get();
        $reports = $users->map(function($user) {
            return $this->computeFinalScore($user);
        });
        return response()->json(['reports' => $reports]);
    }

    private function computeFinalScore($user) {
        $responses = SurveyResponse::where('target_id', $user->id)
            ->join('survey_questions', 'survey_responses.question_id', '=', 'survey_questions.id')
            ->select('survey_responses.answer', 'survey_questions.category', 'survey_responses.period')
            ->get();
            
        $grouped = $responses->groupBy('period');
        $slotCount = $grouped->count() > 0 ? $grouped->count() : 1;
        
        $sumAfeSlots = 0;
        $sumPsiSlots = 0;
        
        foreach($grouped as $period => $resps) {
             $afeSum = $resps->where('category', 'afektif')->sum('answer');
             $afeCount = $resps->where('category', 'afektif')->count() ?: 1;
             $sumAfeSlots += ($afeSum / ($afeCount * 4)) * 100;
             
             $psiSum = $resps->where('category', 'psikomotorik')->sum('answer');
             $psiCount = $resps->where('category', 'psikomotorik')->count() ?: 1;
             $sumPsiSlots += ($psiSum / ($psiCount * 4)) * 100;
        }

        $manitoAfektif = $sumAfeSlots / $slotCount;
        $manitoPsiko = $sumPsiSlots / $slotCount;

        $currentDay = AppSetting::get('current_day', 1);
        $slotsPerDay = \App\Models\AttendanceSlot::count();
        $totalExpectedSlots = $slotsPerDay * $currentDay;
        
        $userAtt = Attendance::where('user_id', $user->id)->where('day', '<=', $currentDay)->count();
        $absensiScore = $totalExpectedSlots > 0 ? ($userAtt / $totalExpectedSlots) * 100 : 0;
        if ($absensiScore > 100) $absensiScore = 100;

        $gameAvg = GameScore::where('user_id', $user->id)->avg('score') ?? 0;
        $pracAvg = PracticeScore::where('user_id', $user->id)->avg('score') ?? 0;
        $kogAvg = CognitiveScore::where('user_id', $user->id)->avg('score') ?? 0;
        // Ibadah (Cumulative Sum, capped at 100)
        $worshipSum = WorshipLog::where('user_id', $user->id)->sum('score') ?? 0;
        $worshipFinal = $worshipSum > 100 ? 100 : $worshipSum;

        $afektifFinal = ($manitoAfektif * 0.5) + ($absensiScore * 0.5);
        $psikomotorikFinal = ($manitoPsiko * 0.4) + ($gameAvg * 0.3) + ($pracAvg * 0.3);

        $finalScore = ($afektifFinal * 0.35) + ($psikomotorikFinal * 0.35) + ($kogAvg * 0.20) + ($worshipFinal * 0.10);

        return [
            'id' => $user->id, 'name' => $user->name, 'instansi' => $user->asal_instansi,
            'afektif' => round($afektifFinal, 2), 'psiko' => round($psikomotorikFinal, 2),
            'kognitif' => round($kogAvg, 2), 'ibadah' => round($worshipFinal, 2), 'final' => round($finalScore, 2)
        ];
    }

    public function exportScores() {
        $users = User::where('role', 'peserta')->get();
        $handle = fopen('php://temp', 'w+');
        fputcsv($handle, ['ID', 'Nama', 'Instansi', 'Afektif', 'Psikomotorik', 'Kognitif', 'Ibadah', 'Final']);
        foreach ($users as $user) {
            $report = $this->computeFinalScore($user);
            fputcsv($handle, [$report['id'], $report['name'], $report['instansi'], $report['afektif'], $report['psiko'], $report['kognitif'], $report['ibadah'], $report['final']]);
        }
        rewind($handle);
        $content = stream_get_contents($handle);
        fclose($handle);
        return Response::make($content, 200, ['Content-Type' => 'text/csv', 'Content-Disposition' => "attachment; filename=laporan.csv"]);
    }

    public function progress() {
        $users = User::where('role', 'peserta')->get();
        $exams = Exam::select('id', 'title')->get();
        $surveySessions = SurveySlot::select('id', 'name as session_name', 'day')->get();

        $progress = $users->map(function($u) use ($exams, $surveySessions) {
            $examStatus = [];
            foreach($exams as $ex) {
                $examStatus[$ex->id] = DB::table('exam_submissions')->where('user_id', $u->id)->where('exam_id', $ex->id)->exists();
            }

            $surveyStatus = [];
            foreach($surveySessions as $ss) {
                $surveyStatus[$ss->id] = SurveyResponse::where('user_id', $u->id)->where('period', $ss->session_name)->exists();
            }

            $scores = $this->computeFinalScore($u);

            return [
                'id' => $u->id,
                'name' => $u->name,
                'instansi' => $u->asal_instansi,
                'exams' => $examStatus,
                'surveys' => $surveyStatus,
                'has_rtl' => DB::table('rtl_responses')->where('user_id', $u->id)->exists(),
                'scores' => $scores
            ];
        });

        return response()->json([
            'exams' => $exams,
            'surveys' => $surveySessions,
            'progress' => $progress
        ]);
    }

    public function fullReport() {
        $users = User::where('role', 'peserta')->get();
        $userIds = $users->pluck('id');
        
        // Bulk fetch all data
        $allExams = DB::table('exam_submissions')
            ->join('exams', 'exam_submissions.exam_id', '=', 'exams.id')
            ->whereIn('user_id', $userIds)
            ->select('exam_submissions.user_id', 'exams.title', 'exam_submissions.score', 'exam_submissions.created_at')
            ->get()->groupBy('user_id');

        $allSurveys = DB::table('survey_responses')
            ->join('survey_questions', 'survey_responses.question_id', '=', 'survey_questions.id')
            ->whereIn('target_id', $userIds)
            ->select('survey_responses.target_id as user_id', 'survey_responses.period', 'survey_questions.question_text', 'survey_responses.answer', 'survey_questions.category')
            ->get()->groupBy('user_id');
        
        $allGames = DB::table('game_scores')
            ->join('game_slots', 'game_scores.slot_id', '=', 'game_slots.id')
            ->whereIn('user_id', $userIds)
            ->select('game_scores.user_id', 'game_slots.name', 'game_scores.score', 'game_scores.notes')
            ->get()->groupBy('user_id');

        $allPractice = DB::table('practice_scores')
            ->join('practice_slots', 'practice_scores.slot_id', '=', 'practice_slots.id')
            ->whereIn('user_id', $userIds)
            ->select('practice_scores.user_id', 'practice_slots.name', 'practice_scores.score', 'practice_scores.notes')
            ->get()->groupBy('user_id');

        $allWorship = DB::table('worship_logs')
            ->join('worship_slots', 'worship_logs.slot_id', '=', 'worship_slots.id')
            ->whereIn('user_id', $userIds)
            ->select('worship_logs.user_id', 'worship_slots.name', 'worship_logs.score')
            ->get()->groupBy('user_id');

        $allAttendance = DB::table('attendances')
            ->join('attendance_slots', 'attendances.slot_id', '=', 'attendance_slots.id')
            ->whereIn('user_id', $userIds)
            ->select('attendances.user_id', 'attendance_slots.name', 'attendances.day', 'attendances.created_at')
            ->get()->groupBy('user_id');

        $detailedReports = $users->map(function($user) use ($allExams, $allSurveys, $allGames, $allPractice, $allWorship, $allAttendance) {
            $summary = $this->computeFinalScore($user);
            
            return [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'instansi' => $user->asal_instansi,
                    'nip' => $user->nip
                ],
                'summary' => $summary,
                'details' => [
                    'exams' => $allExams->get($user->id, []),
                    'surveys' => $allSurveys->get($user->id, []),
                    'games' => $allGames->get($user->id, []),
                    'practice' => $allPractice->get($user->id, []),
                    'worship' => $allWorship->get($user->id, []),
                    'attendance' => $allAttendance->get($user->id, [])
                ]
            ];
        });

        return response()->json($detailedReports);
    }
}
