<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/login', [\App\Http\Controllers\AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [\App\Http\Controllers\AuthController::class, 'me']);
    Route::post('/logout', [\App\Http\Controllers\AuthController::class, 'logout']);

    // Peserta Routes
    Route::get('/manito/target', [\App\Http\Controllers\ManitoController::class, 'getTarget']);
    
    // Attendance and Evaluations 
    Route::post('/attendance', [\App\Http\Controllers\AttendanceController::class, 'store']);
    Route::get('/attendance', [\App\Http\Controllers\AttendanceController::class, 'index']);
    Route::post('/evaluations', [\App\Http\Controllers\EvaluationController::class, 'store']);
    Route::post('/ibadah', [\App\Http\Controllers\WorshipLogController::class, 'store']);
    Route::get('/ibadah', [\App\Http\Controllers\WorshipLogController::class, 'index']);
    
    // New: Survey and Exam for Participants
    Route::get('/surveys', [\App\Http\Controllers\AdminController::class, 'listSurveys']); // Both see active ones
    Route::post('/surveys/{surveyId}/respond', [\App\Http\Controllers\ResponseController::class, 'storeSurvey']);
    Route::get('/exams', [\App\Http\Controllers\ExamController::class, 'availableExams']);
    Route::post('/exams/{examId}/submit', [\App\Http\Controllers\ExamController::class, 'submit']);
    
    // Admin Routes
    Route::middleware([\App\Http\Middleware\AdminMiddleware::class])->group(function () {
        Route::get('/admin/stats', [\App\Http\Controllers\AdminController::class, 'stats']);
        Route::get('/admin/users', [\App\Http\Controllers\AdminController::class, 'users']);
        Route::post('/admin/users', [\App\Http\Controllers\AdminController::class, 'storeUser']);
        Route::delete('/admin/users/{id}', [\App\Http\Controllers\AdminController::class, 'destroyUser']);
        Route::post('/admin/manito/shuffle', [\App\Http\Controllers\ManitoController::class, 'shuffle']);
        Route::get('/admin/scores/export', [\App\Http\Controllers\AdminController::class, 'exportScores']);

        // Admin Survey Management
        Route::post('/admin/surveys', [\App\Http\Controllers\AdminController::class, 'storeSurvey']);
        Route::post('/admin/surveys/{id}/questions', [\App\Http\Controllers\AdminController::class, 'storeQuestion']);
        
        // Admin Exam Management
        Route::post('/admin/exams', [\App\Http\Controllers\AdminController::class, 'storeExam']);
        Route::post('/admin/exams/{id}/questions', [\App\Http\Controllers\AdminController::class, 'storeExamQuestion']);
        
        // Observer Logging Rekap
        Route::get('/admin/observer/ibadah', [\App\Http\Controllers\AdminController::class, 'observerIbadah']);
    });

    // Observer Routes
    Route::middleware([\App\Http\Middleware\ObserverMiddleware::class])->group(function () {
        Route::get('/observer/peserta', [\App\Http\Controllers\ObserverController::class, 'getPeserta']);
        Route::post('/observer/score', [\App\Http\Controllers\ObserverController::class, 'storeScore']);
    });
});

