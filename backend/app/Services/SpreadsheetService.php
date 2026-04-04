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
    const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbytwqBaWWWoasiXiuo130QuqIfgrD1Up7R8agRgtvmG2ZN7lvMw17f7rLX8XuHyDOHZSQ/exec';

    /**
     * Mengirimkan data nilai ke Spreadsheet secara Real-time
     */
    public static function postScore($data, $sheetName = 'Input_Nilai')
    {
        if (empty(self::WEBHOOK_URL)) {
            return;
        }

        try {
            $payload = [
                'timestamp' => now()->format('d/m/Y H:i:s'),
                'sheet_name' => $sheetName,
                ...$data
            ];

            Http::timeout(5)->post(self::WEBHOOK_URL, $payload);

        } catch (\Exception $e) {
            Log::error("Failed to send data to Spreadsheet: " . $e->getMessage());
        }
    }

    /**
     * Mengirimkan data dalam jumlah besar sekaligus (Batch) untuk mencegah timeout
     */
    public static function postBatch($collection, $sheetName = 'Input_Nilai')
    {
        if (empty(self::WEBHOOK_URL) || empty($collection)) {
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

            Http::timeout(30)->post(self::WEBHOOK_URL, $payload);
        } catch (\Exception $e) {
            Log::error("Failed to send BATCH to Spreadsheet: " . $e->getMessage());
        }
    }

    /**
     * Menghapus seluruh isi data di Spreadsheet (kecuali Header)
     */
    public static function clearAll()
    {
        if (empty(self::WEBHOOK_URL)) {
            return;
        }

        try {
            Http::timeout(30)->post(self::WEBHOOK_URL, ['action' => 'clear_all']);
        } catch (\Exception $e) {
            Log::error("Failed to CLEAR Spreadsheet: " . $e->getMessage());
        }
    }
}
