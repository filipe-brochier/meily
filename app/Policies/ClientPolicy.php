<?php

namespace App\Policies;

use App\Models\Client;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class ClientPolicy
{
    public function view(User $user, Client $client): Response
    {
        return $this->ownsClient($user, $client);
    }

    public function update(User $user, Client $client): Response
    {
        return $this->ownsClient($user, $client);
    }

    public function delete(User $user, Client $client): Response
    {
        return $this->ownsClient($user, $client);
    }

    private function ownsClient(User $user, Client $client): Response
    {
        return $client->user_id === $user->id
            ? Response::allow()
            : Response::denyAsNotFound();
    }
}
