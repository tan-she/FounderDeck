<x-mail::message>
# Great News!

Hi {{ $collabRequest->sender->name }},

Your collaboration request for the pitch **{{ $collabRequest->post->title }}** has been **accepted** by {{ $collabRequest->receiver->name }}!

You can now start messaging them directly on the platform.

<x-mail::button :url="config('app.frontend_url') . '/dashboard/investor/messages'">
Send a Message
</x-mail::button>

Thanks,<br>
The {{ config('app.name') }} Team

---
*You are receiving this because you have an account on FounderDeck.*
</x-mail::message>
