<?php

use App\Filament\Pages\ManageSettings;
use App\Models\Setting;
use App\Models\User;
use Filament\Facades\Filament;
use Livewire\Livewire;

beforeEach(function () {
    Filament::setCurrentPanel(Filament::getPanel('admin'));
    $this->actingAs(User::factory()->create());
});

test('it loads with the toggle defaulting to true', function () {
    Livewire::test(ManageSettings::class)
        ->assertFormSet(['availableForWork' => true]);
});

test('it persists a toggle change via Setting::set', function () {
    Livewire::test(ManageSettings::class)
        ->set('data.availableForWork', false)
        ->call('save')
        ->assertHasNoFormErrors();

    expect(Setting::get('available_for_work'))->toBe('false');
});
