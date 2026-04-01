<?php
namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Attendance;
use App\Models\CognitiveScore;
use App\Models\GameScore;
use App\Models\PracticeScore;
use App\Models\WorshipSlot;
use App\Models\WorshipLog;
use App\Models\ExamSubmission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

use App\Models\RtlResponse;
use Illuminate\Support\Facades\Storage;

class ObserverController extends Controller {
    public function getPesertaList() {
        $peserta = User::where('role', 'peserta')->get()->map(function($p) {
            $firstAttendance = Attendance::where('user_id', $p->id)->orderBy('recorded_at', 'asc')->first();
            return [
                'id' => $p->id,
                'name' => $p->name,
                'nip' => $p->nip,
                'instansi' => $p->asal_instansi,
                'first_selfie' => $firstAttendance ? url(Storage::url($firstAttendance->selfie_url)) : null
            ];
        });
        return response()->json(['peserta' => $peserta]);
    }

    public function getPesertaAttendance($id) {
        $attendances = Attendance::where('user_id', $id)->with('slot')->orderBy('recorded_at', 'asc')->get()->map(function($att) {
            $att->selfie_url = url(Storage::url($att->selfie_url));
            $att->type = 'Absensi';
            return $att;
        });
        
        $rtlRes = RtlResponse::where('user_id', $id)->whereNotNull('selfie_url')->first();
        if ($rtlRes) {
            $attendances->push([
                'id' => 'rtl-' . $rtlRes->id,
                'selfie_url' => $rtlRes->selfie_url, // Base64
                'type' => 'RTL',
                'recorded_at' => $rtlRes->created_at,
                'slot' => ['name' => 'Penilaian RTL']
            ]);
        }

        return response()->json(['attendances' => $attendances]);
    }

    public function getPesertaExams($id) {
        $submissions = ExamSubmission::where('user_id', $id)->with('exam', 'answers.question')->get();
        $scores = CognitiveScore::where('user_id', $id)->get()->keyBy('exam_submission_id');
        
        $mapped = $submissions->map(function($sub) use ($scores) {
            return [
                'submission_id' => $sub->id,
                'exam_title' => $sub->exam->title,
                'submitted_at' => $sub->submitted_at,
                'answers' => $sub->answers,
                'observer_score' => $scores->has($sub->id) ? $scores[$sub->id]->score : null
            ];
        });
        return response()->json(['exams' => $mapped]);
    }

    public function storeCognitiveScore(Request $request) {
        $data = $request->validate([
            'user_id' => 'required',
            'exam_submission_id' => 'required',
            'score' => 'required|integer|min:0|max:100'
        ]);

        $score = CognitiveScore::updateOrCreate(
            ['user_id' => $data['user_id'], 'exam_submission_id' => $data['exam_submission_id']],
            ['observer_id' => Auth::id(), 'score' => $data['score']]
        );
        return response()->json($score);
    }

    public function getGamesPractice($id) {
        $games = GameScore::where('user_id', $id)->get();
        $practice = PracticeScore::where('user_id', $id)->get();
        $ibadah = WorshipLog::where('user_id', $id)->get();
        return response()->json(['games' => $games, 'practice' => $practice, 'ibadah' => $ibadah]);
    }

    public function storeGameScore(Request $request) {
        $data = $request->validate([
            'user_id' => 'required',
            'score' => 'required|integer|min:0|max:100',
            'notes' => 'required|string'
        ]);
        $score = GameScore::updateOrCreate(
            ['user_id' => $data['user_id'], 'notes' => $data['notes']],
            ['observer_id' => Auth::id(), 'score' => $data['score']]
        );
        return response()->json($score);
    }

    public function storePracticeScore(Request $request) {
        $data = $request->validate([
            'user_id' => 'required',
            'score' => 'required|integer|min:0|max:100',
            'notes' => 'required|string'
        ]);
        $score = PracticeScore::updateOrCreate(
            ['user_id' => $data['user_id'], 'notes' => $data['notes']],
            ['observer_id' => Auth::id(), 'score' => $data['score']]
        );
        return response()->json($score);
    }

    public function getWorshipSlots() {
        return response()->json([]); // No longer used as requested
    }

    public function storeWorshipScore(Request $request) {
        $data = $request->validate([
            'user_id' => 'required',
            'score' => 'required|integer|min:0|max:100',
            'notes' => 'required|string'
        ]);
        $score = WorshipLog::updateOrCreate(
            ['user_id' => $data['user_id'], 'notes' => $data['notes']],
            ['observer_id' => Auth::id(), 'score' => $data['score']]
        );
        return response()->json($score);
    }
}
