<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Services\CategoryService;
use Illuminate\Console\Command;

class AssignDefaultCategories extends Command
{
  /**
   * El nombre y la firma del comando de consola.
   *
   * @var string
   */
  protected $signature = 'categories:assign-defaults';

  /**
   * La descripción del comando de consola.
   *
   * @var string
   */
  protected $description = 'Assigns default income and expense categories to all existing users.';

  /**
   * Crea una nueva instancia del comando.
   *
   * @return void
   */
  public function __construct()
  {
    parent::__construct();
  }

  /**
   * Ejecuta el comando de consola.
   *
   * @param \App\Services\CategoryService $categoryService
   * @return int
   */
  public function handle(CategoryService $categoryService)
  {
    $this->info('Starting to assign default categories to all users...');

    $users = User::all();

    if ($users->isEmpty()) {
      $this->warn('No users found in the database. Exiting.');
      return 0;
    }

    foreach ($users as $user) {
      $this->line("Processing user: {$user->email} (ID: {$user->id})...");

      try {
        // Llama a nuestro servicio para asignar las categorías al usuario
        $categoryService->assignDefaultCategories($user);
        $this->info("Successfully assigned categories to {$user->email}.");
      } catch (\Exception $e) {
        $this->error("Failed to assign categories to {$user->email}: " . $e->getMessage());
      }
    }

    $this->info('Finished assigning default categories.');
    return 0;
  }
}
