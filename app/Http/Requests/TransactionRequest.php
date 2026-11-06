<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TransactionRequest extends FormRequest
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
            'type' => ['required', Rule::in(['income', 'expense'])],
            'category_id' => [
                'required',
                'integer',
                Rule::exists('categories', 'id')
                    ->where('user_id', $userId)
                    ->where('type', $this->input('type')),
            ],
            'client_id' => [
                'nullable',
                'integer',
                'prohibited_if:type,expense',
                Rule::exists('clients', 'id')
                    ->where('user_id', $userId)
                    ->whereNull('deleted_at'),
            ],
            'offering_id' => [
                'nullable',
                'integer',
                'prohibited_if:type,expense',
                Rule::exists('offerings', 'id')
                    ->where('user_id', $userId)
                    ->where('active', true)
                    ->where('category_id', $this->input('category_id'))
                    ->whereNull('deleted_at'),
            ],
            'amount' => ['required', 'numeric', 'gt:0', 'max:99999999.99', 'decimal:0,2'],
            'happened_on' => ['required', 'date_format:Y-m-d'],
            'status' => ['required', Rule::in(['paid', 'pending'])],
            'description' => ['required', 'string', 'max:255'],
        ];
    }
}
