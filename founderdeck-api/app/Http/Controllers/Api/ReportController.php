<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreReportRequest;
use App\Models\Comment;
use App\Models\Post;
use App\Models\Report;
use Illuminate\Http\JsonResponse;

class ReportController extends Controller
{
    public function store(StoreReportRequest $request): JsonResponse
    {
        $type = $request->reportable_type;
        $model = $type === 'post' ? Post::class : Comment::class;

        $reportable = $model::findOrFail($request->reportable_id);

        $report = Report::create([
            'reporter_id' => $request->user()->id,
            'reportable_type' => $type,
            'reportable_id' => $reportable->id,
            'reason' => $request->reason,
        ]);

        return response()->json(['message' => 'Report submitted successfully.', 'data' => $report], 201);
    }
}
