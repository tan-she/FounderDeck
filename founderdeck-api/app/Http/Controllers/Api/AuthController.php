<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Mail\WelcomeMail;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{
    /**
     * Register a new user.
     * Role must be 'entrepreneur' or 'investor' — 'super_admin' is rejected by RegisterRequest validation.
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => $request->password, // Hashed via cast
            'role' => $request->role,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        Mail::to($user->email)->queue(new WelcomeMail($user));

        return response()->json([
            'user' => new UserResource($user),
            'token' => $token,
        ], 201);
    }

    /**
     * Log in with email/password.
     * Checks ban status before issuing token.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Invalid credentials.',
            ], 401);
        }

        if ($user->is_banned) {
            return response()->json([
                'message' => 'Your account has been banned.',
                'reason' => $user->ban_reason,
            ], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => new UserResource($user),
            'token' => $token,
        ]);
    }

    /**
     * Log out — revoke current Sanctum token.
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully.']);
    }

    /**
     * Get the authenticated user (used on app mount to restore session).
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => new UserResource($request->user()),
        ]);
    }

    /**
     * Redirect to Google OAuth consent screen.
     */
    public function googleRedirect()
    {
        return Socialite::driver('google')
            ->stateless()
            ->redirect();
    }

    /**
     * Handle Google OAuth callback.
     * 1. If email exists → log in as that user (link Google ID if not linked)
     * 2. If new email → create user with role='investor', profile_completed=false
     * 3. Return redirect to frontend with Sanctum token
     */
    public function googleCallback(): \Illuminate\Http\RedirectResponse
    {
        $googleUser = Socialite::driver('google')->stateless()->user();

        $user = User::where('email', $googleUser->getEmail())->first();

        if ($user) {
            // Existing user — link Google ID if not already linked
            if (!$user->google_id) {
                $user->update(['google_id' => $googleUser->getId()]);
            }

            if ($user->is_banned) {
                $frontendUrl = config('app.frontend_url', 'http://localhost:5173');
                return redirect("{$frontendUrl}/login?error=banned&reason=" . urlencode($user->ban_reason ?? ''));
            }
        } else {
            // New user — create with default role 'investor'
            $user = User::create([
                'name' => $googleUser->getName(),
                'email' => $googleUser->getEmail(),
                'google_id' => $googleUser->getId(),
                'avatar_url' => $googleUser->getAvatar(),
                'role' => 'investor',
                'profile_completed' => false,
                'email_verified_at' => now(),
            ]);

            Mail::to($user->email)->queue(new WelcomeMail($user));
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        $frontendUrl = config('app.frontend_url', 'http://localhost:5173');

        return redirect("{$frontendUrl}/auth/callback?token={$token}");
    }

    /**
     * Health check endpoint to keep Render free tier alive.
     */
    public function health(): JsonResponse
    {
        return response()->json([
            'status' => 'ok',
            'timestamp' => now()->toISOString(),
        ]);
    }
}
