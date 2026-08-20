<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;

class SettingController extends Controller
{
    public function show(): JsonResponse
    {
        return response()->json([
            'data' => [
                'availableForWork' => filter_var(
                    Setting::get('available_for_work', 'true'),
                    FILTER_VALIDATE_BOOLEAN
                ),
            ],
        ]);
    }
}
