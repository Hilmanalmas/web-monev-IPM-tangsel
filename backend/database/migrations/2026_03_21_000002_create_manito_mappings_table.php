<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('manito_mappings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('assessor_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('target_id')->constrained('users')->onDelete('cascade');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('manito_mappings');
    }
};
