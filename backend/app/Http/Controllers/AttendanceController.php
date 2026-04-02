<?php
namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\AttendanceSlot;
use App\Models\AppSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class AttendanceController extends Controller
{
    public function availableSlots() {
        $now = now();
        $slots = AttendanceSlot::all()->map(function($slot) use ($now) {
            $start = \Carbon\Carbon::createFromFormat('H:i:s', $slot->start_time);
            $end = \Carbon\Carbon::createFromFormat('H:i:s', $slot->end_time);
            
            if ($end->lessThanOrEqualTo($start)) {
                $end->addDay();
            }
            
            $isOpen = $now->between($start, $end);
            $currentDay = AppSetting::get('current_day', 1);
            $isFilled = Attendance::where('user_id', Auth::id())
                ->where('slot_id', $slot->id)
                ->where('day', $currentDay)
                ->exists();
            
            return [
                'id' => $slot->id,
                'name' => $slot->name,
                'start_time' => $slot->start_time,
                'end_time' => $slot->end_time,
                'is_open' => $isOpen,
                'is_filled' => $isFilled
            ];
        });
        return response()->json($slots);
    }

    public function store(Request $request)
    {
        $request->validate([
            'image' => 'required|string',
            'slot_name' => 'required|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'timestamp' => 'nullable|string',
        ]);

        $user = Auth::user();
        $slot = AttendanceSlot::where('name', $request->slot_name)->firstOrFail();

        // Check if already checked in for this slot on the current operational day
        $currentDay = AppSetting::get('current_day', 1);
        $alreadyAttended = Attendance::where('user_id', $user->id)
            ->where('slot_id', $slot->id)
            ->where('day', $currentDay)
            ->exists();

        if ($alreadyAttended) {
            return response()->json(['message' => 'Anda sudah melakukan absensi untuk sesi ini hari ini.'], 400);
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
            
            $fileName = 'selfies/' . Str::uuid() . '.' . $type;
            Storage::disk('public')->put($fileName, $imageData);

            // Ensure web server can read the file (fix 403 in Docker environments)
            $fullPath = storage_path('app/public/' . $fileName);
            @chmod($fullPath, 0644);

            $attendance = Attendance::create([
                'user_id' => $user->id,
                'slot_id' => $slot->id,
                'selfie_url' => $fileName,
                'latitude' => $request->latitude,
                'longitude' => $request->longitude,
                'recorded_at' => $request->timestamp ? Carbon::parse($request->timestamp)->setTimezone(config('app.timezone')) : now(),
                'day' => $currentDay,
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
        $day = $request->query('day', AppSetting::get('current_day', 1));
        
        $query = Attendance::with('user:id,name,role,asal_instansi')
            ->orderBy('recorded_at', 'desc');

        if ($day) {
            $query->where('day', $day);
        }
            
        return response()->json(['attendances' => $query->get()]);
    }
}
