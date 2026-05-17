<?php

namespace App\Mail;

use App\Models\CollaborationRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CollabRejectedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public CollaborationRequest $collabRequest) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Update on your Collaboration Request');
    }

    public function content(): Content
    {
        return new Content(markdown: 'emails.collab_rejected');
    }
}
