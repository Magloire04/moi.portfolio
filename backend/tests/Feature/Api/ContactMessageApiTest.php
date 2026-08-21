<?php

use App\Mail\ContactMessageReceived;
use App\Models\ContactMessage;
use Illuminate\Support\Facades\Mail;

test('a valid contact message is stored and notified by email', function () {
    Mail::fake();

    $response = $this->postJson('/api/v1/contact-messages', [
        'name' => 'Amina Traoré',
        'email' => 'amina@example.com',
        'message' => "Bonjour, je souhaite discuter d'un mandat.",
        'projectInterest' => 'TracaCajou',
        'locale' => 'fr',
    ]);

    $response->assertStatus(201)->assertJson(['data' => ['received' => true]]);
    expect(ContactMessage::count())->toBe(1);
    Mail::assertSent(ContactMessageReceived::class);
});

test('an invalid contact message is rejected with a 422', function () {
    $response = $this->postJson('/api/v1/contact-messages', [
        'name' => '',
        'email' => 'pas-un-email',
        'message' => '',
    ]);

    $response->assertStatus(422);
    expect(ContactMessage::count())->toBe(0);
});

test('an invalid contact message returns the standard error envelope', function () {
    $response = $this->postJson('/api/v1/contact-messages', [
        'name' => '',
        'email' => 'pas-un-email',
        'message' => '',
    ]);

    $response->assertStatus(422)
        ->assertJsonPath('error.code', 'VALIDATION_ERROR')
        ->assertJsonPath('error.status', 422)
        ->assertJsonStructure(['error' => ['code', 'message', 'status']]);
});

test('rapid contact message submissions are throttled with the standard error envelope', function () {
    Mail::fake();

    for ($i = 0; $i < 5; $i++) {
        $this->postJson('/api/v1/contact-messages', [
            'name' => 'Amina Traoré',
            'email' => 'amina@example.com',
            'message' => "Bonjour, je souhaite discuter d'un mandat.",
        ])->assertStatus(201);
    }

    $response = $this->postJson('/api/v1/contact-messages', [
        'name' => 'Amina Traoré',
        'email' => 'amina@example.com',
        'message' => "Bonjour, je souhaite discuter d'un mandat.",
    ]);

    $response->assertStatus(429)
        ->assertJsonPath('error.code', 'TOO_MANY_REQUESTS')
        ->assertJsonPath('error.status', 429)
        ->assertJsonStructure(['error' => ['code', 'message', 'status']]);
});

test('a filled honeypot field is silently dropped without storing or notifying', function () {
    Mail::fake();

    $response = $this->postJson('/api/v1/contact-messages', [
        'name' => 'Bot',
        'email' => 'bot@example.com',
        'message' => 'Spam',
        'website' => 'https://spam.example',
    ]);

    $response->assertStatus(201)->assertJson(['data' => ['received' => true]]);
    expect(ContactMessage::count())->toBe(0);
    Mail::assertNothingSent();
});
