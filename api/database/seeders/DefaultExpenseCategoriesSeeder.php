<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str; // Importa la clase Str para generar strings aleatorios

class DefaultExpenseCategoriesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::first();

        if (!$user) {
            $this->command->info('No se encontró ningún usuario. Creando un usuario por defecto para las categorías.');
            $user = User::create([
                'name' => 'Usuario por Defecto',
                'email' => 'default_user_' . Str::random(5) . '@example.com',
                'password' => Hash::make('password'),
                'profile_picture_url' => 'https://placehold.co/150x150/aabbcc/ffffff?text=DU'
            ]);
            $this->command->info('Usuario por defecto creado con email: ' . $user->email);
        } else {
            $this->command->info('Usando el primer usuario existente (ID: ' . $user->id . ') para asignar las categorías.');
        }

        $categories = [
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

        foreach ($categories as $categoryData) {
            Category::firstOrCreate(
                ['name' => $categoryData['name'], 'user_id' => $user->id],
                array_merge($categoryData, ['user_id' => $user->id])
            );
            $this->command->info('Categoría "' . $categoryData['name'] . '" creada o ya existente para el usuario ' . $user->id);
        }
    }
}
