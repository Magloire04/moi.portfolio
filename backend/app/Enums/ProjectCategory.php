<?php

namespace App\Enums;

enum ProjectCategory: string
{
    case ProduitBytechnum = 'produit_bytechnum';
    case MandatClient = 'mandat_client';

    public function label(): string
    {
        return match ($this) {
            self::ProduitBytechnum => 'Produit ByTechnum',
            self::MandatClient => 'Mandat client',
        };
    }
}
