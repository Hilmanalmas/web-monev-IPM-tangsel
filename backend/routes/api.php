<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::prefix('attendances')->middleware('auth:sanctum')->group(function () {
    Route::post('/selfie', [\App\Http\Controllers\AttendanceController::class, 'store']);
    Route::get('/', [\App\Http\Controllers\AttendanceController::class, 'index']);
});

Route::prefix('evaluations')->middleware('auth:sanctum')->group(function () {
    Route::post('/', [\App\Http\Controllers\EvaluationController::class, 'store']);
    Route::get('/pending', [\App\Http\Controllers\EvaluationController::class, 'pending']);
});

Route::prefix('admin')->middleware(['auth:sanctum', 'role:admin'])->group(function () {
    // Admin routes for manual reporting and mappings
});
