<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('category');
            $table->string('status')->default('brouillon');
            $table->string('title_fr');
            $table->string('title_en');
            $table->string('tagline_fr');
            $table->string('tagline_en');
            $table->text('summary_fr');
            $table->text('summary_en');
            $table->longText('body_fr');
            $table->longText('body_en');
            $table->string('client_name')->nullable();
            $table->boolean('client_display')->default(false);
            $table->json('stack')->nullable();
            $table->string('role')->nullable();
            $table->json('screenshots')->nullable();
            $table->string('live_url')->nullable();
            $table->string('repo_url')->nullable();
            $table->boolean('featured')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
