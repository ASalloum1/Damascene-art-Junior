<?php

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {
    Route::get('/store-manager/dashboard', function () {
        $user = Auth::user();
        if ($user->type !== 'store_manager') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json([
            'message' => 'Store manager route accessed',
            'user' => $user,
        ]);
    });
});
