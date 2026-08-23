<?php

namespace App\Filament\Resources;

use App\Enums\ProjectCategory;
use App\Enums\ProjectStatus;
use App\Filament\Resources\ProjectResource\Pages;
use App\Models\Project;
use BackedEnum;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TagsInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class ProjectResource extends Resource
{
    protected static ?string $model = Project::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedBriefcase;

    protected static ?string $navigationLabel = 'Projets';

    /**
     * @return array<string, string>
     */
    private static function categoryOptions(): array
    {
        return collect(ProjectCategory::cases())
            ->mapWithKeys(fn (ProjectCategory $category) => [$category->value => $category->label()])
            ->all();
    }

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            Section::make('Identité')->columns(2)->schema([
                TextInput::make('slug')->required()->unique(ignoreRecord: true),
                Select::make('category')->required()->options(self::categoryOptions()),
                Select::make('status')->required()->default(ProjectStatus::Brouillon->value)->options([
                    ProjectStatus::Brouillon->value => 'Brouillon',
                    ProjectStatus::Publie->value => 'Publié',
                ]),
                Toggle::make('featured')->label("Mis en avant sur la page d'accueil"),
            ]),

            Section::make('Contenu — Français')->schema([
                TextInput::make('title_fr')->label('Titre (FR)')->required(),
                TextInput::make('tagline_fr')->label('Accroche (FR)')->required(),
                Textarea::make('summary_fr')->label('Résumé (FR)')->required(),
                Textarea::make('body_fr')->label("Corps de l'étude de cas (FR)")->required()->rows(10),
            ]),

            Section::make('Contenu — Anglais')->schema([
                TextInput::make('title_en')->label('Titre (EN)')->required(),
                TextInput::make('tagline_en')->label('Accroche (EN)')->required(),
                Textarea::make('summary_en')->label('Résumé (EN)')->required(),
                Textarea::make('body_en')->label("Corps de l'étude de cas (EN)")->required()->rows(10),
            ]),

            Section::make('Client & preuve')->columns(2)->schema([
                TextInput::make('client_name')->label('Nom du client'),
                Toggle::make('client_display')->label('Afficher le nom publiquement'),
                TagsInput::make('stack')->label('Stack technique'),
                TextInput::make('role'),
                FileUpload::make('screenshots')
                    ->label("Captures d'écran")
                    ->multiple()
                    ->image()
                    ->disk('public')
                    ->directory('projects'),
                TextInput::make('live_url')->label('Lien démo')->url(),
                TextInput::make('repo_url')->label('Lien dépôt')->url(),
            ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('title_fr')->label('Titre')->searchable(),
                TextColumn::make('category')->label('Catégorie')->badge(),
                TextColumn::make('status')->label('Statut')->badge()
                    ->color(fn (ProjectStatus $state) => $state === ProjectStatus::Publie ? 'success' : 'gray'),
                IconColumn::make('featured')->label('Mis en avant')->boolean(),
                TextColumn::make('updated_at')->label('Modifié le')->dateTime('d/m/Y'),
            ])
            ->filters([
                SelectFilter::make('category')->options(self::categoryOptions()),
                SelectFilter::make('status')->options([
                    ProjectStatus::Brouillon->value => 'Brouillon',
                    ProjectStatus::Publie->value => 'Publié',
                ]),
            ])
            ->recordActions([
                EditAction::make(),
                DeleteAction::make(),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListProjects::route('/'),
            'create' => Pages\CreateProject::route('/create'),
            'edit' => Pages\EditProject::route('/{record}/edit'),
        ];
    }
}
