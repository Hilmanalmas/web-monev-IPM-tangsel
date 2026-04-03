<?php
namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SpreadsheetService
{
    /**
     * URL Webhook Google Apps Script (Sesuai pengaturan kemarin)
     * Silakan isi URL /exec milik Anda di sini.
     */
    const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbwBGgcXj_5TO6XrsphKEmsR936CUT6IJ6TU_9Gl84wy5nbUx2-g9j5QRSjmXQEeR13YZg/exec'; 

    /**
     * Mengirimkan data nilai ke Spreadsheet secara Real-time
     */
    public static function postScore($data, $sheetName = 'Data_Harian')
    {
        if (empty(self::WEBHOOK_URL)) {
            return;
        }

        try {
            // Data format for Spreadsheet
            $payload = [
                'timestamp'  => now()->format('d/m/Y H:i:s'),
                'sheet_name' => $sheetName,
                'name'       => $data['name'] ?? '-',
                'nip'        => $data['nip'] ?? '-',
                'instansi'   => $data['instansi'] ?? '-',
                'category'   => $data['category'] ?? '-', 
                'title'      => $data['title'] ?? '-',   
                'score'      => (string)($data['score'] ?? '0'),
                'notes'      => $data['notes'] ?? '-',
                'day'        => (string)($data['day'] ?? '1')
            ];

            Http::timeout(5)->post(self::WEBHOOK_URL, $payload);
            
        } catch (\Exception $e) {
            Log::error("Failed to send data to Spreadsheet: " . $e->getMessage());
        }
    }
}
