<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'reportable_type' => ['required', 'string', 'in:post,comment'],
            'reportable_id' => ['required', 'uuid'],
            'reason' => ['required', 'string', 'max:500'],
        ];
    }
}
