<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $income = $user->transactions()->where('type', 'income')->sum('amount');
        $expenses = $user->transactions()->where('type', 'expense')->sum('amount');
        $balance = $income - $expenses;

        $income_by_category = $user->transactions()
            ->where('type', 'income')
            ->with('category')
            ->selectRaw('category_id, sum(amount) as total')
            ->groupBy('category_id')
            ->get()
            ->map(function ($item) {
                return [
                    'category_name' => $item->category->name,
                    'color' => $item->category->color,
                    'emoji' => $item->category->emoji,
                    'total' => $item->total,
                ];
            });

        $expenses_by_category = $user->transactions()
            ->where('type', 'expense')
            ->with('category')
            ->selectRaw('category_id, sum(amount) as total')
            ->groupBy('category_id')
            ->get()
            ->map(function ($item) {
                return [
                    'category_name' => $item->category->name,
                    'color' => $item->category->color,
                    'emoji' => $item->category->emoji,
                    'total' => $item->total,
                ];
            });

        return response()->json([
            'balance' => $balance,
            'income' => $income,
            'expenses' => $expenses,
            'income_by_category' => $income_by_category,
            'expenses_by_category' => $expenses_by_category,
        ]);
    }
}
