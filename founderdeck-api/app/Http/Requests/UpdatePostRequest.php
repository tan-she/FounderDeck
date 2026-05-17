<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePostRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isEntrepreneur();
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'string', 'max:150'],
            'tagline' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'string'],
            'industry' => ['sometimes', 'string', 'max:100'],
            'tech_stack' => ['nullable', 'array'],
            'tech_stack.*' => ['string', 'max:50'],
            'funding_stage' => ['sometimes', 'in:idea,mvp,seed,series_a,looking_for_cofounders'],
            'cover_image_url' => ['nullable', 'url', 'max:2048'],
            'demo_url' => ['nullable', 'url', 'max:2048'],
            'github_repo_url' => ['nullable', 'url', 'max:2048'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:50'],
        ];
    }
}
