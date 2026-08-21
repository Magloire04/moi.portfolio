<?php

use App\Enums\ProjectCategory;
use App\Enums\ProjectStatus;
use App\Models\Project;
use Illuminate\Validation\ValidationException;

test('a project cannot be published with incomplete translations', function () {
    expect(fn () => Project::create([
        'slug' => 'incomplet',
        'category' => ProjectCategory::ProduitBytechnum,
        'status' => ProjectStatus::Publie,
        'title_fr' => 'Titre',
        'title_en' => '',
        'tagline_fr' => 'Accroche',
        'tagline_en' => 'Tagline',
        'summary_fr' => 'Résumé',
        'summary_en' => 'Summary',
        'body_fr' => 'Corps',
        'body_en' => 'Body',
        'screenshots' => ['projects/shot.png'],
    ]))->toThrow(ValidationException::class);
});

test('a project cannot be published without at least one screenshot', function () {
    expect(fn () => Project::create([
        'slug' => 'sans-capture',
        'category' => ProjectCategory::ProduitBytechnum,
        'status' => ProjectStatus::Publie,
        'title_fr' => 'Titre', 'title_en' => 'Title',
        'tagline_fr' => 'Accroche', 'tagline_en' => 'Tagline',
        'summary_fr' => 'Résumé', 'summary_en' => 'Summary',
        'body_fr' => 'Corps', 'body_en' => 'Body',
        'screenshots' => null,
    ]))->toThrow(ValidationException::class);
});

test('a complete project can be published', function () {
    $project = Project::create([
        'slug' => 'complet',
        'category' => ProjectCategory::ProduitBytechnum,
        'status' => ProjectStatus::Publie,
        'title_fr' => 'Titre', 'title_en' => 'Title',
        'tagline_fr' => 'Accroche', 'tagline_en' => 'Tagline',
        'summary_fr' => 'Résumé', 'summary_en' => 'Summary',
        'body_fr' => 'Corps', 'body_en' => 'Body',
        'screenshots' => ['projects/shot.png'],
    ]);

    expect($project->isPublished())->toBeTrue();
});
