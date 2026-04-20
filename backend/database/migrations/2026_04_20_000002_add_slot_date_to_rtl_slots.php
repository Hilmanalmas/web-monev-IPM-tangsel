<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('rtl_slots', function (Blueprint $table) {
            $table->date('slot_date')->nullable()->after('day');
        });
    }

    public function down(): void
    {
        Schema::table('rtl_slots', function (Blueprint $table) {
            $table->dropColumn('slot_date');
        });
    }
};
