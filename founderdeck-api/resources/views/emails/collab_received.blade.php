<x-mail::message>
# New Collaboration Request!

Hi {{ $collabRequest->receiver->name }},

You have received a new collaboration request from **{{ $collabRequest->sender->name }}** for your pitch: **{{ $collabRequest->post->title }}**.

**Their message:**
> {{ $collabRequest->message }}

<x-mail::button :url="config('app.frontend_url') . '/dashboard/entrepreneur/collab'">
View Request
</x-mail::button>

Thanks,<br>
The {{ config('app.name') }} Team

---
*You are receiving this because you have an account on FounderDeck.*
</x-mail::message>
