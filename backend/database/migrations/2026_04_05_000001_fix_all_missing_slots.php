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
        // 1. Ensure attendance_slots exists
        if (!Schema::hasTable('attendance_slots')) {
            Schema::create('attendance_slots', function (Blueprint $table) {
                $table->id();
                $table->integer('day')->default(1);
                $table->string('name');
                $table->time('start_time')->default('08:00');
                $table->time('end_time')->default('23:59');
                $table->timestamps();
            });
        }

        // 2. Ensure worship_slots exists
        if (!Schema::hasTable('worship_slots')) {
            Schema::create('worship_slots', function (Blueprint $table) {
                $table->id();
                $table->integer('day')->default(1);
                $table->string('name');
                $table->time('start_time')->default('04:00');
                $table->time('end_time')->default('23:00');
                $table->timestamps();
            });
        }

        // 3. Ensure game_slots exists
        if (!Schema::hasTable('game_slots')) {
            Schema::create('game_slots', function (Blueprint $table) {
                $table->id();
                $table->integer('day')->default(1);
                $table->string('name');
                $table->time('start_time')->default('08:00');
                $table->time('end_time')->default('23:59');
                $table->timestamps();
            });
        }

        // 4. Ensure practice_slots exists
        if (!Schema::hasTable('practice_slots')) {
            Schema::create('practice_slots', function (Blueprint $table) {
                $table->id();
                $table->integer('day')->default(1);
                $table->string('name');
                $table->time('start_time')->default('08:00');
                $table->time('end_time')->default('23:59');
                $table->timestamps();
            });
        }

        // 5. Ensure survey_slots has day column
        if (Schema::hasTable('survey_slots')) {
            Schema::table('survey_slots', function (Blueprint $table) {
                if (!Schema::hasColumn('survey_slots', 'day')) {
                    $table->integer('day')->default(1)->after('id');
                }
            });
        }

        // 6. Ensure exams has day column
        if (Schema::hasTable('exams')) {
            Schema::table('exams', function (Blueprint $table) {
                if (!Schema::hasColumn('exams', 'day')) {
                    $table->integer('day')->default(1)->after('id');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('practice_slots');
        Schema::dropIfExists('game_slots');
        Schema::dropIfExists('worship_slots');
        Schema::dropIfExists('attendance_slots');
    }
};
