# NULO local frontend

NULO is an autonomous-agent token project built on Robinhood Chain. Every $10
allocation buys $5 of $NULO and gives an agent a $5 trading bank for other
tokens on Pons.
The local API starts in an honest prelaunch state: no contract address, agents,
trades, holders, or fees are shown until the new NULO deployment exists. It does
not proxy or display data from the previous project.

Live data will be connected after the NULO contract address, Robinhood Chain RPC
or indexer, treasury address, and agent engine data source are available.

## Run

```powershell
npm start
```

Open <http://127.0.0.1:4319/>.

To use another port:

```powershell
$env:PORT=8080; npm start
```
