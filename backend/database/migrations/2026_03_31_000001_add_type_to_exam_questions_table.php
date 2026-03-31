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
        Schema::table('exam_questions', function (Blueprint $table) {
            $table->string('type')->default('pg')->after('exam_id'); // pg, essay
            $table->string('correct_answer', 10)->nullable()->change();
            $table->json('options')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('exam_questions', function (Blueprint $table) {
            $table->dropColumn('type');
            $table->string('correct_answer', 10)->nullable(false)->change();
            $table->json('options')->nullable(false)->change();
        });
    }
};
