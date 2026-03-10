<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SettingsController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $settings = $user->settings ?? [
            'transaction_month_start_day' => 1,
        ];
        
        return response()->json($settings);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'transaction_month_start_day' => 'required|integer|min:1|max:28',
        ]);

        $user = Auth::user();
        $currentSettings = $user->settings ?? [];
        
        $currentSettings['transaction_month_start_day'] = $validated['transaction_month_start_day'];
        
        $user->settings = $currentSettings;
        $user->save();

        return response()->json($currentSettings);
    }
}
