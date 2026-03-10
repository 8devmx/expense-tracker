<?php

namespace App\Services;

use App\Models\User;
use App\Models\Category;

class CategoryService
{
  /**
   * Asigna las categorías por defecto (ingresos y gastos) a un usuario.
   *
   * @param \App\Models\User $user
   * @return void
   */
  public function assignDefaultCategories(User $user): void
  {
    $defaultCategories = [
      // Categorías de Gastos
      [
        'name' => 'Comidas',
        'emoji' => '🍔',
        'color' => 'oklch(70% 0.15 45)',
        'type' => 'expense',
      ],
      [
        'name' => 'Gastos Fijos',
        'emoji' => '🗓️',
        'color' => 'oklch(60% 0.05 240)',
        'type' => 'expense',
      ],
      [
        'name' => 'Innecesarios',
        'emoji' => '🛍️',
        'color' => 'oklch(80% 0.2 300)',
        'type' => 'expense',
      ],
      [
        'name' => 'General',
        'emoji' => '📝',
        'color' => 'oklch(75% 0.05 100)',
        'type' => 'expense',
      ],
      [
        'name' => 'Entretenimiento',
        'emoji' => '🎬',
        'color' => 'oklch(50% 0.2 280)',
        'type' => 'expense',
      ],
      [
        'name' => 'Despensa',
        'emoji' => '🥦',
        'color' => 'oklch(65% 0.18 120)',
        'type' => 'expense',
      ],
      [
        'name' => 'Gasolina',
        'emoji' => '⛽',
        'color' => 'oklch(55% 0.18 60)',
        'type' => 'expense',
      ],
      [
        'name' => 'No Identificados',
        'emoji' => '❓',
        'color' => 'oklch(40% 0.01 0)',
        'type' => 'expense',
      ],
      [
        'name' => 'Cerveza',
        'emoji' => '🍺',
        'color' => 'oklch(45% 0.18 80)',
        'type' => 'expense',
      ],

      // Categorías de Ingresos
      [
        'name' => 'Salario',
        'emoji' => '💰',
        'color' => 'oklch(55% 0.15 150)',
        'type' => 'income',
      ],
      [
        'name' => 'Extras',
        'emoji' => '🎁',
        'color' => 'oklch(80% 0.25 210)',
        'type' => 'income',
      ],
    ];

    foreach ($defaultCategories as $categoryData) {
      $user->categories()->firstOrCreate($categoryData);
    }
  }
}
