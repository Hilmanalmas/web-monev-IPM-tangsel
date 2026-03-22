<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Carbon\Carbon;

class AttendanceController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'image' => 'required|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'timestamp' => 'nullable|string',
        ]);

        $user = $request->user();

        // Check if already checked in today
        $alreadyAttended = Attendance::where('user_id', $user->id)
            ->whereDate('recorded_at', Carbon::today())
            ->exists();

        if ($alreadyAttended) {
            return response()->json(['message' => 'Anda sudah melakukan absensi hari ini.'], 400);
        }

        // Handle Base64 Image
        $imageData = $request->image;
        if (preg_match('/^data:image\/(\w+);base64,/', $imageData, $type)) {
            $imageData = substr($imageData, strpos($imageData, ',') + 1);
            $type = strtolower($type[1]); // jpg, png, gif
            
            if (!in_array($type, [ 'jpg', 'jpeg', 'gif', 'png' ])) {
                return response()->json(['message' => 'Format gambar tidak valid.'], 400);
            }
            
            $imageData = base64_decode($imageData);
            if ($imageData === false) {
                 return response()->json(['message' => 'Gagal membaca data gambar.'], 400);
            }
            
            $fileName = Str::uuid() . '.' . $type;
            $path = 'public/selfies/' . $fileName;
            
            Storage::put($path, $imageData);
            
            $attendance = Attendance::create([
                'user_id' => $user->id,
                'selfie_url' => str_replace('public/', 'storage/', $path),
                'latitude' => $request->latitude,
                'longitude' => $request->longitude,
                'recorded_at' => $request->timestamp ? Carbon::parse($request->timestamp)->setTimezone(config('app.timezone')) : now(),
            ]);

            return response()->json([
                'message' => 'Absensi berhasil direkam!',
                'attendance' => $attendance
            ], 201);
            
        } else {
             return response()->json(['message' => 'Mohon ambil foto selfie melalui aplikasi.'], 400);
        }
    }

    public function index(Request $request)
    {
        // For admin/observer monitoring
        $attendances = Attendance::with('user:id,name,role,asal_instansi')
            ->orderBy('recorded_at', 'desc')
            ->get();
            
        return response()->json(['attendances' => $attendances]);
    }
}
