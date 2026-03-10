<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB; // No olvides importar la clase DB

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Modifica la columna para agregar 'none' a la lista de ENUM
        DB::statement("ALTER TABLE transactions MODIFY COLUMN repeat_frequency ENUM('none', 'daily', 'weekly', 'monthly', 'bimonthly') NULL");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Al revertir la migración, eliminamos 'none' de la lista
        DB::statement("ALTER TABLE transactions MODIFY COLUMN repeat_frequency ENUM('daily', 'weekly', 'monthly', 'bimonthly') NULL");
    }
};
