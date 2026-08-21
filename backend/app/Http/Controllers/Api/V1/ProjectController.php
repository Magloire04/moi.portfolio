<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\ProjectStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\ProjectResource;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $limit = min((int) $request->query('limit', 20), 100);
        $page = max((int) $request->query('page', 1), 1);

        $query = Project::query()
            ->where('status', ProjectStatus::Publie)
            ->orderByDesc('featured')
            ->orderBy('id');

        if ($category = $request->query('category')) {
            $query->where('category', $category);
        }

        $total = $query->count();
        $projects = $query->forPage($page, $limit)->get();

        return response()->json([
            'data' => ProjectResource::collection($projects),
            'meta' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
            ],
        ]);
    }

    public function show(string $slug): JsonResponse
    {
        $project = Project::query()
            ->where('slug', $slug)
            ->where('status', ProjectStatus::Publie)
            ->first();

        if (! $project) {
            return response()->json([
                'error' => [
                    'code' => 'PROJECT_NOT_FOUND',
                    'message' => 'Projet introuvable.',
                    'status' => 404,
                ],
            ], 404);
        }

        return response()->json([
            'data' => new ProjectResource($project),
        ]);
    }
}
