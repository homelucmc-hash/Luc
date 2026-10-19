# Luc Bot

Premiere version d'un bot de trading Python, exclusivement en **simulation hors
ligne**. Le courtier est virtuel : aucune integration d'exchange, aucune cle API,
aucun ordre reel et aucun mode live. La demonstration utilise des cours
synthetiques, pas des donnees de marche.

## Installation

Python 3.12 et [uv](https://docs.astral.sh/uv/) sont requis.
Le fichier `uv.toml` place le cache dans `.cache/uv`, un dossier local ignore
par Git et accessible en ecriture dans l'environnement cloud.

```bash
cd /workspace/Luc
uv sync --frozen
uv run --frozen pytest
uv run --frozen lucbot simulate
```

Chaque simulation se termine et cree un nouveau dossier sous `runs/`. Aucun
processus permanent, service externe ou secret n'est necessaire. Une fois les
dependances installees, les simulations et tests fonctionnent hors ligne :

```bash
uv run --frozen --offline lucbot simulate
```

## Strategie Et Execution

- Croisement de moyennes mobiles simples : 10 et 30 bougies par defaut.
- Achat uniquement ; fermeture au croisement baissier ou au stop virtuel.
- Capital initial : 10 000 unites monetaires ; allocation par entree : 25 %
  de la liquidite disponible, arrondie aux unites entieres par le moteur.
- Aucune vente a decouvert, aucun levier, une position a la fois.
- Commission : 0,1 % a l'entree et a la sortie ; spread : 0,05 % a l'entree.
- Stop virtuel place 5 % sous le cours de cloture du signal d'achat.
- Signaux calcules avec les bougies connues ; ordres au marche executes a
  l'ouverture suivante. Aucun ordre n'est emis sur la derniere bougie. Les
  positions restantes sont liquidees au dernier cours d'ouverture, selon la
  convention de finalisation du moteur.

L'execution, les frais, les stops et la comptabilite sont geres par
[backtesting.py](https://kernc.github.io/backtesting.py/), et non par un moteur
maison. Les stops peuvent subir un gap ; le spread est une approximation, et
la liquidite comme l'impact de marche ne sont pas modelises. Cette V1 simule
un seul actif et des quantites entieres ; elle ne tourne pas en temps reel.
Les resultats synthetiques ne demontrent aucune rentabilite future.

```bash
uv run --frozen lucbot simulate --cash 5000 --fast 5 --slow 20 \
  --allocation 0.20 --commission 0.001 --spread 0.0005 --stop-loss 0.03
```

## Donnees Locales

Le CSV doit comporter ces colonnes, dans n'importe quel ordre :

```csv
timestamp,open,high,low,close,volume
2025-01-01T00:00:00Z,100,102,99,101,1200
2025-01-02T00:00:00Z,101,103,100,102,1400
```

Il faut au moins `slow + 2` lignes : cet extrait de deux lignes montre seulement
le format. Les dates ISO 8601 doivent etre uniques et croissantes ; elles sont
normalisees en UTC. Les prix doivent etre positifs, les valeurs finies et les
fourchettes OHLC coherentes. Les fichiers invalides sont refuses sans tri ni
remplissage implicite. L'entree est un fichier local, jamais une URL.

```bash
uv run --frozen lucbot demo-data --output runs/demo.csv
uv run --frozen lucbot simulate --csv runs/demo.csv --output runs/mon-essai
```

Les sorties existantes ne sont jamais ecrasees. Pour relancer, utilisez un
nouveau dossier ou omettez `--output`.

## Rapports

- `summary.json` : mode, parametres, provenance, empreinte SHA-256 des donnees,
  capital final, resultat net apres frais, rendement, drawdown et nombre de trades.
- `equity.csv` : valeur du portefeuille virtuel et drawdown en pourcentage.
- `trades.csv` : trades virtuels clotures, avec les colonnes du moteur
  (`Size`, `EntryTime`, `ExitTime`, `EntryPrice`, `ExitPrice`, `PnL`, `Commission`, etc.).

`win_rate_pct` vaut `null` sans trade. Un rapport sans trade est valide mais ne
prouve pas que la strategie est utile. `summary.json` est ecrit en dernier pour
marquer un lot de rapports termine. Les donnees de demonstration sont
deterministes ; les dates des dossiers de sortie sont les seules valeurs
variables entre deux executions identiques.

## Developpement

```bash
uv sync --frozen
uv run --frozen pytest
uv build
```

Le point d'entree est `src/lucbot/cli.py`, la strategie est dans
`src/lucbot/simulation.py`, et les limites des parametres sont dans
`src/lucbot/config.py`. Les dependances resolues sont conservees dans `uv.lock`.
Ne pas ajouter de connecteur d'execution reelle : la simulation uniquement
est une exigence de ce projet.
