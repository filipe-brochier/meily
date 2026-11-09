<?php

namespace App\Policies;

use App\Models\Transaction;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class TransactionPolicy
{
    public function update(User $user, Transaction $transaction): Response
    {
        return $this->ownsTransaction($user, $transaction);
    }

    public function delete(User $user, Transaction $transaction): Response
    {
        return $this->ownsTransaction($user, $transaction);
    }

    private function ownsTransaction(User $user, Transaction $transaction): Response
    {
        return $transaction->user_id === $user->id
            ? Response::allow()
            : Response::denyAsNotFound();
    }
}
