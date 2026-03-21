<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('evaluations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('assessor_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('target_id')->constrained('users')->onDelete('cascade');
            $table->integer('psychomotor_precision')->default(0);
            $table->integer('psychomotor_efficiency')->default(0);
            $table->integer('psychomotor_independence')->default(0);
            $table->integer('psychomotor_quality')->default(0);
            $table->integer('affective_initiative')->default(0);
            $table->integer('affective_resilience')->default(0);
            $table->integer('affective_ethics')->default(0);
            $table->integer('affective_collaboration')->default(0);
            $table->text('evidence_notes');
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evaluations');
    }
};
