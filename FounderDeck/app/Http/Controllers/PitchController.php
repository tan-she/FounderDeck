<?php

namespace App\Http\Controllers;

use App\Models\Pitch;
use Illuminate\Http\Request;

class PitchController extends Controller
{
    public function index(Request $request)
    {
        $pitches = Pitch::with('user:id,name,avatar,role')->latest()->get();
        return response()->json($pitches);
    }

    public function myPitches(Request $request)
    {
        $pitches = $request->user()->pitches()->latest()->get();
        return response()->json($pitches);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'tagline' => 'required|string|max:255',
            'problem' => 'required|string',
            'solution' => 'required|string',
            'industry' => 'required|string',
            'funding_stage' => 'required|string',
            'cover_image' => 'nullable|url',
        ]);

        $pitch = $request->user()->pitches()->create($validated);

        return response()->json($pitch, 201);
    }

    public function show(Pitch $pitch)
    {
        return response()->json($pitch->load('user:id,name,avatar,role'));
    }

    public function update(Request $request, Pitch $pitch)
    {
        if ($request->user()->id !== $pitch->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'tagline' => 'sometimes|string|max:255',
            'problem' => 'sometimes|string',
            'solution' => 'sometimes|string',
            'industry' => 'sometimes|string',
            'funding_stage' => 'sometimes|string',
            'cover_image' => 'nullable|url',
        ]);

        $pitch->update($validated);

        return response()->json($pitch);
    }

    public function destroy(Request $request, Pitch $pitch)
    {
        if ($request->user()->id !== $pitch->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $pitch->delete();
        return response()->json(null, 204);
    }
}
