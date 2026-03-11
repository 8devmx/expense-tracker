<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\SettingsController;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;


// test-login eliminado — no debe existir en producción

Route::post('/auth/google/callback', [GoogleAuthController::class, 'handleGoogleCallback']);
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// Deploy hook — corre migraciones, solo accesible con secret header
Route::post('/deploy-hook', function (Request $request) {
    $secret = $request->header('X-Deploy-Secret');
    $expected = env('DEPLOY_HOOK_SECRET');

    if (!$secret || !$expected || !hash_equals($expected, $secret)) {
        abort(401);
    }

    try {
        Artisan::call('migrate', ['--force' => true]);
        Artisan::call('config:cache');
        Artisan::call('route:cache');
        $output = Artisan::output();

        return response()->json(['status' => 'ok', 'output' => $output]);
    } catch (\Exception $e) {
        return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
    }
});

// Health check
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now()->toISOString(),
    ]);
});

Route::middleware('auth:sanctum')->group(function () {

    Route::post('/auth/logout', [AuthController::class, 'logout']);

    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::apiResource('categories', CategoryController::class);
    Route::apiResource('transactions', TransactionController::class);
    Route::get('dashboard', [DashboardController::class, 'index']);
    Route::post('/export/transactions', [TransactionController::class, 'exportToGoogleSheets']);
    
    // Settings
    Route::get('/settings', [SettingsController::class, 'index']);
    Route::put('/settings', [SettingsController::class, 'update']);
});
