<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cognitive_scores', function (Blueprint $table) {
            // Add day if it doesn't exist
            if (!Schema::hasColumn('cognitive_scores', 'day')) {
                $table->integer('day')->default(1)->after('id');
            }
            
            // Make exam_submission_id nullable to allow manual score input
            $table->unsignedBigInteger('exam_submission_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('cognitive_scores', function (Blueprint $table) {
            if (Schema::hasColumn('cognitive_scores', 'day')) {
                $table->dropColumn('day');
            }
            $table->unsignedBigInteger('exam_submission_id')->nullable(false)->change();
        });
    }
};
