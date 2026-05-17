<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureProfileCompleted
{
    /**
     * Handle an incoming request.
     * Returns 403 with a message if the user's profile is not yet completed.
     * This is used on routes that require a complete profile.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && !$user->profile_completed) {
            return response()->json([
                'message' => 'Please complete your profile before accessing this resource.',
                'redirect' => '/onboarding',
            ], 403);
        }

        return $next($request);
    }
}
