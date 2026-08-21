<?php

use App\Models\Project;

test('projects index only returns published projects, newest featured first, with pagination meta', function () {
    Project::factory()->count(2)->create();
    Project::factory()->draft()->create();

    $response = $this->getJson('/api/v1/projects');

    $response->assertOk()
        ->assertJsonCount(2, 'data')
        ->assertJsonStructure([
            'data' => [['id', 'slug', 'category', 'title' => ['fr', 'en'], 'clientName', 'stack', 'screenshots']],
            'meta' => ['page', 'limit', 'total'],
        ])
        ->assertJsonPath('meta.total', 2);
});

test('projects index hides the client name when client_display is false', function () {
    Project::factory()->create(['client_name' => 'CAFAB', 'client_display' => false]);

    $response = $this->getJson('/api/v1/projects');

    $response->assertOk()->assertJsonPath('data.0.clientName', null);
});

test('project show returns the full payload for a published slug', function () {
    $project = Project::factory()->create(['slug' => 'oeil-360-finance']);

    $response = $this->getJson('/api/v1/projects/oeil-360-finance');

    $response->assertOk()->assertJsonPath('data.slug', 'oeil-360-finance');
});

test('project show returns a 404 envelope for an unknown slug', function () {
    $response = $this->getJson('/api/v1/projects/inconnu');

    $response->assertStatus(404)
        ->assertJsonPath('error.code', 'PROJECT_NOT_FOUND');
});

test('project show returns a 404 for a draft project', function () {
    Project::factory()->draft()->create(['slug' => 'brouillon']);

    $response = $this->getJson('/api/v1/projects/brouillon');

    $response->assertStatus(404);
});

test('projects index exposes testimonials as an empty array rather than omitting the key', function () {
    Project::factory()->create();

    $response = $this->getJson('/api/v1/projects');

    $response->assertOk()
        ->assertJsonPath('data.0.testimonials', []);
});
