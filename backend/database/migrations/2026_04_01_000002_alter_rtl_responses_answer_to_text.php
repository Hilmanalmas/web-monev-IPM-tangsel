<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Change answer from integer to text for RTL responses (now stores text responses, not 1-4 scale)
        Schema::table('rtl_responses', function (Blueprint $table) {
            $table->text('answer')->change();
        });

        // Change selfie_url to longText to support base64 images
        Schema::table('rtl_responses', function (Blueprint $table) {
            $table->longText('selfie_url')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('rtl_responses', function (Blueprint $table) {
            $table->integer('answer')->change();
        });

        Schema::table('rtl_responses', function (Blueprint $table) {
            $table->string('selfie_url')->nullable()->change();
        });
    }
};
