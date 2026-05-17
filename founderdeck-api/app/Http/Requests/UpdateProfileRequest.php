<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'bio' => ['nullable', 'string', 'max:2000'],
            'linkedin_url' => ['nullable', 'url', 'regex:/^https:\/\/(www\.)?linkedin\.com\/in\/.+$/i'],
            'github_url' => ['nullable', 'url', 'regex:/^https:\/\/(www\.)?github\.com\/.+$/i'],
            'avatar_url' => ['nullable', 'url', 'max:2048'],
            'profile_completed' => ['sometimes', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'linkedin_url.regex' => 'LinkedIn URL must match the pattern: https://linkedin.com/in/...',
            'github_url.regex' => 'GitHub URL must match the pattern: https://github.com/...',
        ];
    }
}
