<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('exams', function (Blueprint $table) {
            if (!Schema::hasColumn('exams', 'day')) {
                $table->integer('day')->default(1)->after('id');
            }
            $table->string('type')->default('test')->after('title'); // 'test' or 'archetype'
            $table->boolean('show_result')->default(true)->after('duration_minutes');
        });

        Schema::table('exam_questions', function (Blueprint $table) {
            $table->json('weights')->nullable()->after('options'); // e.g. {"A": 4, "B": 3, "C": 2, "D": 1}
        });

        Schema::table('exam_submissions', function (Blueprint $table) {
            if (!Schema::hasColumn('exam_submissions', 'day')) {
                $table->integer('day')->default(1)->after('id');
            }
            $table->string('archetype')->nullable()->after('score');
        });
    }

    public function down(): void
    {
        Schema::table('exams', function (Blueprint $table) {
            $table->dropColumn(['day', 'type', 'show_result']);
        });
        Schema::table('exam_questions', function (Blueprint $table) {
            $table->dropColumn('weights');
        });
        Schema::table('exam_submissions', function (Blueprint $table) {
            $table->dropColumn(['day', 'archetype']);
        });
    }
};
