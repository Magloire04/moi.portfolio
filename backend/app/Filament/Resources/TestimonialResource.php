<?php

namespace App\Filament\Resources;

use App\Filament\Resources\TestimonialResource\Pages;
use App\Models\Testimonial;
use BackedEnum;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class TestimonialResource extends Resource
{
    protected static ?string $model = Testimonial::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedChatBubbleLeftRight;

    protected static ?string $navigationLabel = 'Témoignages';

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            Select::make('project_id')
                ->label('Projet lié')
                ->relationship('project', 'title_fr')
                ->searchable(),
            TextInput::make('author_name')->label('Nom')->required(),
            TextInput::make('author_role')->label('Fonction'),
            TextInput::make('author_company')->label('Entreprise'),
            Textarea::make('quote_fr')->label('Citation (FR)')->required(),
            Textarea::make('quote_en')->label('Citation (EN)')->required(),
            Toggle::make('visible')->default(true),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('author_name')->label('Nom')->searchable(),
                TextColumn::make('project.title_fr')->label('Projet'),
                IconColumn::make('visible')->boolean(),
            ])
            ->recordActions([
                EditAction::make(),
                DeleteAction::make(),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListTestimonials::route('/'),
            'create' => Pages\CreateTestimonial::route('/create'),
            'edit' => Pages\EditTestimonial::route('/{record}/edit'),
        ];
    }
}
