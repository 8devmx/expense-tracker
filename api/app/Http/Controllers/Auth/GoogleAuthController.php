<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Str;
use App\Services\CategoryService;
use Exception;

class GoogleAuthController extends Controller
{
    public function handleGoogleCallback(Request $request, CategoryService $categoryService)
    {
        try {
            // Obtiene el token de acceso de Google de la petición de React
            $accessToken = $request->input('google_access_token');
            if (!$accessToken) {
                return response()->json(['error' => 'Google access token is missing.'], 400);
            }

            $googleUser = Socialite::driver('google')->userFromToken($accessToken);
            $user = User::where('email', $googleUser->getEmail())->first();

            $isNewUser = !$user;

            if ($user) {
                $user->update([
                    'google_id' => $googleUser->getId(),
                    'profile_picture_url' => $googleUser->getAvatar(),
                ]);
            } else {
                // Si el usuario no existe, creamos uno nuevo
                $user = User::create([
                    'name' => $googleUser->getName(),
                    'email' => $googleUser->getEmail(),
                    'google_id' => $googleUser->getId(),
                    'profile_picture_url' => $googleUser->getAvatar(),
                    // Puedes generar una contraseña por defecto si es necesario
                    'password' => bcrypt(Str::random(24)),
                ]);
            }

            if ($isNewUser) {
                $categoryService->assignDefaultCategories($user);
            }


            // Genera y devuelve el token de Sanctum para nuestra app
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'token' => $token,
                'user' => $user
            ]);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
