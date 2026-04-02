<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('worship_slots', function (Blueprint $table) {
            $table->time('start_time')->nullable()->after('name');
            $table->time('end_time')->nullable()->after('start_time');
        });

        Schema::table('game_slots', function (Blueprint $table) {
            $table->time('start_time')->nullable()->after('name');
            $table->time('end_time')->nullable()->after('start_time');
        });

        Schema::table('practice_slots', function (Blueprint $table) {
            $table->time('start_time')->nullable()->after('name');
            $table->time('end_time')->nullable()->after('start_time');
        });
    }

    public function down(): void
    {
        Schema::table('worship_slots', function (Blueprint $table) {
            $table->dropColumn(['start_time', 'end_time']);
        });
        Schema::table('game_slots', function (Blueprint $table) {
            $table->dropColumn(['start_time', 'end_time']);
        });
        Schema::table('practice_slots', function (Blueprint $table) {
            $table->dropColumn(['start_time', 'end_time']);
        });
    }
};
