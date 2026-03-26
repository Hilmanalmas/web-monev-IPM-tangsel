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
    
    // Admin Routes
    Route::middleware([\App\Http\Middleware\AdminMiddleware::class])->group(function () {
        Route::get('/admin/stats', [\App\Http\Controllers\AdminController::class, 'stats']);
        Route::get('/admin/users', [\App\Http\Controllers\AdminController::class, 'users']);
        Route::post('/admin/users', [\App\Http\Controllers\AdminController::class, 'storeUser']);
        Route::delete('/admin/users/{id}', [\App\Http\Controllers\AdminController::class, 'destroyUser']);
        Route::post('/admin/manito/shuffle', [\App\Http\Controllers\ManitoController::class, 'shuffle']);
        Route::get('/admin/scores/export', [\App\Http\Controllers\AdminController::class, 'exportScores']);
    });

    // Observer Routes
    Route::middleware([\App\Http\Middleware\ObserverMiddleware::class])->group(function () {
        Route::get('/observer/peserta', [\App\Http\Controllers\ObserverController::class, 'getPeserta']);
        Route::post('/observer/score', [\App\Http\Controllers\ObserverController::class, 'storeScore']);
    });
});

