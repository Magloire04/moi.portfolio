<?php

use App\Enums\ProjectCategory;
use App\Enums\ProjectStatus;
use App\Filament\Resources\ProjectResource\Pages\CreateProject;
use App\Models\User;
use Filament\Facades\Filament;
use Livewire\Livewire;

// Regression test for the publish-guard's error message actually reaching the
// visible form field. Project::booted() throws ValidationException when an
// incomplete project is saved with status=publie, but Filament resource forms
// (CreateRecord/EditRecord) bind their schema with ->statePath('data'), so the
// message must be keyed 'data.status' — not 'status' — to attach to the field
// shown in the admin. The existing unit tests in tests/Unit/ProjectTest.php
// only call Project::create() directly and never exercised this admin path,
// which is exactly the blind spot that let this finding through.

beforeEach(function () {
    Filament::setCurrentPanel(Filament::getPanel('admin'));
    $this->actingAs(User::factory()->create());
});

test('publishing a project without a screenshot through the admin form surfaces the error on the status field', function () {
    Livewire::test(CreateProject::class)
        ->fillForm([
            'slug' => 'incomplet-admin',
            'category' => ProjectCategory::ProduitBytechnum->value,
            'status' => ProjectStatus::Publie->value,
            'title_fr' => 'Titre', 'title_en' => 'Title',
            'tagline_fr' => 'Accroche', 'tagline_en' => 'Tagline',
            'summary_fr' => 'Résumé', 'summary_en' => 'Summary',
            'body_fr' => 'Corps', 'body_en' => 'Body',
            // screenshots intentionally left empty
        ])
        ->call('create')
        ->assertHasFormErrors(['status']);
});
