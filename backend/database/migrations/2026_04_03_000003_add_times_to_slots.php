<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('worship_slots', function (Blueprint $table) {
            if (!Schema::hasColumn('worship_slots', 'start_time')) {
                $table->time('start_time')->nullable()->after('name');
            }
            if (!Schema::hasColumn('worship_slots', 'end_time')) {
                $table->time('end_time')->nullable()->after('start_time');
            }
        });

        Schema::table('game_slots', function (Blueprint $table) {
            if (!Schema::hasColumn('game_slots', 'start_time')) {
                $table->time('start_time')->nullable()->after('name');
            }
            if (!Schema::hasColumn('game_slots', 'end_time')) {
                $table->time('end_time')->nullable()->after('start_time');
            }
        });

        Schema::table('practice_slots', function (Blueprint $table) {
            if (!Schema::hasColumn('practice_slots', 'start_time')) {
                $table->time('start_time')->nullable()->after('name');
            }
            if (!Schema::hasColumn('practice_slots', 'end_time')) {
                $table->time('end_time')->nullable()->after('start_time');
            }
        });
    }

    public function down(): void
    {
        Schema::table('worship_slots', function (Blueprint $table) {
            if (Schema::hasColumn('worship_slots', 'start_time')) {
                $table->dropColumn(['start_time', 'end_time']);
            }
        });
        Schema::table('game_slots', function (Blueprint $table) {
            if (Schema::hasColumn('game_slots', 'start_time')) {
                $table->dropColumn(['start_time', 'end_time']);
            }
        });
        Schema::table('practice_slots', function (Blueprint $table) {
            if (Schema::hasColumn('practice_slots', 'start_time')) {
                $table->dropColumn(['start_time', 'end_time']);
            }
        });
    }
};
