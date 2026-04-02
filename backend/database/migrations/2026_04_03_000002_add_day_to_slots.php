<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add day to existing slot tables
        $slotTables = [
            'attendance_slots',
            'survey_slots',
            'worship_slots',
            'rtl_slots'
        ];

        foreach ($slotTables as $table) {
            if (Schema::hasTable($table)) {
                Schema::table($table, function (Blueprint $table) {
                    $table->integer('day')->default(1)->after('id');
                });
            }
        }

        // Create game_slots table
        Schema::create('game_slots', function (Blueprint $table) {
            $table->id();
            $table->integer('day')->default(1);
            $table->string('name');
            $table->timestamps();
        });

        // Create practice_slots table
        Schema::create('practice_slots', function (Blueprint $table) {
            $table->id();
            $table->integer('day')->default(1);
            $table->string('name');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        $slotTables = [
            'attendance_slots',
            'survey_slots',
            'worship_slots',
            'rtl_slots'
        ];

        foreach ($slotTables as $table) {
            if (Schema::hasTable($table)) {
                Schema::table($table, function (Blueprint $table) {
                    $table->dropColumn('day');
                });
            }
        }

        Schema::dropIfExists('game_slots');
        Schema::dropIfExists('practice_slots');
    }
};
