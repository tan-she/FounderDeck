<x-mail::message>
# Welcome to FounderDeck, {{ $user->name }}!

We're excited to have you on board. FounderDeck is the premier platform for startup pitches and investor collaboration.

<x-mail::button :url="config('app.frontend_url')">
Go to Dashboard
</x-mail::button>

Thanks,<br>
The {{ config('app.name') }} Team

---
*You are receiving this because you have an account on FounderDeck.*
</x-mail::message>
