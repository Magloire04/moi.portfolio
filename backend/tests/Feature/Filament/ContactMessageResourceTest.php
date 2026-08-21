<?php

use App\Filament\Resources\ContactMessageResource\Pages\EditContactMessage;
use App\Models\ContactMessage;
use App\Models\User;
use Filament\Facades\Filament;
use Livewire\Livewire;

beforeEach(function () {
    Filament::setCurrentPanel(Filament::getPanel('admin'));
    $this->actingAs(User::factory()->create());
});

test('toggling read and replied in the filament edit form persists to the database', function () {
    $message = ContactMessage::create([
        'name' => 'Amina Traoré',
        'email' => 'amina@example.com',
        'message' => "Bonjour, je souhaite discuter d'un mandat.",
    ])->refresh();

    expect($message->read)->toBeFalse();
    expect($message->replied)->toBeFalse();

    Livewire::test(EditContactMessage::class, ['record' => $message->getRouteKey()])
        ->fillForm(['read' => true, 'replied' => true])
        ->call('save')
        ->assertHasNoFormErrors();

    expect($message->refresh()->read)->toBeTrue();
    expect($message->refresh()->replied)->toBeTrue();
});
