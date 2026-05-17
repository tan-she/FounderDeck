<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\DeepSeekService;
use Illuminate\Http\JsonResponse;

class AiController extends Controller
{
    /**
     * Enhance startup pitch content using DeepSeek AI.
     */
    public function enhancePitch(Request $request, DeepSeekService $aiService): JsonResponse
    {
        $request->validate([
            'field' => 'required|string|in:description,pitch,problem,solution',
            'content' => 'required|string|max:5000',
        ]);

        $field = $request->input('field');
        $content = $request->input('content');

        // Formulate tailored prompts based on the field being enhanced
        if ($field === 'description') {
            $prompt = "You are an expert startup advisor and copywriter for pitch decks.\n" .
                      "A founder has written the following rough notes for their startup's full pitch description:\n\n" .
                      "\"" . $content . "\"\n\n" .
                      "Rewrite this into a compelling, professional, structured, and concise startup description suitable for an investor pitch. " .
                      "Keep it around 2-3 structured paragraphs, very engaging and professional, highlighting the core value proposition. " .
                      "Do NOT include any conversational filler, introductory or concluding remarks (e.g. do not say 'Here is your polished pitch:'), " .
                      "just return the polished text directly.";
        } else {
            $prompt = "You are an expert startup advisor and copywriter for pitch decks.\n" .
                      "A founder has written the following rough notes for their startup's " . strtoupper($field) . " section:\n\n" .
                      "\"" . $content . "\"\n\n" .
                      "Rewrite this into a compelling, professional, and concise " . $field . " statement suitable for an investor pitch deck. " .
                      "Do NOT include any conversational filler, introductory or concluding remarks, just return the polished text directly.";
        }

        try {
            $enhancedText = $aiService->askDeepSeek($prompt);
            
            // Strip out <think>...</think> tokens that might be returned by DeepSeek reasoning models
            $cleanedText = preg_replace('/<think>[\s\S]*?<\/think>/i', '', $enhancedText);
            $cleanedText = trim($cleanedText);

            return response()->json([
                'status' => 'success',
                'enhanced_content' => $cleanedText,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to enhance content: ' . $e->getMessage()
            ], 500);
        }
    }
}
