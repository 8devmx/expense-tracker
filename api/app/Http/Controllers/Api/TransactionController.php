<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use App\Services\GoogleSheetsService;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $settings = $user->settings ?? [];
        
        // Obtener el día de inicio del mes configurado (default: día 1)
        $monthStartDay = $settings['transaction_month_start_day'] ?? 1;
        
        // Obtener mes y año de la navegación
        $month = $request->input('month', now()->month);
        $year = $request->input('year', now()->year);
        
        // Calcular el rango de fechas basado en el día de inicio configurado
        // Si el día de inicio es 25:Febrero va del 25 Ene al 24 Feb
        $targetMonth = Carbon::create($year, $month, 1);
        
        if ($monthStartDay > 1) {
            // Inicio: día X del mes anterior
            if ($month === 1) {
                $startDate = Carbon::create($year - 1, 12, $monthStartDay)->startOfDay();
            } else {
                $startDate = Carbon::create($year, $month - 1, $monthStartDay)->startOfDay();
            }
            // Fin: día (X-1) del mes actual
            $endDate = Carbon::create($year, $month, $monthStartDay - 1)->endOfDay();
        // Por defecto: mes completo
 } else {
                       $startDate = $targetMonth->copy()->startOfMonth();
            $endDate = $targetMonth->copy()->endOfMonth();
        }

        // Obtener las transacciones base (recurrentes y no recurrentes)
        $allTransactions = $user->transactions()->with('category')->get();

        $finalTransactions = collect();

        foreach ($allTransactions as $transaction) {
            // Es una transacción no recurrente
            if (is_null($transaction->repeat_frequency) || $transaction->repeat_frequency === 'none') {
                if (Carbon::parse($transaction->date)->between($startDate, $endDate)) {
                    $finalTransactions->push($transaction);
                }
            }
            // Es una transacción recurrente
            else {
                $transactionStartDate = Carbon::parse($transaction->date)->startOfDay();
                $repeatEndDate = $transaction->repeat_end_date ? Carbon::parse($transaction->repeat_end_date)->endOfDay() : null;

                // Si la fecha de inicio es después del rango que estamos viendo, la saltamos
                if ($transactionStartDate->isAfter($endDate)) {
                    continue;
                }

                // La fecha inicial para la repetición
                $currentRepeatDate = $transactionStartDate;

                while (($repeatEndDate === null || $currentRepeatDate->isBefore($repeatEndDate) || $currentRepeatDate->isSameDay($repeatEndDate))) {
                    // Si la repetición cae en el rango que estamos visualizando
                    if ($currentRepeatDate->between($startDate, $endDate)) {
                        $finalTransactions->push((object) [
                            'id' => $transaction->id,
                            'description' => $transaction->description,
                            'amount' => $transaction->amount,
                            'type' => $transaction->type,
                            'date' => $currentRepeatDate->copy(),
                            'category_id' => $transaction->category_id,
                            'category' => $transaction->category,
                            'repeat_frequency' => $transaction->repeat_frequency,
                            'repeat_end_date' => $transaction->repeat_end_date,
                        ]);
                    }

                    // Movemos la fecha de repetición al siguiente periodo
                    switch ($transaction->repeat_frequency) {
                        case 'daily':
                            $currentRepeatDate->addDay();
                            break;
                        case 'weekly':
                            $currentRepeatDate->addWeek();
                            break;
                        case 'biweekly':
                            $currentRepeatDate->addWeeks(2);
                            break;
                        case 'monthly':
                            $currentRepeatDate->addMonth();
                            break;
                        case 'bimonthly':
                            $currentRepeatDate->addMonths(2);
                            break;
                    }

                    // Si ya pasamos el rango actual y no tiene una fecha de fin, no seguimos generando
                    if ($currentRepeatDate->isAfter($endDate) && $repeatEndDate === null) {
                        break;
                    }
                }
            }
        }

        $sortedTransactions = $finalTransactions->sortBy('date')->values();
        return response()->json($sortedTransactions);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'description' => 'required|string|max:255',
            'amount' => 'required|numeric',
            'type' => 'required|in:income,expense',
            'date' => 'required|date',
            'repeat_frequency' => 'nullable|in:none,daily,weekly,biweekly,monthly,bimonthly',
            'category_id' => 'required|exists:categories,id',
            'repeat_end_date' => 'nullable|date|after:date',
        ]);

        if ($validated['repeat_frequency'] === 'none') {
            $validated['repeat_end_date'] = null;
        }

        $transaction = Auth::user()->transactions()->create($validated);
        return response()->json($transaction, 201);
    }

    public function show(Transaction $transaction)
    {
        if ($transaction->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        return response()->json($transaction->load('category'));
    }

    public function update(Request $request, Transaction $transaction)
    {
        if ($transaction->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'description' => 'required|string|max:255',
            'amount' => 'required|numeric',
            'type' => 'required|in:income,expense',
            'date' => 'required|date',
            'repeat_frequency' => 'nullable|in:none,daily,weekly,biweekly,monthly,bimonthly',
            'category_id' => 'required|exists:categories,id',
            'repeat_end_date' => 'nullable|date|after:date',
        ]);

        if ($validated['repeat_frequency'] === 'none') {
            $validated['repeat_end_date'] = null;
        }

        $transaction->update($validated);
        return response()->json($transaction->load('category'));
    }

    public function destroy(Transaction $transaction)
    {
        if ($transaction->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $transaction->delete();
        return response()->json(null, 204);
    }

    public function exportToGoogleSheets(Request $request, GoogleSheetsService $googleSheetsService)
    {
        try {
            $startOfYear = Carbon::now()->startOfYear();
            $endOfYear = Carbon::now()->endOfYear();

            // Obtener todas las transacciones, incluyendo las recurrentes de años anteriores
            $allTransactions = Transaction::with('category')->get();

            $yearlyTransactions = [];

            foreach ($allTransactions as $transaction) {
                // Si la transacción no se repite, la añadimos si está en el año actual
                if (is_null($transaction->repeat_frequency) || $transaction->repeat_frequency === 'none') {
                    if ($transaction->created_at->between($startOfYear, $endOfYear)) {
                        $yearlyTransactions[] = $transaction;
                    }
                    continue;
                }

                // Si la transacción se repite, generamos sus ocurrencias para el año
                $currentDate = Carbon::parse($transaction->created_at);

                while ($currentDate->lessThanOrEqualTo($endOfYear)) {
                    // Solo añadimos las transacciones que caen en el año actual
                    if ($currentDate->between($startOfYear, $endOfYear)) {
                        $newTransaction = $transaction->replicate();
                        $newTransaction->created_at = $currentDate->copy(); // Clona el objeto Carbon
                        $yearlyTransactions[] = $newTransaction;
                    }

                    // Avanzar a la siguiente fecha según la frecuencia
                    switch ($transaction->repeat_frequency) {
                        case 'weekly':
                            $currentDate->addWeek();
                            break;
                        case 'monthly':
                            $currentDate->addMonth();
                            break;
                        case 'yearly':
                            $currentDate->addYear();
                            break;
                    }
                }
            }

            // Ordenar todas las transacciones por fecha antes de exportar
            usort($yearlyTransactions, function ($a, $b) {
                return $a->created_at <=> $b->created_at;
            });

            // Preparar los datos finales para la exportación a Google Sheets
            $dataToExport = [['Fecha', 'Tipo', 'Categoría', 'Monto', 'Descripción']];

            foreach ($yearlyTransactions as $transaction) {
                $dataToExport[] = [
                    $transaction->created_at->format('Y-m-d'),
                    $transaction->type,
                    $transaction->category->name ?? 'Sin Categoría',
                    $transaction->amount,
                    $transaction->description,
                ];
            }

            $googleSheetsService->appendSheet('Hoja 1', $dataToExport);

            return response()->json(['message' => 'Transacciones del año actual exportadas con éxito.']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Hubo un error al exportar: ' . $e->getMessage()], 500);
        }
    }
}
