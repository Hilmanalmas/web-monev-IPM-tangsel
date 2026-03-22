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
    Route::middleware('role:admin')->group(function () {
        Route::post('/admin/manito/shuffle', [\App\Http\Controllers\ManitoController::class, 'shuffle']);
        // Route::get('/admin/evaluations/pending', [\App\Http\Controllers\EvaluationController::class, 'getPending']);
    });
});

