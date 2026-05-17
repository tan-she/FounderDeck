<x-mail::message>
# Request Expired

@if($role === 'investor')
Hi {{ $collabRequest->sender->name }},

Your collaboration request for the pitch **{{ $collabRequest->post->title }}** has expired as it was not responded to within 20 days.
@else
Hi {{ $collabRequest->receiver->name }},

The collaboration request from **{{ $collabRequest->sender->name }}** for your pitch **{{ $collabRequest->post->title }}** has expired.
@endif

<x-mail::button :url="config('app.frontend_url')">
Go to Dashboard
</x-mail::button>

Thanks,<br>
The {{ config('app.name') }} Team

---
*You are receiving this because you have an account on FounderDeck.*
</x-mail::message>
