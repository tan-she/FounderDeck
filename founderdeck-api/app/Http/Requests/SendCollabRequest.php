<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SendCollabRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isInvestor();
    }

    public function rules(): array
    {
        return [
            'message' => ['required', 'string', 'max:2000'],
        ];
    }
}
