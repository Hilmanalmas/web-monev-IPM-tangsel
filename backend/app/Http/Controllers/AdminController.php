<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Attendance;
use App\Models\Evaluation;
use App\Models\ManitoMapping;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use App\Models\Survey;
use App\Models\SurveyQuestion;
use App\Models\Exam;
use App\Models\ExamQuestion;
use App\Models\WorshipLog;

class AdminController extends Controller
{
    public function stats(Request $request)
    {
        $totalPeserta = User::where('role', 'peserta')->count();
        $totalAttendance = Attendance::whereDate('created_at', today())->count();
        $totalEvaluations = Evaluation::count();
        $totalManitoPairs = ManitoMapping::where('is_active', true)->count();

        return response()->json([
            'peserta' => $totalPeserta,
            'attendance_today' => $totalAttendance,
            'evaluations' => $totalEvaluations,
            'manito_pairs' => $totalManitoPairs
        ]);
    }

    public function users(Request $request) 
    {
        // Get all peserta with their assigned manito target
        // Get all users for management
        $users = User::select('id', 'name', 'username', 'role', 'nip', 'asal_instansi')
            ->get();
            
        $mappings = ManitoMapping::where('is_active', true)->with('target')->get()->keyBy('assessor_id');

        $result = $users->map(function($user) use ($mappings) {
            $target = $mappings->has($user->id) ? $mappings[$user->id]->target : null;
            return [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'role' => $user->role,
                'nip' => $user->nip,
                'instansi' => $user->asal_instansi,
                'target_name' => $target ? $target->name : ($user->role === 'peserta' ? 'Belum Ada Target' : '-'),
                'target_id' => $target ? $target->id : null,
            ];
        });

        return response()->json(['users' => $result]);
    }

    public function exportScores(Request $request)
    {
        $users = User::where('role', 'peserta')->get();

        $evaluations = Evaluation::all()->groupBy('target_id');
        $cognitive = \App\Models\CognitiveScore::all()->keyBy('user_id');
        $ibadahs = \App\Models\WorshipLog::all()->groupBy('user_id');

        $csvData = [];
        $csvData[] = ['Nama Pasukan', 'Instansi', 'Kognitif (40%)', 'Psikomotorik (40%)', 'Afektif (20%)', 'Penalti', 'Bonus Ibadah', 'SKOR AKHIR'];

        foreach ($users as $user) {
            $kog = $cognitive->has($user->id) ? $cognitive[$user->id]->score : 0;
            
            $userEvals = $evaluations->has($user->id) ? $evaluations[$user->id] : collect();
            $psi = 0;
            $afe = 0;
            if ($userEvals->count() > 0) {
                // Sum scores and normalize to 100 based on Max 5 per item
                $sumPsi = $userEvals->sum(fn($e) => $e->psychomotor_precision + $e->psychomotor_efficiency + $e->psychomotor_independence + $e->psychomotor_quality);
                $psi = ($sumPsi / ($userEvals->count() * 20)) * 100;

                $sumAfe = $userEvals->sum(fn($e) => $e->affective_initiative + $e->affective_resilience + $e->affective_ethics + $e->affective_collaboration);
                $afe = ($sumAfe / ($userEvals->count() * 20)) * 100;
            }

            $userIbadah = $ibadahs->has($user->id) ? $ibadahs[$user->id] : collect();
            $bonus = $userIbadah->sum('bonus_points');
            $penalty = 0; 
            
            $final = (0.4 * $kog) + (0.4 * $psi) + (0.2 * $afe) - $penalty + $bonus;

            $csvData[] = [
                $user->name,
                $user->asal_instansi,
                round($kog, 2),
                round($psi, 2),
                round($afe, 2),
                $penalty,
                $bonus,
                round($final, 2)
            ];
        }

        $filename = "Rekap_Nilai_Pelajar_Anggrek_" . date('Ymd_His') . ".csv";
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

    public function storeUser(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string',
            'username' => 'required|string|unique:users',
            'password' => 'required|string',
            'role' => 'required|in:admin,observer,peserta',
            'nip' => 'nullable|string',
            'asal_instansi' => 'nullable|string'
        ]);

        $data['password'] = \Illuminate\Support\Facades\Hash::make($data['password']);
        $user = User::create($data);

        return response()->json(['message' => 'User created successfully', 'user' => $user], 201);
    }

    public function destroyUser($id)
    {
        $user = User::findOrFail($id);
        $user->delete();
        return response()->json(['message' => 'User deleted successfully']);
    }

    // --- Survey Management ---
    public function listSurveys() { return response()->json(Survey::with('questions')->get()); }
    
    public function storeSurvey(Request $request) {
        $data = $request->validate(['title' => 'required', 'description' => 'nullable']);
        return response()->json(Survey::create($data));
    }

    public function storeQuestion(Request $request, $surveyId) {
        $data = $request->validate([
            'question_text' => 'required',
            'type' => 'required|in:text,rating,multiple_choice',
            'options' => 'nullable|array'
        ]);
        $data['survey_id'] = $surveyId;
        return response()->json(SurveyQuestion::create($data));
    }

    // --- Exam Management ---
    public function listExams() { return response()->json(Exam::with('questions')->get()); }

    public function storeExam(Request $request) {
        $data = $request->validate([
            'title' => 'required',
            'description' => 'nullable',
            'start_time' => 'required|date',
            'end_time' => 'required|date',
            'duration_minutes' => 'required|integer'
        ]);
        return response()->json(Exam::create($data));
    }

    public function storeExamQuestion(Request $request, $examId) {
        $data = $request->validate([
            'question_text' => 'required',
            'options' => 'required|array',
            'correct_answer' => 'required|string',
            'points' => 'integer'
        ]);
        $data['exam_id'] = $examId;
        return response()->json(ExamQuestion::create($data));
    }

    // --- Observer Ibadah Reporting ---
    public function observerIbadah() {
        $observers = User::where('role', 'observer')->get();
        $logs = WorshipLog::whereIn('user_id', $observers->pluck('id'))->with('user')->get();
        return response()->json(['logs' => $logs]);
    }
}
