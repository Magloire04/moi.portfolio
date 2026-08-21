<?php

use App\Models\Project;
use App\Models\Testimonial;
use Illuminate\Database\QueryException;

// Testimonials are only ever exposed nested inside a project's `show`
// response — there's no standalone testimonials endpoint — so a testimonial
// with no project would be permanently unreachable. project_id is now a
// required, cascade-on-delete foreign key rather than nullable.

test('the testimonial factory always attaches a project by default', function () {
    $testimonial = Testimonial::factory()->create();

    expect($testimonial->project_id)->not->toBeNull();
    expect($testimonial->project)->toBeInstanceOf(Project::class);
});

test('a testimonial cannot be created without a project_id', function () {
    expect(fn () => Testimonial::create([
        'project_id' => null,
        'author_name' => 'Sans projet',
        'quote_fr' => 'Citation',
        'quote_en' => 'Quote',
    ]))->toThrow(QueryException::class);
});

test('deleting a project cascades to delete its testimonials', function () {
    $project = Project::factory()->create();
    $testimonial = Testimonial::factory()->for($project)->create();

    $project->delete();

    expect(Testimonial::find($testimonial->id))->toBeNull();
});
