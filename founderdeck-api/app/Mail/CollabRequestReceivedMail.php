<?php

namespace App\Mail;

use App\Models\CollaborationRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CollabRequestReceivedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public CollaborationRequest $collabRequest) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'New Collaboration Request on FounderDeck');
    }

    public function content(): Content
    {
        return new Content(markdown: 'emails.collab_received');
    }
}
