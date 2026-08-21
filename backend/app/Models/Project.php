<?php

namespace App\Models;

use App\Enums\ProjectCategory;
use App\Enums\ProjectStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Validation\ValidationException;

class Project extends Model
{
    use HasFactory;

    protected $fillable = [
        'slug', 'category', 'status',
        'title_fr', 'title_en',
        'tagline_fr', 'tagline_en',
        'summary_fr', 'summary_en',
        'body_fr', 'body_en',
        'client_name', 'client_display',
        'stack', 'role', 'screenshots',
        'live_url', 'repo_url', 'featured',
    ];

    protected $casts = [
        'category' => ProjectCategory::class,
        'status' => ProjectStatus::class,
        'client_display' => 'boolean',
        'featured' => 'boolean',
        'stack' => 'array',
        'screenshots' => 'array',
    ];

    protected static function booted(): void
    {
        static::saving(function (Project $project) {
            if ($project->status !== ProjectStatus::Publie) {
                return;
            }

            if (! $project->hasCompleteTranslations()) {
                throw ValidationException::withMessages([
                    // Filament resource forms (CreateRecord/EditRecord) bind their
                    // schema with ->statePath('data'), so a visible field's error
                    // must be keyed 'data.<field>' to attach to it in the Livewire
                    // error bag — a bare 'status' key lands nowhere the form shows.
                    'data.status' => 'Impossible de publier : les champs FR et EN doivent être complets.',
                ]);
            }

            if (blank($project->screenshots)) {
                throw ValidationException::withMessages([
                    'data.status' => "Impossible de publier : au moins une capture d'écran est requise.",
                ]);
            }
        });
    }

    public function testimonials(): HasMany
    {
        return $this->hasMany(Testimonial::class);
    }

    public function isPublished(): bool
    {
        return $this->status === ProjectStatus::Publie;
    }

    public function hasCompleteTranslations(): bool
    {
        return filled($this->title_fr) && filled($this->title_en)
            && filled($this->tagline_fr) && filled($this->tagline_en)
            && filled($this->summary_fr) && filled($this->summary_en)
            && filled($this->body_fr) && filled($this->body_en);
    }
}
