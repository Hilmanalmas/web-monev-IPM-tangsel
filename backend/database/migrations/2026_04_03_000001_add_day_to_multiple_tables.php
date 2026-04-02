<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $tables = [
            'attendances',
            'game_scores',
            'practice_scores',
            'worship_logs',
            'survey_responses',
            'manito_mappings',
            'evaluations',
            'rtl_responses'
        ];

        foreach ($tables as $table) {
            if (Schema::hasTable($table)) {
                Schema::table($table, function (Blueprint $table) {
                    $table->integer('day')->default(1)->after('id');
                });
            }
        }

        // Add a global settings table for managing current day
        Schema::create('app_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->string('value')->nullable();
            $table->timestamps();
        });

        // Insert default operational day
        \DB::table('app_settings')->insert([
            'key' => 'current_day',
            'value' => '1',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        $tables = [
            'attendances',
            'game_scores',
            'practice_scores',
            'worship_logs',
            'survey_responses',
            'manito_mappings'
        ];

        foreach ($tables as $table) {
            if (Schema::hasTable($table)) {
                Schema::table($table, function (Blueprint $table) {
                    $table->dropColumn('day');
                });
            }
        }

        Schema::dropIfExists('app_settings');
    }
};
