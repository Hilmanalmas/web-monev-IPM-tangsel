<?php
namespace App\Http\Controllers;

use App\Models\User;
use App\Models\ManitoMapping;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminUsersController extends Controller {
    public function users() {
        $users = User::select('id', 'name', 'username', 'role', 'nip', 'asal_instansi')->get();
        $mappings = ManitoMapping::where('is_active', true)->with('target')->get()->keyBy('assessor_id');

        $result = $users->map(function($user) use ($mappings) {
            $target = $mappings->has($user->id) ? $mappings[$user->id]->target : null;
            return [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'role' => $user->role,
                'nip' => $user->nip,
                'instansi' => $user->asal_instansi,
                'target_name' => $target ? $target->name : ($user->role === 'peserta' ? 'Belum Ada Target' : '-'),
                'target_id' => $target ? $target->id : null,
            ];
        });

        return response()->json(['users' => $result]);
    }

    public function storeUser(Request $request) {
        $data = $request->validate([
            'name' => 'required|string',
            'username' => 'required|string|unique:users',
            'password' => 'required|string',
            'role' => 'required|in:admin,observer,peserta',
            'nip' => 'nullable|string',
            'asal_instansi' => 'nullable|string'
        ]);

        $data['password'] = Hash::make($data['password']);
        $user = User::create($data);

        return response()->json(['message' => 'User created successfully', 'user' => $user], 201);
    }

    public function destroyUser($id) {
        User::findOrFail($id)->delete();
        return response()->json(['message' => 'User deleted successfully']);
    }
}
