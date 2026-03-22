<?php
namespace App\Http\Middleware;
use Closure;
use Illuminate\Http\Request;

class ObserverMiddleware {
    public function handle(Request $request, Closure $next) {
        if ($request->user() && ($request->user()->role === 'observer' || $request->user()->role === 'admin')) {
            return $next($request);
        }
        return response()->json(['message' => 'Akses ditolak. Fitur ini khusus Pengawas Tersembunyi!'], 403);
    }
}
