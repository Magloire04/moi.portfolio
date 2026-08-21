<?php

namespace Database\Factories;

use App\Enums\ProjectCategory;
use App\Enums\ProjectStatus;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProjectFactory extends Factory
{
    public function definition(): array
    {
        return [
            'slug' => $this->faker->unique()->slug(3),
            'category' => ProjectCategory::ProduitBytechnum,
            'status' => ProjectStatus::Publie,
            'title_fr' => $this->faker->sentence(3),
            'title_en' => $this->faker->sentence(3),
            'tagline_fr' => $this->faker->sentence(6),
            'tagline_en' => $this->faker->sentence(6),
            'summary_fr' => $this->faker->paragraph(),
            'summary_en' => $this->faker->paragraph(),
            'body_fr' => $this->faker->paragraphs(3, true),
            'body_en' => $this->faker->paragraphs(3, true),
            'client_name' => $this->faker->company(),
            'client_display' => true,
            'stack' => ['Laravel', 'Next.js'],
            'role' => 'Développeur full-stack',
            'screenshots' => ['projects/placeholder.png'],
            'live_url' => $this->faker->url(),
            'repo_url' => null,
            'featured' => false,
        ];
    }

    public function draft(): static
    {
        return $this->state(['status' => ProjectStatus::Brouillon]);
    }

    public function featured(): static
    {
        return $this->state(['featured' => true]);
    }
}
