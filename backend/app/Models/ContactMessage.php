<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContactMessage extends Model
{
    protected $fillable = [
        'name', 'email', 'message', 'project_interest', 'locale',
    ];

    protected $casts = [
        'read' => 'boolean',
        'replied' => 'boolean',
    ];
}
