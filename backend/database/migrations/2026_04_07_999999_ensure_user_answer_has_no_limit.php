<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Force change user_answer to longText to remove any character limits.
     */
    public function up(): void
    {
        Schema::table('exam_answers', function (Blueprint $table) {
            // Using raw statement to be sure across different database drivers if necessary
            $table->longText('user_answer')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('exam_answers', function (Blueprint $table) {
            $table->text('user_answer')->change();
        });
    }
};
