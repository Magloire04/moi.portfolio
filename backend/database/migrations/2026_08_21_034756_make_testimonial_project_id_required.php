<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Testimonials are only ever exposed nested inside a project's `show`
     * response — there is no standalone testimonials endpoint. A testimonial
     * with no project (or whose project was deleted, since the original
     * column used nullOnDelete()) becomes permanently unreachable by any
     * consumer. Per the controller's ruling, the project relation is made
     * mandatory rather than adding new API surface for orphaned testimonials.
     */
    public function up(): void
    {
        // Defensive: drop any pre-existing orphaned rows so the NOT NULL
        // constraint below can never fail against real data. There is no
        // way to recover a project association for these anyway, and this
        // codebase has not shipped yet.
        DB::table('testimonials')->whereNull('project_id')->delete();

        Schema::table('testimonials', function (Blueprint $table) {
            $table->dropForeign(['project_id']);
        });

        Schema::table('testimonials', function (Blueprint $table) {
            $table->unsignedBigInteger('project_id')->nullable(false)->change();
        });

        Schema::table('testimonials', function (Blueprint $table) {
            $table->foreign('project_id')->references('id')->on('projects')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('testimonials', function (Blueprint $table) {
            $table->dropForeign(['project_id']);
        });

        Schema::table('testimonials', function (Blueprint $table) {
            $table->unsignedBigInteger('project_id')->nullable()->change();
        });

        Schema::table('testimonials', function (Blueprint $table) {
            $table->foreign('project_id')->references('id')->on('projects')->nullOnDelete();
        });
    }
};
