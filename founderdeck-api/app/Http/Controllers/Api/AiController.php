<?php
// founderdeck-api/app/Http/Controllers/Api/AiController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AiController extends Controller
{
    private string $apiUrl = 'https://router.huggingface.co/v1/chat/completions';
    private string $model;
    private string $token;

    public function __construct()
    {
        $this->model = env('HF_MODEL', 'deepseek-ai/DeepSeek-V3-0324:novita');
        $this->token = env('HF_TOKEN', '');
    }

    // ─── 1. Auto-Generate One-Liner ──────────────────────────────────────────

    public function generateOneLiner(Request $request)
    {
        $request->validate([
            'title'       => 'required|string|max:100',
            'tagline'     => 'nullable|string|max:300',
            'description' => 'nullable|string|max:5000',
            'industry'    => 'nullable|string|max:100',
        ]);

        $context = "Startup: {$request->title}";
        if ($request->tagline)     $context .= "\nTagline: {$request->tagline}";
        if ($request->industry)    $context .= "\nIndustry: {$request->industry}";
        if ($request->description) $context .= "\nDescription: " . substr($request->description, 0, 600);

        $prompt = "Write ONE compelling investor-ready one-liner for this startup in under 20 words. Return ONLY the one-liner, nothing else.\n\n{$context}";

        $result = $this->callAI($prompt, 80, 45);

        if (!$result['success']) {
            return response()->json(['message' => $result['error']], 500);
        }

        return response()->json(['summary' => $result['content']]);
    }

    // ─── 2. Enhance Full Pitch Description ───────────────────────────────────

    public function enhanceDescription(Request $request)
    {
        $request->validate([
            'description' => 'required|string|min:30|max:5000',
            'title'       => 'nullable|string|max:100',
            'industry'    => 'nullable|string|max:100',
        ]);

        $context = "";
        if ($request->title)    $context .= "Startup: {$request->title}\n";
        if ($request->industry) $context .= "Industry: {$request->industry}\n";
        $context .= "Current pitch:\n{$request->description}";

        $prompt = <<<EOT
You are a startup pitch writer. Rewrite this pitch to be clear, compelling and investor-ready.
Structure: Problem → Solution → Target users → Business model → CTA.
Keep it under 350 words. Return ONLY the enhanced pitch text, no preamble.

{$context}
EOT;

        // Enhancement needs more tokens and more time
        $result = $this->callAI($prompt, 800, 90);

        if (!$result['success']) {
            return response()->json(['message' => $result['error']], 500);
        }

        return response()->json(['description' => $result['content']]);
    }

    // ─── 3. Debug/Test endpoint (remove in production) ───────────────────────

    public function testConnection()
    {
        $result = $this->callAI("Say exactly: OK", 10, 30);

        return response()->json([
            'token_set' => !empty($this->token),
            'model'     => $this->model,
            'result'    => $result,
        ]);
    }

    // ─── Core AI Caller ──────────────────────────────────────────────────────

    private function callAI(string $prompt, int $maxTokens = 500, int $timeoutSeconds = 60): array
    {
        if (empty($this->token)) {
            Log::error('AI: HF_TOKEN missing in .env');
            return ['success' => false, 'error' => 'AI service not configured. Set HF_TOKEN in .env'];
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->token,
                'Content-Type'  => 'application/json',
            ])
            ->timeout($timeoutSeconds)
            ->post($this->apiUrl, [
                'model'      => $this->model,
                'max_tokens' => $maxTokens,
                'stream'     => false,   // ← MUST be false, streaming breaks response parsing
                'messages'   => [
                    ['role' => 'user', 'content' => $prompt],
                ],
            ]);

            // Log the raw response for debugging (remove after AI is stable)
            Log::info('AI raw response', [
                'status' => $response->status(),
                'body'   => $response->body(),
            ]);

            if ($response->failed()) {
                $status = $response->status();
                $body   = $response->json();
                Log::error('AI API failed', ['status' => $status, 'body' => $body]);

                return ['success' => false, 'error' => match($status) {
                    401     => 'Invalid HF_TOKEN. Check your .env file.',
                    403     => 'HF_TOKEN lacks permission for this model.',
                    404     => 'Model not found. Check HF_MODEL in .env.',
                    429     => 'Rate limit hit. Wait a moment and retry.',
                    503     => 'Model is loading (cold start). Retry in 30 seconds.',
                    default => "AI service error (HTTP {$status}). Check Laravel logs.",
                }];
            }

            $data = $response->json();

            // ── Robust content extraction ──
            // DeepSeek & some HuggingFace models differ in where they put content
            $content = $this->extractContent($data);

            if ($content === null || $content === '') {
                Log::error('AI returned no extractable content', ['response' => $data]);
                return ['success' => false, 'error' => 'AI returned empty content. Check Laravel logs for raw response.'];
            }

            return ['success' => true, 'content' => trim($content)];

        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('AI timeout', ['error' => $e->getMessage(), 'timeout' => $timeoutSeconds]);
            return ['success' => false, 'error' => "AI timed out after {$timeoutSeconds}s. Try again or use a faster model."];
        } catch (\Exception $e) {
            Log::error('AI unexpected error', ['error' => $e->getMessage()]);
            return ['success' => false, 'error' => 'Unexpected error: ' . $e->getMessage()];
        }
    }

    /**
     * Extract text content from various AI response shapes.
     * Handles: standard OpenAI, DeepSeek thinking models, HuggingFace variations.
     */
    private function extractContent(array $data): ?string
    {
        // Standard OpenAI shape: choices[0].message.content
        $content = $data['choices'][0]['message']['content'] ?? null;
        if (!empty($content)) return $content;

        // DeepSeek thinking models: choices[0].message.reasoning_content
        $reasoning = $data['choices'][0]['message']['reasoning_content'] ?? null;
        if (!empty($reasoning)) return $reasoning;

        // Some HF providers nest it differently
        $text = $data['choices'][0]['text'] ?? null;
        if (!empty($text)) return $text;

        // HuggingFace text-generation fallback
        $generated = $data['generated_text'] ?? null;
        if (!empty($generated)) return $generated;

        // Last resort — log everything so you can see the actual shape
        Log::warning('AI: unknown response shape', ['data' => $data]);
        return null;
    }
}
