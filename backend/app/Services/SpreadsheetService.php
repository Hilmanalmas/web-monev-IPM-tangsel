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
    public static function postScore($data, $sheetName = 'Input_Nilai')
    {
        $url = config('spreadsheet.webhook_url');
        
        // Pilih URL khusus RTL jika sheet_name adalah RTL dan URL-nya tersedia
        if ($sheetName === 'RTL' && !empty(config('spreadsheet.webhook_rtl'))) {
            $url = config('spreadsheet.webhook_rtl');
        }

        if (empty($url)) {
            return;
        }

        try {
            $payload = [
                'timestamp' => now()->format('d/m/Y H:i:s'),
                'sheet_name' => $sheetName,
                ...$data
            ];

            Http::timeout(5)->post($url, $payload);

        } catch (\Exception $e) {
            Log::error("Failed to send data to Spreadsheet: " . $e->getMessage());
        }
    }

    /**
     * Mengirimkan data dalam jumlah besar sekaligus (Batch) untuk mencegah timeout
     */
    public static function postBatch($collection, $sheetName = 'Input_Nilai')
    {
        $url = config('spreadsheet.webhook_url');
        if ($sheetName === 'RTL' && !empty(config('spreadsheet.webhook_rtl'))) {
            $url = config('spreadsheet.webhook_rtl');
        }

        if (empty($url) || empty($collection)) {
            return;
        }

        try {
            $timestamp = now()->format('d/m/Y H:i:s');
            $payload = array_map(function ($item) use ($timestamp, $sheetName) {
                return array_merge($item, [
                    'timestamp' => $timestamp,
                    'sheet_name' => $sheetName
                ]);
            }, $collection);

            Http::timeout(30)->post($url, $payload);
        } catch (\Exception $e) {
            Log::error("Failed to send BATCH to Spreadsheet: " . $e->getMessage());
        }
    }

    /**
     * Menghapus seluruh isi data di Spreadsheet (kecuali Header)
     */
    public static function clearAll()
    {
        $url = config('spreadsheet.webhook_url');
        if (empty($url)) {
            return;
        }

        try {
            Http::timeout(30)->post($url, ['action' => 'clear_all']);
        } catch (\Exception $e) {
            Log::error("Failed to CLEAR Spreadsheet: " . $e->getMessage());
        }
    }
}
