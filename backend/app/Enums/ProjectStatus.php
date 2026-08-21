<?php

namespace App\Enums;

enum ProjectStatus: string
{
    case Brouillon = 'brouillon';
    case Publie = 'publie';

    public function label(): string
    {
        return match ($this) {
            self::Brouillon => 'Brouillon',
            self::Publie => 'Publié',
        };
    }
}
