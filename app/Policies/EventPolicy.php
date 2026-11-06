<?php

namespace App\Policies;

use App\Models\Event;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class EventPolicy
{
    public function update(User $user, Event $event): Response
    {
        return $this->ownsEvent($user, $event);
    }

    public function delete(User $user, Event $event): Response
    {
        return $this->ownsEvent($user, $event);
    }

    private function ownsEvent(User $user, Event $event): Response
    {
        return $event->user_id === $user->id
            ? Response::allow()
            : Response::denyAsNotFound();
    }
}
