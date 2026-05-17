<x-mail::message>
# Request Update

Hi {{ $collabRequest->sender->name }},

Your collaboration request for the pitch **{{ $collabRequest->post->title }}** has been declined by {{ $collabRequest->receiver->name }}.

Don't worry, there are plenty of other amazing startups looking for collaboration.

<x-mail::button :url="config('app.frontend_url') . '/explore'">
Explore More Pitches
</x-mail::button>

Thanks,<br>
The {{ config('app.name') }} Team

---
*You are receiving this because you have an account on FounderDeck.*
</x-mail::message>
