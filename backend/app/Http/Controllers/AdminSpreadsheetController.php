<?php
namespace App\Http\Controllers;

use App\Models\Exam;
use App\Models\SurveyQuestion;
use App\Models\User;
use App\Models\Attendance;
use App\Models\AttendanceSlot;
use App\Services\SpreadsheetService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminSpreadsheetController extends Controller
{
    public function syncAll()
    {
        try {
            // --- 0. BERSIHKAN SEMUA TAB TERLEBIH DAHULU ---
            SpreadsheetService::clearAll();

            $batchSize = 50; 
            $count = 0;

            // --- 1. PROSES INPUT_NILAI (Skor Per Sesi) ---
            $inputNilaiData = [];

            $examSubmissions = DB::table('exam_submissions')
                ->join('users', 'exam_submissions.user_id', '=', 'users.id')
                ->join('exams', 'exam_submissions.exam_id', '=', 'exams.id')
                ->select('exam_submissions.*', 'users.name', 'users.nip', 'users.asal_instansi', 'exams.title')
                ->get();
            foreach ($examSubmissions as $es) {
                $inputNilaiData[] = [
                    'name' => $es->name, 'nip' => $es->nip, 'instansi' => $es->asal_instansi,
                    'category' => 'EXAM', 'title' => $es->title, 'score' => $es->score, 'day' => $es->day, 'notes' => '-'
                ];
            }

            $cogScores = DB::table('cognitive_scores')
                ->join('users', 'cognitive_scores.user_id', '=', 'users.id')
                ->select('cognitive_scores.*', 'users.name', 'users.nip', 'users.asal_instansi')
                ->get();
            foreach ($cogScores as $cs) {
                $inputNilaiData[] = [
                    'name' => $cs->name, 'nip' => $cs->nip, 'instansi' => $cs->asal_instansi,
                    'category' => 'KOGNITIF (MANUAL)', 'title' => 'Input Manual', 'score' => $cs->score, 'day' => '-', 'notes' => $cs->notes
                ];
            }

            $gameScores = DB::table('game_scores')
                ->join('users', 'game_scores.user_id', '=', 'users.id')
                ->join('game_slots', 'game_scores.slot_id', '=', 'game_slots.id')
                ->select('game_scores.*', 'users.name', 'users.nip', 'users.asal_instansi', 'game_slots.name as slot_name')
                ->get();
            foreach ($gameScores as $gs) {
                $inputNilaiData[] = [
                    'name' => $gs->name, 'nip' => $gs->nip, 'instansi' => $gs->asal_instansi,
                    'category' => 'GAMES', 'title' => $gs->slot_name, 'score' => $gs->score, 'day' => '-', 'notes' => '-'
                ];
            }

            $pracScores = DB::table('practice_scores')
                ->join('users', 'practice_scores.user_id', '=', 'users.id')
                ->join('practice_slots', 'practice_scores.slot_id', '=', 'practice_slots.id')
                ->select('practice_scores.*', 'users.name', 'users.nip', 'users.asal_instansi', 'practice_slots.name as slot_name')
                ->get();
            foreach ($pracScores as $ps) {
                $inputNilaiData[] = [
                    'name' => $ps->name, 'nip' => $ps->nip, 'instansi' => $ps->asal_instansi,
                    'category' => 'PRAKTEK', 'title' => $ps->slot_name, 'score' => $ps->score, 'day' => '-', 'notes' => '-'
                ];
            }

            $worship = DB::table('worship_logs')
                ->join('users', 'worship_logs.user_id', '=', 'users.id')
                ->select('worship_logs.*', 'users.name', 'users.nip', 'users.asal_instansi')
                ->get();
            foreach ($worship as $ws) {
                $inputNilaiData[] = [
                    'name' => $ws->name, 'nip' => $ws->nip, 'instansi' => $ws->asal_instansi,
                    'category' => 'IBADAH', 'title' => $ws->activity_type, 'score' => $ws->score, 'day' => $ws->day, 'notes' => '-'
                ];
            }

            $attendance = DB::table('attendances')
                ->join('users', 'attendances.user_id', '=', 'users.id')
                ->join('attendance_slots', 'attendances.slot_id', '=', 'attendance_slots.id')
                ->select('attendances.day', 'users.name', 'users.nip', 'users.asal_instansi', 'attendance_slots.name as slot_name')
                ->get();
            foreach ($attendance as $at) {
                $inputNilaiData[] = [
                    'name' => $at->name, 'nip' => $at->nip, 'instansi' => $at->asal_instansi,
                    'category' => 'PRESENSI', 'title' => $at->slot_name, 'score' => 100, 'day' => $at->day, 'notes' => 'STATUS: HADIR'
                ];
            }

            $chunks = array_chunk($inputNilaiData, $batchSize);
            foreach ($chunks as $chunk) {
                SpreadsheetService::postBatch($chunk, 'Input_Nilai');
                $count += count($chunk);
            }

            // --- 2. PROSES ARSIP_JAWABAN_DETAIL (Batch) ---
            $detailData = [];

            // Raw Exam Answers
            $rawAnswers = DB::table('exam_answers')
                ->join('exam_submissions', 'exam_answers.submission_id', '=', 'exam_submissions.id')
                ->join('users', 'exam_submissions.user_id', '=', 'users.id')
                ->join('exam_questions', 'exam_answers.question_id', '=', 'exam_questions.id')
                ->select('users.name', 'exam_answers.user_answer', 'exam_answers.is_correct', 'exam_questions.question_text')
                ->get();
            foreach ($rawAnswers as $ra) {
                $detailData[] = [
                    'name' => $ra->name, 'category' => 'RAW EXAM', 'title' => $ra->question_text,
                    'notes' => $ra->user_answer, 'score' => $ra->is_correct ? 'BENAR' : 'SALAH'
                ];
            }

            // Raw Manito Responses
            $rawManito = DB::table('survey_responses')
                ->join('users as evaluators', 'survey_responses.user_id', '=', 'evaluators.id')
                ->join('users as targets', 'survey_responses.target_id', '=', 'targets.id')
                ->join('survey_questions', 'survey_responses.question_id', '=', 'survey_questions.id')
                ->select('evaluators.name as evaluator_name', 'targets.name as target_name', 'survey_questions.question_text', 'survey_responses.answer')
                ->get();
            foreach ($rawManito as $rm) {
                $detailData[] = [
                    'name' => $rm->evaluator_name, 'category' => 'RAW MANITO', 'title' => 'Menilai: ' . $rm->target_name,
                    'notes' => $rm->question_text, 'score' => $rm->answer
                ];
            }

            // Raw RTL
            $rtl = DB::table('rtl_responses')
                ->join('users', 'rtl_responses.user_id', '=', 'users.id')
                ->join('rtl_questions', 'rtl_responses.question_id', '=', 'rtl_questions.id')
                ->select('users.name', 'rtl_questions.question_text', 'rtl_responses.answer')
                ->get();
            foreach ($rtl as $r) {
                $detailData[] = [
                    'name' => $r->name, 'category' => 'RAW RTL', 'title' => 'Respon RTL',
                    'notes' => $r->question_text, 'score' => $r->answer
                ];
            }

            $detailChunks = array_chunk($detailData, $batchSize);
            foreach ($detailChunks as $dChunk) {
                SpreadsheetService::postBatch($dChunk, 'Arsip_Jawaban_Detail');
                $count += count($dChunk);
            }

            // --- 3. PROSES MASTER_SOAL (Backup Soal) ---
            $soalData = [];
            $exams = Exam::with('questions')->get();
            foreach ($exams as $ex) {
                foreach ($ex->questions as $q) {
                    $soalData[] = [
                        'category' => 'SOAL EXAM', 'title' => $ex->title, 'day' => $ex->day, 'notes' => $q->question_text . ' (Kunci: ' . $q->correct_answer . ')',
                        'name' => '-', 'nip' => '-', 'instansi' => '-', 'score' => '-'
                    ];
                }
            }
            $surveyQuestions = SurveyQuestion::all();
            foreach ($surveyQuestions as $sq) {
                $soalData[] = [
                    'category' => 'SOAL SURVEY', 'title' => 'Manito', 'day' => $sq->day, 'notes' => $sq->question_text,
                    'name' => '-', 'nip' => '-', 'instansi' => '-', 'score' => '-'
                ];
            }
            SpreadsheetService::postBatch($soalData, 'Master_Soal');
            $count += count($soalData);

            // --- 4. PROSES REKAP_NILAI_AKHIR (Summary) ---
            $rekapData = [];
            $users = User::where('role', 'peserta')->get();
            foreach ($users as $user) {
                $final = $this->computeFinalScore($user);
                $rekapData[] = [
                    'name' => $user->name, 'nip' => $user->nip, 'instansi' => $user->asal_instansi,
                    'score' => $final['final']
                ];
            }
            SpreadsheetService::postBatch($rekapData, 'Rekap_Nilai_Akhir');

            return response()->json([
                'message' => 'Sukses mendorong ' . $count . ' data!',
                'breakdown' => [
                    'skor_sesi' => count($inputNilaiData),
                    'arsip_detail' => count($detailData),
                    'backup_soal' => count($soalData),
                    'rekap_final' => count($rekapData)
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    private function computeFinalScore($user) {
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

        $totalExpected = \App\Models\AttendanceSlot::count() ?: 1;
        $userAtt = \App\Models\Attendance::where('user_id', $user->id)->count();
        $absensiScore = ($userAtt / $totalExpected) * 100;

        $gameAvg = \App\Models\GameScore::where('user_id', $user->id)->avg('score') ?? 0;
        $pracAvg = \App\Models\PracticeScore::where('user_id', $user->id)->avg('score') ?? 0;
        $kogAvg  = \App\Models\CognitiveScore::where('user_id', $user->id)->avg('score') ?? 0;
        $worshipAvg = \App\Models\WorshipLog::where('user_id', $user->id)->avg('score') ?? 0;

        $afektifFinal = ($manitoAfektif * 0.5) + ($absensiScore * 0.5);
        $psikomotorikFinal = ($manitoPsiko * 0.4) + ($gameAvg * 0.3) + ($pracAvg * 0.3);

        $finalScore = ($afektifFinal * 0.35) + ($psikomotorikFinal * 0.35) + ($kogAvg * 0.20) + ($worshipAvg * 0.10);

        return ['final' => round($finalScore, 2)];
    }
}
