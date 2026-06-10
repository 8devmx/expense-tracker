<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Transaction;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SpendingTrackerImport extends Seeder
{
    const USER_ID = 2;
    const SQLITE_PATH = '/var/www/html/storage/app/SpendingTracker.sqlite';
    const COREDATA_OFFSET = 978307200;

    protected array $iconToEmoji = [
        'atm2'            => "\u{1F4B5}",
        '80-shopping-cart' => "\u{1F6D2}",
        '67-tshirt'       => "\u{1F455}",
        '48-fork-and-knife' => "\u{1F37D}",
        '88-beer-glass'   => "\u{1F37A}",
        '47-fuel'         => "\u{26FD}",
        '37-suitcase'     => "\u{1F4BC}",
        '31-ipod'         => "\u{1F3AE}",
        '172-pricetag'    => "\u{1F3F7}",
        'gas'             => "\u{1F4B8}",
        '826-money-1'     => "\u{1F4B8}",
        '880-bank'        => "\u{1F3E6}",
    ];

    public function run(): void
    {
        if (!file_exists(self::SQLITE_PATH)) {
            $this->command->error('SpendingTracker.sqlite not found at ' . self::SQLITE_PATH);
            return;
        }

        $pdo = new \PDO('sqlite:' . self::SQLITE_PATH);
        $pdo->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION);

        $this->truncateExisting();

        DB::beginTransaction();

        try {
            $categoryMap = $this->importCategories($pdo);
            $count = $this->importTransactions($pdo, $categoryMap);

            DB::commit();

            $this->command->info("Migracion completada: {$count} transacciones, " . count($categoryMap) . " categorias.");

        } catch (\Exception $e) {
            DB::rollBack();
            $this->command->error('Migracion fallida: ' . $e->getMessage());
            throw $e;
        }
    }

    private function truncateExisting(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        Transaction::truncate();
        Category::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1');
    }

    private function importCategories(\PDO $pdo): array
    {
        $rows = $pdo->query("SELECT Z_PK, ZNAME, ZCOLOUR, ZICON, ZTYPE FROM ZCATEGORY ORDER BY Z_PK");
        $map = [];

        foreach ($rows as $row) {
            $type = strtolower($row['ZTYPE']);
            if ($type === 'carry') {
                $type = 'income';
            }

            $color = $row['ZCOLOUR'] ?? null;
            if ($color && trim($color) !== '') {
                $color = '#' . ltrim($color, '#');
            } else {
                $color = null;
            }

            $cat = Category::create([
                'name' => $row['ZNAME'],
                'emoji' => $this->iconToEmoji[$row['ZICON']] ?? null,
                'color' => $color,
                'type' => $type,
                'user_id' => self::USER_ID,
            ]);

            $map[(int)$row['Z_PK']] = $cat->id;
        }

        return $map;
    }

    private function importTransactions(\PDO $pdo, array $categoryMap): int
    {
        $rows = $pdo->query(
            "SELECT Z_PK, ZCATEGORY, ZAMOUNT, ZDATE, ZDISPLAYNAME, ZNOTE, ZTYPE
             FROM ZTRANSACTION ORDER BY ZDATE"
        );

        $batch = [];
        $count = 0;
        $now = now();

        foreach ($rows as $tx) {
            $catId = $categoryMap[(int)$tx['ZCATEGORY']] ?? null;
            if (!$catId) {
                continue;
            }

            $desc = $tx['ZDISPLAYNAME'] ?? $tx['ZNOTE'] ?? 'Sin descripcion';
            $desc = mb_substr(trim($desc), 0, 250);

            $batch[] = [
                'description' => $desc,
                'amount' => abs((float)$tx['ZAMOUNT']),
                'type' => strtolower($tx['ZTYPE']),
                'date' => date('Y-m-d', self::COREDATA_OFFSET + (int)$tx['ZDATE']),
                'repeat_frequency' => 'none',
                'repeat_end_date' => null,
                'user_id' => self::USER_ID,
                'category_id' => $catId,
                'created_at' => $now,
                'updated_at' => $now,
            ];

            $count++;

            if (count($batch) >= 500) {
                Transaction::insert($batch);
                $batch = [];
            }
        }

        if (!empty($batch)) {
            Transaction::insert($batch);
        }

        return $count;
    }
}
