<?php

use App\Models\Setting;

test('settings endpoint defaults availableForWork to true when unset', function () {
    $response = $this->getJson('/api/v1/settings');

    $response->assertOk()
        ->assertJson(['data' => ['availableForWork' => true]]);
});

test('settings endpoint reflects a stored false value', function () {
    Setting::set('available_for_work', 'false');

    $response = $this->getJson('/api/v1/settings');

    $response->assertOk()
        ->assertJson(['data' => ['availableForWork' => false]]);
});
