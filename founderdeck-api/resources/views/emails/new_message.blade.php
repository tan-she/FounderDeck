<x-mail::message>
# New Message Received

Hi {{ $msg->receiver->name }},

You have a new message from **{{ $msg->sender->name }}** on FounderDeck:

> "{{ mb_substr($msg->decrypted_body, 0, 100) }}{{ mb_strlen($msg->decrypted_body) > 100 ? '...' : '' }}"

<x-mail::button :url="config('app.frontend_url') . '/dashboard/messages/' . $msg->sender_id">
Reply to Message
</x-mail::button>

Thanks,<br>
The {{ config('app.name') }} Team

---
*You are receiving this because you have an account on FounderDeck.*
</x-mail::message>
