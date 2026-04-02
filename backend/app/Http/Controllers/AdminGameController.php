<?php
namespace App\Http\Controllers;

use App\Models\GameSlot;
use Illuminate\Http\Request;

class AdminGameController extends Controller {
    public function listSlots() { return response()->json(GameSlot::all()); }
    
    public function storeSlot(Request $request) {
        $data = $request->validate([
            'name' => 'required|string',
            'day' => 'required|integer',
            'start_time' => 'required',
            'end_time' => 'required'
        ]);
        return response()->json(GameSlot::create($data));
    }

    public function destroySlot($id) {
        GameSlot::findOrFail($id)->delete();
        return response()->json(['message' => 'Slot deleted']);
    }
}
