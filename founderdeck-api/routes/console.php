<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// ── Scheduled Tasks ─────────────────────────────────────────

// Run daily to expire pending collaboration requests past 20-day deadline
Schedule::command('collab:expire-requests')->daily();
