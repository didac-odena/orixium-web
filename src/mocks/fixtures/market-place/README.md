Market Place Fixtures

This folder contains curated fixture inputs (symbols) and generated snapshot outputs.
Snapshots are produced by a local script that lives outside the repo.

Workflow (local only):
1) Update symbol lists in `equity-symbols.json`.
2) Run the external script to regenerate `equity-snapshots.json`.

External script (local path):
`E:\Orixium\scripts\IBKR\data-market\update-equity-snapshots.ps1`

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
