<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\SettingsController;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;


Route::post('/auth/test-login', function (Request $request) {
    $email = $request->input('email', 'test@example.com');
    
    $user = User::where('email', $email)->first();
    
    if (!$user) {
        $user = User::create([
            'name' => 'Test User',
            'email' => $email,
            'password' => Hash::make('password'),
        ]);
        
        $categoryService = app(\App\Services\CategoryService::class);
        $categoryService->assignDefaultCategories($user);
    }
    
    $token = $user->createToken('auth_token')->plainTextToken;
    
    return response()->json([
        'token' => $token,
        'user' => $user
    ]);
});

Route::post('/auth/google/callback', [GoogleAuthController::class, 'handleGoogleCallback']);

Route::middleware('auth:sanctum')->group(function () {

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
