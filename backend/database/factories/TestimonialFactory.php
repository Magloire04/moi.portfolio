<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class TestimonialFactory extends Factory
{
    public function definition(): array
    {
        return [
            'author_name' => $this->faker->name(),
            'author_role' => $this->faker->jobTitle(),
            'author_company' => $this->faker->company(),
            'quote_fr' => $this->faker->paragraph(),
            'quote_en' => $this->faker->paragraph(),
            'visible' => true,
        ];
    }
}
