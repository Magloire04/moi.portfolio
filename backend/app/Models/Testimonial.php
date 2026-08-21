<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Testimonial extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id', 'author_name', 'author_role', 'author_company',
        'quote_fr', 'quote_en', 'visible',
    ];

    protected $casts = [
        'visible' => 'boolean',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }
}
