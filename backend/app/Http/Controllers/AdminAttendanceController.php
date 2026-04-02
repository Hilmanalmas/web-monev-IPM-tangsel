<?php
namespace App\Http\Controllers;

use App\Models\AttendanceSlot;
use Illuminate\Http\Request;

class AdminAttendanceController extends Controller {
    public function listSlots() { return response()->json(AttendanceSlot::all()); }
    
    public function storeSlot(Request $request) {
        $data = $request->validate([
            'name' => 'required|string',
            'start_time' => 'required',
            'end_time' => 'required',
            'day' => 'required|integer'
        ]);
        return response()->json(AttendanceSlot::create($data));
    }

    public function destroySlot($id) {
        AttendanceSlot::findOrFail($id)->delete();
        return response()->json(['message' => 'Slot deleted']);
    }
}
