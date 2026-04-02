<?php
namespace App\Http\Controllers;

use App\Models\PracticeSlot;
use Illuminate\Http\Request;

class AdminPracticeController extends Controller {
    public function listSlots() { return response()->json(PracticeSlot::all()); }
    
    public function storeSlot(Request $request) {
        $data = $request->validate([
            'name' => 'required|string',
            'day' => 'required|integer',
            'start_time' => 'required',
            'end_time' => 'required'
        ]);
        return response()->json(PracticeSlot::create($data));
    }

    public function destroySlot($id) {
        PracticeSlot::findOrFail($id)->delete();
        return response()->json(['message' => 'Slot deleted']);
    }
}
