<?php

namespace App\Services;

use Google\Client;
use Google\Service\Sheets;

class GoogleSheetsService
{
  protected Sheets $sheets;

  public function __construct()
  {
    $client = new Client();
    $client->setScopes([Sheets::SPREADSHEETS]);
    $client->setAuthConfig(base_path(env('GOOGLE_SHEETS_SERVICE_ACCOUNT_CREDENTIALS')));
    $this->sheets = new Sheets($client);
  }

  public function appendSheet(string $sheetName, array $data)
  {
    $range = $sheetName . '!A1'; // El rango donde se añadiran los datos
    $valueRange = new \Google\Service\Sheets\ValueRange();
    $valueRange->setValues($data);

    $this->sheets->spreadsheets_values->append(
      env('GOOGLE_SHEET_ID'),
      $range,
      $valueRange,
      ['valueInputOption' => 'USER_ENTERED']
    );
  }
}
