<?php
namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\AttendanceSlot;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class AttendanceController extends Controller
{
    public function availableSlots() {
        $now = now()->setTimezone('Asia/Jakarta')->format('H:i');
        $slots = AttendanceSlot::all()->map(function($slot) use ($now) {
            $isOpen = $now >= $slot->start_time && $now <= $slot->end_time;
            $isFilled = Attendance::where('user_id', Auth::id())
                ->where('slot_id', $slot->id)
                ->whereDate('recorded_at', today())
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

        // Check if already checked in today for this slot
        $alreadyAttended = Attendance::where('user_id', $user->id)
            ->where('slot_id', $slot->id)
            ->whereDate('recorded_at', Carbon::today())
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
            
            $fileName = Str::uuid() . '.' . $type;
            $path = 'public/selfies/' . $fileName;
            
            Storage::put($path, $imageData);
            
            $attendance = Attendance::create([
                'user_id' => $user->id,
                'slot_id' => $slot->id,
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
        // For admin/observer monitoring or personal history
        $attendances = Attendance::with('user:id,name,role,asal_instansi')
            ->orderBy('recorded_at', 'desc')
            ->get();
            
        return response()->json(['attendances' => $attendances]);
    }
}
