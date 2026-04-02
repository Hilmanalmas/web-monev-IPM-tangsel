<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('game_scores', function (Blueprint $table) {
            $table->unsignedBigInteger('slot_id')->nullable()->after('observer_id');
        });
        Schema::table('practice_scores', function (Blueprint $table) {
            $table->unsignedBigInteger('slot_id')->nullable()->after('observer_id');
        });
        Schema::table('worship_logs', function (Blueprint $table) {
            $table->unsignedBigInteger('slot_id')->nullable()->after('observer_id');
        });
    }

    public function down(): void
    {
        Schema::table('game_scores', function (Blueprint $table) {
            $table->dropColumn('slot_id');
        });
        Schema::table('practice_scores', function (Blueprint $table) {
            $table->dropColumn('slot_id');
        });
        Schema::table('worship_logs', function (Blueprint $table) {
            $table->dropColumn('slot_id');
        });
    }
};
