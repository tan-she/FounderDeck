<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

// Auth Routes
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// Google Socialite Routes
Route::get('/auth/google', [AuthController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [AuthController::class, 'handleGoogleCallback']);

// Protected Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    
    // Pitches
    Route::get('/pitches/my-pitches', [\App\Http\Controllers\PitchController::class, 'myPitches']);
    Route::apiResource('pitches', \App\Http\Controllers\PitchController::class);

    // AI Tools
    Route::post('/ai/enhance-pitch', [\App\Http\Controllers\AiController::class, 'enhancePitch']);
});

Route::get('/health', fn () => response()->json([
    'status' => 'ok',
    'timestamp' => now()->toISOString(),
]));
