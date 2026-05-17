<?php

namespace App\Console\Commands;

use App\Events\CollabStatusChanged;
use App\Mail\CollabExpiredMail;
use App\Models\CollaborationRequest;
use App\Models\Notification;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class ExpireCollabRequests extends Command
{
    protected $signature = 'collab:expire-requests';
    protected $description = 'Expire collaboration requests that have passed their 20-day deadline';

    public function handle(): int
    {
        $expired = CollaborationRequest::where('status', 'pending')
            ->where('expires_at', '<', now())
            ->get();

        $count = $expired->count();

        foreach ($expired as $request) {
            $request->update(['status' => 'expired']);

            // Notify Investor
            Mail::to($request->sender->email)->queue(new CollabExpiredMail($request, 'investor'));
            Notification::create([
                'user_id' => $request->sender_id,
                'type' => 'collab_expired',
                'data' => [
                    'collab_id' => $request->id,
                    'post_title' => $request->post->title,
                    'entrepreneur_name' => $request->receiver->name,
                ],
            ]);
            broadcast(new CollabStatusChanged(
                $request->sender_id,
                'expired',
                $request->id,
                $request->post->title,
                $request->receiver->name
            ));

            // Notify Entrepreneur
            Mail::to($request->receiver->email)->queue(new CollabExpiredMail($request, 'entrepreneur'));
            Notification::create([
                'user_id' => $request->receiver_id,
                'type' => 'collab_expired',
                'data' => [
                    'collab_id' => $request->id,
                    'post_title' => $request->post->title,
                    'sender_name' => $request->sender->name,
                ],
            ]);
        }

        $this->info("Expired {$count} collaboration request(s).");

        return Command::SUCCESS;
    }
}
