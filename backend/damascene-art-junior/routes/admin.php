<?php

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {
    Route::get('/admin/dashboard', function () {
        $user = Auth::user();
        if ($user->type !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json([
            'message' => 'Admin route accessed',
            'user' => $user,
        ]);
    });
});
