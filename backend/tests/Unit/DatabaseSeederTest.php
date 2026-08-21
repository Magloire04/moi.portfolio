<?php

use App\Models\User;
use Database\Seeders\DatabaseSeeder;

test('the database seeder does not mint a test admin outside the local environment', function () {
    app()->detectEnvironment(fn () => 'testing');

    (new DatabaseSeeder)->run();

    expect(User::where('email', 'test@example.com')->exists())->toBeFalse();
});

test('the database seeder mints a test admin in the local environment', function () {
    app()->detectEnvironment(fn () => 'local');

    (new DatabaseSeeder)->run();

    expect(User::where('email', 'test@example.com')->exists())->toBeTrue();
});
