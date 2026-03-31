<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('game_scores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('observer_id')->constrained('users')->onDelete('cascade');
            $table->integer('score'); // 1-100
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('practice_scores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('observer_id')->constrained('users')->onDelete('cascade');
            $table->integer('score'); // 1-100
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('rtl_slots', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->time('start_time');
            $table->time('end_time');
            $table->timestamps();
        });

        Schema::create('rtl_questions', function (Blueprint $table) {
            $table->id();
            $table->string('question_text');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('rtl_responses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('question_id')->constrained('rtl_questions')->onDelete('cascade');
            $table->foreignId('slot_id')->constrained('rtl_slots')->onDelete('cascade');
            $table->string('selfie_url')->nullable();
            $table->integer('answer'); // 1-4 scale
            $table->date('date');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rtl_responses');
        Schema::dropIfExists('rtl_questions');
        Schema::dropIfExists('rtl_slots');
        Schema::dropIfExists('practice_scores');
        Schema::dropIfExists('game_scores');
    }
};
