<?php

use App\Models\Project;
use App\Models\Testimonial;

test('project show nests only visible testimonials for that project', function () {
    $project = Project::factory()->create(['slug' => 'tracacajou']);
    $other = Project::factory()->create(['slug' => 'where']);

    Testimonial::factory()->for($project)->create(['author_name' => 'Visible', 'visible' => true]);
    Testimonial::factory()->for($project)->create(['author_name' => 'Caché', 'visible' => false]);
    Testimonial::factory()->for($other)->create(['author_name' => 'Autre projet']);

    $response = $this->getJson('/api/v1/projects/tracacajou');

    $response->assertOk()
        ->assertJsonCount(1, 'data.testimonials')
        ->assertJsonPath('data.testimonials.0.authorName', 'Visible');
});
