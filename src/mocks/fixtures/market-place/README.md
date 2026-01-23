Market Place Fixtures

This folder contains curated fixture inputs (symbols) and generated snapshot outputs.
Snapshots are produced by a local script that lives outside the repo.

Workflow (local only):
1) Update symbol lists in `equity-symbols.json`, `rates-symbols.json`, `forex-symbols.json`, or `commodities-symbols.json`.
2) Run the matching external script to regenerate the snapshots file.

External scripts (local paths):
- `E:\Orixium\scripts\IBKR\data-market\update-equity-snapshots.ps1`
- `E:\Orixium\scripts\IBKR\data-market\update-rates-snapshots.ps1`
- `E:\Orixium\scripts\IBKR\data-market\update-forex-snapshots.ps1`
- `E:\Orixium\scripts\IBKR\data-market\update-commodities-snapshots.ps1`

Notes:
- The generator connects to IBKR Gateway/TWS and writes snapshots into this folder.
- The script is intentionally kept out of the repo.

Optional symbol overrides in `equity-symbols.json`:
- `conid`: preferred IBKR contract id (best accuracy).
- `ib_symbol`: override the symbol passed to IBKR (e.g. BRK B).
- `currency`: override contract currency (default USD).
- `exchange`: override contract exchange (default SMART).
- `primary_exchange`: primary exchange for disambiguation.
- `local_symbol`: optional localSymbol override.

Tools (local only):
- `E:\Orixium\scripts\IBKR\data-market\resolve-equity-conids.ps1` to fill missing conids.
- `E:\Orixium\scripts\IBKR\data-market\resolve-rates-conids.ps1` to fill missing conids for ETFs.
- `E:\Orixium\scripts\IBKR\data-market\resolve-commodities-conids.ps1` to fill missing conids for commodity ETFs/ETNs.

FX notes:
- Use `sec_type: "CASH"` and `exchange: "IDEALPRO"`.
- Use `ib_symbol` as base currency and `currency` as quote currency (e.g. EUR/USD → ib_symbol=EUR, currency=USD).
