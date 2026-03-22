<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Add Admin
        User::firstOrCreate(['email' => 'admin@example.com'], [
            'name' => 'Super Admin',
            'role' => 'admin',
            'password' => Hash::make('password'),
            'nip' => 'ADM-001',
            'asal_instansi' => 'Pusat'
        ]);

        // Add 3 Pesertas for Manito Shuffling
        for ($i = 1; $i <= 3; $i++) {
            User::firstOrCreate(['email' => "peserta{$i}@example.com"], [
                'name' => "Peserta {$i}",
                'role' => 'peserta',
                'password' => Hash::make('password'),
                'nip' => "PST-00{$i}",
                'asal_instansi' => "Cabang {$i}"
            ]);
        }
        
        // Add 1 Observer
        User::firstOrCreate(['email' => "observer@example.com"], [
            'name' => "Official Observer",
            'role' => 'observer',
            'password' => Hash::make('password'),
            'nip' => "OBS-001",
            'asal_instansi' => "Pusat"
        ]);
    }
}
