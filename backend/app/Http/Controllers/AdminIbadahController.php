<?php
namespace App\Http\Controllers;

use App\Models\WorshipSlot;
use Illuminate\Http\Request;

class AdminIbadahController extends Controller {
    public function listSlots() { return response()->json(WorshipSlot::all()); }
    
    public function storeSlot(Request $request) {
        $data = $request->validate([
            'name' => 'required|string'
        ]);
        return response()->json(WorshipSlot::create($data));
    }

    public function destroySlot($id) {
        WorshipSlot::findOrFail($id)->delete();
        return response()->json(['message' => 'Slot deleted']);
    }
}
