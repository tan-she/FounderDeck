<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\DeepSeekService;

class AiController extends Controller
{
    public function enhancePitch(Request $request, DeepSeekService $aiService)
    {
        $request->validate([
            'field' => 'required|string|in:problem,solution',
            'content' => 'required|string|max:2000',
        ]);

        $prompt = "You are an expert startup advisor and copywriter for pitch decks. " .
                  "A founder has written the following rough notes for their startup's " . strtoupper($request->field) . " section:\n\n" .
                  "\"" . $request->content . "\"\n\n" .
                  "Rewrite this into a compelling, professional, and concise " . $request->field . " statement suitable for an investor pitch deck. " .
                  "Do NOT include conversational filler, just return the polished text directly.";

        try {
            $enhancedText = $aiService->askDeepSeek($prompt);
            return response()->json(['enhanced_content' => trim($enhancedText)]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to enhance content: ' . $e->getMessage()], 500);
        }
    }
}
