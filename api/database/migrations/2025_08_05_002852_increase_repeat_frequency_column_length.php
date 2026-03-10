<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB; // <-- Importamos la fachada de DB

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Verificamos si la columna existe antes de modificarla
        if (Schema::hasColumn('transactions', 'repeat_frequency')) {
            // Usamos SQL nativo para modificar la columna
            DB::statement('ALTER TABLE transactions MODIFY repeat_frequency VARCHAR(20)');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('transactions', 'repeat_frequency')) {
            // Revertimos el cambio. Aquí asumimos que la longitud original era 10,
            // si no, ajusta el valor según la configuración original de tu tabla.
            DB::statement('ALTER TABLE transactions MODIFY repeat_frequency VARCHAR(10)');
        }
    }
};
