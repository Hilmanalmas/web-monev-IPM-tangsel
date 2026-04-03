<?php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/login', [\App\Http\Controllers\AuthController::class, 'login']);

// Public selfie endpoint — no auth required, uses query param to avoid Nginx static-file intercept
Route::get('/media', function (\Illuminate\Http\Request $request) {
    $path = $request->query('path', '');
    // Security: only allow files within selfies/ directory, block traversal
    if (!$path || !str_starts_with($path, 'selfies/') || str_contains($path, '..')) {
        abort(403, 'Access denied');
    }
    $fullPath = storage_path('app/public/' . $path);
    if (!file_exists($fullPath)) {
        abort(404, 'File not found');
    }
    $mimeType = mime_content_type($fullPath) ?: 'image/jpeg';
    return response()->file($fullPath, [
        'Content-Type' => $mimeType,
        'Cache-Control' => 'public, max-age=86400',
    ]);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [\App\Http\Controllers\AuthController::class, 'me']);
    Route::post('/logout', [\App\Http\Controllers\AuthController::class, 'logout']);

    // --- PESERTA ROUTES ---
    Route::get('/peserta/dashboard', [\App\Http\Controllers\PesertaController::class, 'dashboard']);
    Route::get('/manito/target', function (Request $request) {
        try {
            $user = $request->user();
            if (!$user) return response()->json(['error' => 'Unauthorized'], 401);

            // Cek apakah tabel app_settings ada dan ada nilainya
            $day = 1;
            try {
                $day = \Illuminate\Support\Facades\DB::table('app_settings')
                    ->where('key', 'current_day')
                    ->value('value') ?: 1;
            } catch (\Exception $e) {
                // Biarkan day = 1 jika tabel app_settings belum siap
            }

            // Cek Mapping
            $mapping = \Illuminate\Support\Facades\DB::table('manito_mappings')
                ->where('assessor_id', $user->id)
                ->where('day', $day)
                ->where('is_active', 1)
                ->first();

            if (!$mapping) {
                return response()->json([
                    'message' => 'Target Manito belum ada untuk Hari ' . $day,
                    'debug' => ['user_id' => $user->id, 'day' => $day]
                ], 404);
            }

            // Ambil Detail Target
            $target = \Illuminate\Support\Facades\DB::table('users')
                ->where('id', $mapping->target_id)
                ->select('id', 'name', 'nip', 'asal_instansi')
                ->first();

            if (!$target) {
                // Fallback jika user target terhapus tapi mapping masih ada
                $target = (object)[
                    'id' => $mapping->target_id,
                    'name' => 'Peserta ' . $mapping->target_id,
                    'nip' => '-',
                    'asal_instansi' => 'Peserta'
                ];
            }

            return response()->json(['target' => $target], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Gagal sistem Manito',
                'details' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ], 500);
        }
    });
    
    // Attendance
    Route::get('/attendance/slots', [\App\Http\Controllers\AttendanceController::class, 'availableSlots']);
    Route::post('/attendance', [\App\Http\Controllers\AttendanceController::class, 'store']);
    Route::get('/attendance', [\App\Http\Controllers\AttendanceController::class, 'index']); // History

    // Manito Master (Survey)
    Route::get('/surveys/status', [\App\Http\Controllers\ResponseController::class, 'checkStatus']);
    Route::get('/surveys/questions', [\App\Http\Controllers\ResponseController::class, 'activeQuestions']);
    Route::post('/surveys/respond', [\App\Http\Controllers\ResponseController::class, 'storeSurvey']);

    // Test (Exams)
    Route::get('/exams', [\App\Http\Controllers\ExamController::class, 'availableExams']);
    Route::post('/exams/{examId}/submit', [\App\Http\Controllers\ExamController::class, 'submit']);

    // RTL
    Route::get('/rtl/status', [\App\Http\Controllers\RtlController::class, 'rtlStatus']);
    Route::get('/rtl/questions', [\App\Http\Controllers\RtlController::class, 'activeQuestions']);
    Route::post('/rtl/respond', [\App\Http\Controllers\RtlController::class, 'storeResponse']);

    // Final Report (Peserta)
    Route::get('/peserta/report', [\App\Http\Controllers\PesertaController::class, 'getFinalReport']);


    // --- OBSERVER & ADMIN ROUTES ---
    Route::middleware([\App\Http\Middleware\ObserverMiddleware::class])->group(function () {
        Route::get('/observer/peserta', [\App\Http\Controllers\ObserverController::class, 'getPesertaList']);
        Route::get('/observer/peserta/{id}/attendance', [\App\Http\Controllers\ObserverController::class, 'getPesertaAttendance']);
        Route::get('/observer/available-slots', [\App\Http\Controllers\ObserverController::class, 'getAvailableSlots']);
        
        // Cognitive
        Route::get('/observer/peserta/{id}/exams', [\App\Http\Controllers\ObserverController::class, 'getPesertaExams']);
        Route::post('/observer/score/cognitive', [\App\Http\Controllers\ObserverController::class, 'storeCognitiveScore']);
        
        // Settings & Filtering
        Route::get('/observer/settings', [\App\Http\Controllers\AdminStatsController::class, 'getSettings']);
        
        // Games & Practice
        Route::get('/observer/peserta/{id}/games-practice', [\App\Http\Controllers\ObserverController::class, 'getGamesPractice']);
        Route::post('/observer/score/games', [\App\Http\Controllers\ObserverController::class, 'storeGameScore']);
        Route::post('/observer/score/practice', [\App\Http\Controllers\ObserverController::class, 'storePracticeScore']);

        // Ibadah
        Route::post('/observer/score/worship', [\App\Http\Controllers\ObserverController::class, 'storeWorshipScore']);
    });

    // --- ADMIN ROUTES ---
    Route::middleware([\App\Http\Middleware\AdminMiddleware::class])->group(function () {
        Route::get('/admin/stats', [\App\Http\Controllers\AdminStatsController::class, 'stats']);
        
        // Users Management
        Route::get('/admin/users', [\App\Http\Controllers\AdminUsersController::class, 'users']);
        Route::post('/admin/users', [\App\Http\Controllers\AdminUsersController::class, 'storeUser']);
        Route::delete('/admin/users/{id}', [\App\Http\Controllers\AdminUsersController::class, 'destroyUser']);
        
        // Settings Manito
        Route::post('/admin/manito/shuffle', [\App\Http\Controllers\ManitoController::class, 'shuffle']);
        Route::get('/admin/surveys/questions', [\App\Http\Controllers\AdminManitoController::class, 'listQuestions']);
        Route::post('/admin/surveys/questions', [\App\Http\Controllers\AdminManitoController::class, 'storeQuestion']);
        Route::delete('/admin/surveys/questions/{id}', [\App\Http\Controllers\AdminManitoController::class, 'destroyQuestion']);
        Route::get('/admin/surveys/slots', [\App\Http\Controllers\AdminManitoController::class, 'listSlots']);
        Route::post('/admin/surveys/slots', [\App\Http\Controllers\AdminManitoController::class, 'storeSlot']);
        Route::delete('/admin/surveys/slots/{id}', [\App\Http\Controllers\AdminManitoController::class, 'destroySlot']);
        
        // Settings Attendance
        Route::get('/admin/attendance/slots', [\App\Http\Controllers\AdminAttendanceController::class, 'listSlots']);
        Route::post('/admin/attendance/slots', [\App\Http\Controllers\AdminAttendanceController::class, 'storeSlot']);
        Route::delete('/admin/attendance/slots/{id}', [\App\Http\Controllers\AdminAttendanceController::class, 'destroySlot']);

        // Settings RTL
        Route::get('/admin/rtl/questions', [\App\Http\Controllers\AdminRtlController::class, 'listQuestions']);
        Route::post('/admin/rtl/questions', [\App\Http\Controllers\AdminRtlController::class, 'storeQuestion']);
        Route::delete('/admin/rtl/questions/{id}', [\App\Http\Controllers\AdminRtlController::class, 'destroyQuestion']);
        Route::get('/admin/rtl/status', [\App\Http\Controllers\AdminRtlController::class, 'getStatus']);
        Route::post('/admin/rtl/toggle', [\App\Http\Controllers\AdminRtlController::class, 'toggleStatus']);

        // Settings Ibadah
        Route::get('/admin/worship/slots', [\App\Http\Controllers\AdminIbadahController::class, 'listSlots']);
        Route::post('/admin/worship/slots', [\App\Http\Controllers\AdminIbadahController::class, 'storeSlot']);
        Route::delete('/admin/worship/slots/{id}', [\App\Http\Controllers\AdminIbadahController::class, 'destroySlot']);

        // Settings Game & Practice
        Route::get('/admin/game/slots', [\App\Http\Controllers\AdminGameController::class, 'listSlots']);
        Route::post('/admin/game/slots', [\App\Http\Controllers\AdminGameController::class, 'storeSlot']);
        Route::delete('/admin/game/slots/{id}', [\App\Http\Controllers\AdminGameController::class, 'destroySlot']);
        Route::get('/admin/practice/slots', [\App\Http\Controllers\AdminPracticeController::class, 'listSlots']);
        Route::post('/admin/practice/slots', [\App\Http\Controllers\AdminPracticeController::class, 'storeSlot']);
        Route::delete('/admin/practice/slots/{id}', [\App\Http\Controllers\AdminPracticeController::class, 'destroySlot']);

        // Settings Exams
        Route::get('/admin/exams', [\App\Http\Controllers\AdminExamController::class, 'listExams']);
        Route::post('/admin/exams', [\App\Http\Controllers\AdminExamController::class, 'storeExam']);
        Route::put('/admin/exams/{id}', [\App\Http\Controllers\AdminExamController::class, 'updateExam']);
        Route::delete('/admin/exams/{id}', [\App\Http\Controllers\AdminExamController::class, 'destroyExam']);
        Route::post('/admin/exams/{id}/questions', [\App\Http\Controllers\AdminExamController::class, 'storeExamQuestion']);
        Route::put('/admin/exams/{id}/questions/batch', [\App\Http\Controllers\AdminExamController::class, 'batchUpdateExamQuestions']);

        // Final Report Management
        Route::get('/admin/reports', [\App\Http\Controllers\AdminReportController::class, 'index']);
        Route::post('/admin/reports/publish', [\App\Http\Controllers\AdminReportController::class, 'publish']); // Publish scores
        Route::get('/admin/reports/export', [\App\Http\Controllers\AdminReportController::class, 'exportScores']);

        // Global Settings (Days, etc)
        Route::get('/admin/settings', [\App\Http\Controllers\AdminStatsController::class, 'getSettings']);
        Route::post('/admin/settings', [\App\Http\Controllers\AdminStatsController::class, 'updateSettings']);
    });
});
