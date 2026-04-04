<?php
namespace App\Http\Controllers;

use App\Models\User;
use App\Models\ExamSubmission;
use App\Models\CognitiveScore;
use App\Models\GameScore;
use App\Models\PracticeScore;
use App\Models\WorshipLog;
use App\Models\SurveyResponse;
use App\Models\SurveyQuestion;
use App\Models\Exam;
use App\Models\ExamQuestion;
use App\Services\SpreadsheetService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminSpreadsheetController extends Controller {
    
    public function syncAll() {
        try {
            $count = 0;

            // 1. Sync Exams (Hasil Ujian)
            $submissions = DB::table('exam_submissions')
                ->join('users', 'exam_submissions.user_id', '=', 'users.id')
                ->join('exams', 'exam_submissions.exam_id', '=', 'exams.id')
                ->select('exam_submissions.*', 'users.name', 'users.nip', 'users.asal_instansi', 'exams.title as exam_name')
                ->get();

            foreach ($submissions as $s) {
                SpreadsheetService::postScore([
                    'name'     => $s->name,
                    'nip'      => $s->nip,
                    'instansi' => $s->asal_instansi,
                    'category' => 'UJIAN (AUTO)',
                    'title'    => $s->exam_name,
                    'score'    => $s->score,
                    'day'      => $s->day,
                    'notes'    => 'SINKRONISASI RIWAYAT - ' . $s->submitted_at
                ]);
                $count++;
            }

            // 2. Sync Cognitive Scores (Manual)
            $cogScores = DB::table('cognitive_scores')
                ->join('users', 'cognitive_scores.user_id', '=', 'users.id')
                ->select('cognitive_scores.*', 'users.name', 'users.nip', 'users.asal_instansi')
                ->get();

            foreach ($cogScores as $cs) {
                if ($cs->exam_submission_id) continue; // Skip if already covered by submissions
                SpreadsheetService::postScore([
                    'name'     => $cs->name,
                    'nip'      => $cs->nip,
                    'instansi' => $cs->asal_instansi,
                    'category' => 'KOGNITIF (MANUAL)',
                    'title'    => $cs->notes ?: 'Riwayat Manual',
                    'score'    => $cs->score,
                    'day'      => $cs->day,
                    'notes'    => 'SINKRONISASI RIWAYAT'
                ]);
                $count++;
            }

            // 3. Sync Games, Practice, Worship
            $categories = [
                ['table' => 'game_scores', 'label' => 'GAMES', 'slot_table' => 'game_slots'],
                ['table' => 'practice_scores', 'label' => 'PRAKTEK', 'slot_table' => 'practice_slots'],
                ['table' => 'worship_logs', 'label' => 'IBADAH', 'slot_table' => 'worship_slots'],
            ];

            foreach ($categories as $cat) {
                $scores = DB::table($cat['table'])
                    ->join('users', $cat['table'].'.user_id', '=', 'users.id')
                    ->join($cat['slot_table'], $cat['table'].'.slot_id', '=', $cat['slot_table'].'.id')
                    ->select($cat['table'].'.*', 'users.name', 'users.nip', 'users.asal_instansi', $cat['slot_table'].'.name as slot_name')
                    ->get();

                foreach ($scores as $sc) {
                    SpreadsheetService::postScore([
                        'name'     => $sc->name,
                        'nip'      => $sc->nip,
                        'instansi' => $sc->asal_instansi,
                        'category' => $cat['label'],
                        'title'    => $sc->slot_name,
                        'score'    => $sc->score,
                        'day'      => $sc->day,
                        'notes'    => $sc->notes ?: 'SINKRONISASI RIWAYAT'
                    ]);
                    $count++;
                }
            }

            // 4. Sync Manito (Riwayat Penilaian)
            $manitoResponses = DB::table('survey_responses')
                ->join('users as giver', 'survey_responses.user_id', '=', 'giver.id')
                ->join('users as target', 'survey_responses.target_id', '=', 'target.id')
                ->select(
                    'giver.name as giver_name', 'giver.nip', 'giver.asal_instansi',
                    'target.name as target_name',
                    'period', 'day',
                    DB::raw('AVG(answer) as avg_score')
                )
                ->groupBy('survey_responses.user_id', 'target_id', 'period', 'day')
                ->get();

            foreach ($manitoResponses as $mr) {
                SpreadsheetService::postScore([
                    'name'     => $mr->giver_name,
                    'nip'      => $mr->nip,
                    'instansi' => $mr->asal_instansi,
                    'category' => 'MANITO',
                    'title'    => 'Survey ' . $mr->period,
                    'score'    => number_format($mr->avg_score, 2),
                    'day'      => $mr->day,
                    'notes'    => 'MENILAI: ' . $mr->target_name
                ]);
                $count++;
            }

            // 5. Sync Attendance (Presensi)
            $attendance = DB::table('attendances')
                ->join('users', 'attendances.user_id', '=', 'users.id')
                ->join('attendance_slots', 'attendances.slot_id', '=', 'attendance_slots.id')
                ->select('attendances.*', 'users.name', 'users.nip', 'users.asal_instansi', 'attendance_slots.name as slot_name')
                ->get();

            foreach ($attendance as $at) {
                SpreadsheetService::postScore([
                    'name'     => $at->name,
                    'nip'      => $at->nip,
                    'instansi' => $at->asal_instansi,
                    'category' => 'PRESENSI',
                    'title'    => $at->slot_name,
                    'score'    => 100,
                    'day'      => $at->day,
                    'notes'    => 'STATUS: HADIR'
                ]);
                $count++;
            }

            // 6. Sync RTL (Rencana Tindak Lanjut)
            $rtl = DB::table('rtl_responses')
                ->join('users', 'rtl_responses.user_id', '=', 'users.id')
                ->join('rtl_questions', 'rtl_responses.question_id', '=', 'rtl_questions.id')
                ->select('rtl_responses.*', 'users.name', 'users.nip', 'users.asal_instansi', 'rtl_questions.question_text')
                ->get();

            foreach ($rtl as $r) {
                SpreadsheetService::postScore([
                    'name'     => $r->name,
                    'nip'      => $r->nip,
                    'instansi' => $r->asal_instansi,
                    'category' => 'RTL',
                    'title'    => 'Respon RTL',
                    'score'    => '-',
                    'day'      => '-',
                    'notes'    => $r->question_text . ': ' . $r->answer
                ]);
                $count++;
            }

            // 7. Backup SOAL EXAM & SURVEY
            $exams = Exam::with('questions')->get();
            foreach ($exams as $ex) {
                foreach ($ex->questions as $q) {
                    SpreadsheetService::postScore([
                        'name'     => 'BACKUP SOAL EXAM',
                        'nip'      => '-',
                        'instansi' => 'SISTEM',
                        'category' => 'LOG SOAL',
                        'title'    => $ex->title,
                        'score'    => '-',
                        'day'      => $ex->day,
                        'notes'    => $q->question_text . ' (Kunci: ' . $q->correct_answer . ')'
                    ]);
                    $count++;
                }
            }

            $surveyQuestions = SurveyQuestion::all();
            foreach ($surveyQuestions as $sq) {
                SpreadsheetService::postScore([
                    'name'     => 'BACKUP SOAL SURVEY',
                    'nip'      => '-',
                    'instansi' => 'SISTEM',
                    'category' => 'LOG SOAL',
                    'title'    => 'Manito Question',
                    'score'    => '-',
                    'day'      => $sq->day,
                    'notes'    => $sq->question_text
                ]);
                $count++;
            }

            // 8. Sync Nilai Akhir (Calculated)
            $users = User::where('role', 'peserta')->get();
            foreach ($users as $user) {
                $final = $this->computeFinalScore($user);
                SpreadsheetService::postScore([
                    'name'     => $user->name,
                    'nip'      => $user->nip,
                    'instansi' => $user->asal_instansi,
                    'score'    => $final['final'],
                ], 'Nilai_Akhir');
            }

            return response()->json(['message' => 'Sukses mendorong ' . $count . ' log & ' . $users->count() . ' nilai akhir ke Spreadsheet!']);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    private function computeFinalScore($user) {
        // Logika Persentase Sesuai Sistem:
        // Afektif 35% | Psikomotorik 35% | Kognitif 20% | Ibadah 10%
        
        $manitoAfektif = DB::table('survey_responses')
            ->join('survey_questions', 'survey_responses.question_id', '=', 'survey_questions.id')
            ->where('target_id', $user->id)
            ->where('survey_questions.category', 'afektif')
            ->avg('answer') ?: 0;
        $manitoAfektif = ($manitoAfektif / 4) * 100;

        $manitoPsiko = DB::table('survey_responses')
            ->join('survey_questions', 'survey_responses.question_id', '=', 'survey_questions.id')
            ->where('target_id', $user->id)
            ->where('survey_questions.category', 'psikomotorik')
            ->avg('answer') ?: 0;
        $manitoPsiko = ($manitoPsiko / 4) * 100;

        // Absensi
        $currentDay = \App\Models\AppSetting::get('current_day', 1);
        $totalExpected = \App\Models\AttendanceSlot::count() ?: 1;
        $userAtt = \App\Models\Attendance::where('user_id', $user->id)->count();
        $absensiScore = ($userAtt / $totalExpected) * 100;

        // Scores
        $gameAvg = \App\Models\GameScore::where('user_id', $user->id)->avg('score') ?? 0;
        $pracAvg = \App\Models\PracticeScore::where('user_id', $user->id)->avg('score') ?? 0;
        $kogAvg  = \App\Models\CognitiveScore::where('user_id', $user->id)->avg('score') ?? 0;
        $worshipAvg = \App\Models\WorshipLog::where('user_id', $user->id)->avg('score') ?? 0;

        // Composites
        $afektifFinal = ($manitoAfektif * 0.5) + ($absensiScore * 0.5);
        $psikomotorikFinal = ($manitoPsiko * 0.4) + ($gameAvg * 0.3) + ($pracAvg * 0.3);

        $finalScore = ($afektifFinal * 0.35) + ($psikomotorikFinal * 0.35) + ($kogAvg * 0.20) + ($worshipAvg * 0.10);

        return ['final' => round($finalScore, 2)];
    }
}
