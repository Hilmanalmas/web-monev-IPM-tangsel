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
        Schema::create('manual_score_overrides', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->decimal('manito_afektif', 5, 2)->nullable();
            $table->decimal('absensi', 5, 2)->nullable();
            $table->decimal('manito_psiko', 5, 2)->nullable();
            $table->decimal('games', 5, 2)->nullable();
            $table->decimal('praktek', 5, 2)->nullable();
            $table->decimal('kognitif', 5, 2)->nullable();
            $table->decimal('ibadah', 5, 2)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('manual_score_overrides');
    }
};
