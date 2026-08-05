<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class TokenFromQuery
{
    public function handle(Request $request, Closure $next)
    {
        if ($request->has('bearer') && !$request->bearerToken()) {
            $request->headers->set('Authorization', 'Bearer ' . $request->query('bearer'));
        }
        return $next($request);
    }
}
