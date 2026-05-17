<?php

namespace App\Services;

use OpenAI;

class DeepSeekService
{
    protected $client;

    public function __construct()
    {
        $this->client = OpenAI::factory()
            ->withApiKey(env('HF_TOKEN'))
            ->withBaseUri('https://router.huggingface.co/v1')
            ->make();
    }

    public function askDeepSeek(string $prompt): string
    {
        $response = $this->client->chat()->create([
            'model' => 'deepseek-ai/DeepSeek-V4-Pro:novita',
            'messages' => [
                ['role' => 'user', 'content' => $prompt],
            ],
        ]);

        return $response->choices[0]->message->content;
    }
}
