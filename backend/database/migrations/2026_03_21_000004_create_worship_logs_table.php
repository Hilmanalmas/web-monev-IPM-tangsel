<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('worship_slots', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g., Hari 1, Subuh Hari 2
            $table->timestamps();
        });

        Schema::create('worship_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('observer_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('slot_id')->constrained('worship_slots')->onDelete('cascade');
            $table->integer('score')->default(0); // 1-100
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('worship_logs');
        Schema::dropIfExists('worship_slots');
    }
};
