<?php

namespace App\Enums;

enum ProjectCategory: string
{
    case ProduitBytechnum = 'produit_bytechnum';
    case MandatClient = 'mandat_client';
    case ProjetEquipe = 'projet_equipe';

    public function label(): string
    {
        return match ($this) {
            self::ProduitBytechnum => 'Produit TECHNUM',
            self::MandatClient => 'Mandat client',
            self::ProjetEquipe => "Projet d'équipe",
        };
    }
}
