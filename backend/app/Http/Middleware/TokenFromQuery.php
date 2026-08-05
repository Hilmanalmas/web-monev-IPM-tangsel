<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class TokenFromQuery
{
    public function handle(Request $request, Closure $next)
    {
        if ($request->has('bearer') && !$request->bearerToken()) {
            $token = trim($request->query('bearer'), '"\'');
            $request->headers->set('Authorization', 'Bearer ' . $token);
        }
        
        // Force JSON response so unauthenticated errors don't trigger the "login route not defined" 500 error
        if ($request->is('api/admin/reports/export*')) {
            $request->headers->set('Accept', 'application/json');
        }
        return $next($request);
    }
}
