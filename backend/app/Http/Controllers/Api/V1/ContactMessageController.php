<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreContactMessageRequest;
use App\Mail\ContactMessageReceived;
use App\Models\ContactMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Mail;

class ContactMessageController extends Controller
{
    public function store(StoreContactMessageRequest $request): JsonResponse
    {
        if (filled($request->input('website'))) {
            return response()->json(['data' => ['received' => true]], 201);
        }

        $contactMessage = ContactMessage::create([
            'name' => $request->validated('name'),
            'email' => $request->validated('email'),
            'message' => $request->validated('message'),
            'project_interest' => $request->validated('projectInterest'),
            'locale' => $request->validated('locale') ?? 'fr',
        ]);

        Mail::to(config('mail.contact_recipient'))->send(new ContactMessageReceived($contactMessage));

        return response()->json(['data' => ['received' => true]], 201);
    }
}
