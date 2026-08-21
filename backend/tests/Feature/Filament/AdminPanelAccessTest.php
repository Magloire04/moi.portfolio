<?php

use App\Models\User;

// These tests make a real HTTP request to /admin (not Livewire::test(), which
// bypasses HTTP middleware entirely). That's the blind spot that let the User
// model ship without implementing FilamentUser::canAccessPanel(): every other
// admin test in this suite used Livewire::test() and never exercised
// Filament's Authenticate middleware at all.

test('a user matching the configured admin email can access the admin panel outside local env', function () {
    config([
        'app.env' => 'production',
        'app.admin_email' => 'admin@example.com',
    ]);

    $user = User::factory()->create(['email' => 'admin@example.com']);

    $response = $this->actingAs($user)->get('/admin');

    $response->assertOk();
});

test('a user not matching the configured admin email is forbidden from the admin panel outside local env', function () {
    config([
        'app.env' => 'production',
        'app.admin_email' => 'admin@example.com',
    ]);

    $user = User::factory()->create(['email' => 'someone-else@example.com']);

    $response = $this->actingAs($user)->get('/admin');

    $response->assertForbidden();
});

test('an unauthenticated visitor is redirected away from the admin panel', function () {
    config([
        'app.env' => 'production',
        'app.admin_email' => 'admin@example.com',
    ]);

    $response = $this->get('/admin');

    $response->assertRedirect();
});
