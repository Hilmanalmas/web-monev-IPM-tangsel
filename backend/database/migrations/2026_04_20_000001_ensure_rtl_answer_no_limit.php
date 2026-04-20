<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Force change answer to longText to remove any character limits.
     */
    public function up(): void
    {
        Schema::table('rtl_responses', function (Blueprint $table) {
            $table->longText('answer')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rtl_responses', function (Blueprint $table) {
            $table->text('answer')->change();
        });
    }
};
