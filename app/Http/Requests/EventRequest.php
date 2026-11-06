<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class EventRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $userId = $this->user()->id;

        return [
            'title' => ['required', 'string', 'max:255'],
            'date' => ['required', 'date_format:Y-m-d'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['nullable', 'date_format:H:i', 'after:start_time'],
            'client_id' => [
                'nullable',
                'integer',
                Rule::exists('clients', 'id')
                    ->where('user_id', $userId)
                    ->whereNull('deleted_at'),
            ],
            'offering_id' => [
                'nullable',
                'integer',
                Rule::exists('offerings', 'id')
                    ->where('user_id', $userId)
                    ->whereNull('deleted_at'),
            ],
            'notes' => ['nullable', 'string', 'max:2000'],
            'status' => ['required', Rule::in(['scheduled', 'completed', 'canceled'])],
        ];
    }
}
