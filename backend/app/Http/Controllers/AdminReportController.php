<?php
namespace App\Http\Controllers;

use App\Models\User;
use App\Models\SurveyResponse;
use App\Models\CognitiveScore;
use App\Models\WorshipLog;
use App\Models\Attendance;
use App\Models\GameScore;
use App\Models\PracticeScore;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;

class AdminReportController extends Controller {
    public function index() {
        $users = User::where('role', 'peserta')->get();
        // Since weighing requires gathering all scores, we compute it here dynamically.
        $reports = $users->map(function($user) {
            return $this->computeFinalScore($user);
        });
        return response()->json(['reports' => $reports]);
    }

    private function computeFinalScore($user) {
        // Afektif 35% : Manito Afektif + Absensi
        // Psikomotorik 35%: Manito Psikomotorik + Games + Praktek
        // Kognitif 20%: CognitiveScore
        // Ibadah 10%: WorshipLog
        
        // 1. Manito Afektif & Psikomotorik via SurveyResponse
        $responses = SurveyResponse::where('target_id', $user->id)
            ->join('survey_questions', 'survey_responses.question_id', '=', 'survey_questions.id')
            ->select('survey_responses.answer', 'survey_questions.category', 'survey_responses.period')
            ->get();
            
        // Group by period (slot) to average per slot
        $grouped = $responses->groupBy('period');
        $slotCount = $grouped->count() > 0 ? $grouped->count() : 1;
        
        $sumAfeSlots = 0;
        $sumPsiSlots = 0;
        
        foreach($grouped as $period => $resps) {
             // sum answers per slot for specific categories
             $afeSum = $resps->where('category', 'afektif')->sum('answer');
             $afeCount = $resps->where('category', 'afektif')->count() ?: 1;
             $sumAfeSlots += ($afeSum / ($afeCount * 4)) * 100; // normalized per slot
             
             $psiSum = $resps->where('category', 'psikomotorik')->sum('answer');
             $psiCount = $resps->where('category', 'psikomotorik')->count() ?: 1;
             $sumPsiSlots += ($psiSum / ($psiCount * 4)) * 100; // normalized per slot
        }

        $manitoAfektif = $sumAfeSlots / $slotCount;
        $manitoPsiko = $sumPsiSlots / $slotCount;

        // Absensi (assuming 100 if present all slots? We just use count for now or manual mapping, 
        // Let's assume absolute count vs total slots)
        $totalSlots = \App\Models\AttendanceSlot::count();
        $userAtt = Attendance::where('user_id', $user->id)->count();
        $absensiScore = $totalSlots > 0 ? ($userAtt / $totalSlots) * 100 : 0;

        // Games & Practice
        $gameAvg = GameScore::where('user_id', $user->id)->avg('score') ?? 0;
        $pracAvg = PracticeScore::where('user_id', $user->id)->avg('score') ?? 0;

        // Kognitif
        $kogAvg = CognitiveScore::where('user_id', $user->id)->avg('score') ?? 0;

        // Ibadah
        $worshipAvg = WorshipLog::where('user_id', $user->id)->avg('score') ?? 0;

        // Composites
        $afektifFinal = ($manitoAfektif * 0.5) + ($absensiScore * 0.5);
        $psikomotorikFinal = ($manitoPsiko * 0.4) + ($gameAvg * 0.3) + ($pracAvg * 0.3);

        $finalScore = ($afektifFinal * 0.35) + ($psikomotorikFinal * 0.35) + ($kogAvg * 0.20) + ($worshipAvg * 0.10);

        return [
            'id' => $user->id,
            'name' => $user->name,
            'instansi' => $user->asal_instansi,
            'afektif' => round($afektifFinal, 2),
            'psiko' => round($psikomotorikFinal, 2),
            'kognitif' => round($kogAvg, 2),
            'ibadah' => round($worshipAvg, 2),
            'final' => round($finalScore, 2)
        ];
    }

    public function exportScores() {
        $users = User::where('role', 'peserta')->get();
        $csvData = [];
        $csvData[] = ['Nama Pasukan', 'Instansi', 'Afektif (35%)', 'Psikomotorik (35%)', 'Kognitif (20%)', 'Ibadah (10%)', 'SKOR AKHIR'];

        foreach ($users as $user) {
            $rep = $this->computeFinalScore($user);
            $csvData[] = [
                $rep['name'],
                $rep['instansi'],
                $rep['afektif'],
                $rep['psiko'],
                $rep['kognitif'],
                $rep['ibadah'],
                $rep['final']
            ];
        }

        $filename = "Rekap_Nilai_Pelajar_Angker_" . date('Ymd_His') . ".csv";
        $handle = fopen('php://temp', 'r+');
        foreach ($csvData as $row) {
            fputcsv($handle, $row);
        }
        rewind($handle);
        $content = stream_get_contents($handle);
        fclose($handle);

        return Response::make($content, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename={$filename}",
        ]);
    }
}
