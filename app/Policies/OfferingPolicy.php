<?php

namespace App\Policies;

use App\Models\Offering;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class OfferingPolicy
{
    public function update(User $user, Offering $offering): Response
    {
        return $this->ownsOffering($user, $offering);
    }

    public function delete(User $user, Offering $offering): Response
    {
        return $this->ownsOffering($user, $offering);
    }

    private function ownsOffering(User $user, Offering $offering): Response
    {
        return $offering->user_id === $user->id
            ? Response::allow()
            : Response::denyAsNotFound();
    }
}
