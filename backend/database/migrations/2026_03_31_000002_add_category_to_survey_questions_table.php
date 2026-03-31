<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Delete all old survey responses and questions to prevent data integrity issues
        // with the new 1-4 scale
        DB::table('survey_responses')->truncate();
        DB::table('survey_questions')->delete(); // Using delete to avoid foreign key constraints issues if any, or disable checks.

        // 2. Add the category column
        Schema::table('survey_questions', function (Blueprint $table) {
            $table->enum('category', ['afektif', 'psikomotorik'])->default('afektif')->after('question_text');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('survey_questions', function (Blueprint $table) {
            $table->dropColumn('category');
        });
    }
};
