#!/usr/bin/env python3
"""
ReCom Markov-chain sampler for MD and MS redistricting.

Modes:
  blind  –  population equality only
  vra    –  + majority-minority district constraint

Output per run:
  results/<tag>_plans.json    – {node_id: district} per saved step
  results/<tag>_metrics.json  – per-step stats

Examples:
  python recom.py --state md --mode blind --steps 10000 --seed 42
  python recom.py --state ms --mode vra --steps 5000 --seed 7 --output results/
  python recom.py --state md --mode vra --steps 50000 --thin 10 --seed 1
"""

import argparse
import json
import os
import random
import sys
from functools import partial

import geopandas as gpd
import networkx as nx
import numpy as np
from gerrychain import Graph, GeographicPartition, MarkovChain
from gerrychain.accept import always_accept
from gerrychain.constraints import within_percent_of_ideal_population
from gerrychain.proposals import recom
from gerrychain.tree import recursive_tree_part
from gerrychain.updaters import Tally, cut_edges


# ── State configuration ───────────────────────────────────────────────────────
#
# pop_col      : population column for equality constraint
# minority_col : VRA numerator (protected minority group)
# total_col    : VRA denominator (CVAP for MD; total_pop for MS)
# vra_threshold: majority-minority cutoff
# seed_col     : warm-start assignment column (None = generate via recursive_tree_part)
#
# MD: uses VAP for population; VRA = Black VAP / total CVAP
# MS: total_pop derived from white_pop + black_pop; same column for pop and VRA denom

STATE_CFG = {
    "md": {
        "geojson": os.path.join(os.path.dirname(__file__), "..", "Data", "md", "cleaned", "md_precincts.geojson"),
        "n_districts": 8,
        "pop_col": "vap",
        "minority_col": "black_vap",
        "total_col": "cvap_total",
        "vra_min_districts": 1,
        "vra_threshold": 0.50,
        "seed_col": "CONG_DIST",
    },
    "ms": {
        "geojson": os.path.join(os.path.dirname(__file__), "..", "Data", "ms", "cleaned", "ms_precincts.geojson"),
        "n_districts": 4,
        "pop_col": "total_pop",      # derived below
        "minority_col": "black_pop",
        "total_col": "total_pop",    # same as pop_col for MS
        "vra_min_districts": 1,
        "vra_threshold": 0.50,
        "seed_col": None,
    },
}


# ── VRA constraint factory ────────────────────────────────────────────────────

def make_vra_constraint(minority_key: str, total_key: str,
                        min_districts: int, threshold: float):
    """Returns a constraint fn that passes only if >= min_districts have minority/total >= threshold."""
    def vra_constraint(partition) -> bool:
        minority = partition[minority_key]
        total    = partition[total_key]
        count = sum(
            1 for d in partition.parts
            if total[d] > 0 and minority[d] / total[d] >= threshold
        )
        return count >= min_districts

    vra_constraint.__name__ = f"vra_{minority_key}_ge_{threshold:.0%}_x{min_districts}"
    return vra_constraint


# ── Utilities ────────────────────────────────────────────────────────────────

def normalize_labels(series):
    """Remap district labels to consecutive ints from 1."""
    unique  = sorted(series.dropna().unique(), key=lambda x: str(x))
    mapping = {v: i + 1 for i, v in enumerate(unique)}
    return series.map(mapping)


def compute_metrics(partition, cfg: dict, step: int) -> dict:
    """Compute per-step summary stats for a partition."""
    districts = sorted(partition.parts)
    n = len(districts)

    pop      = [int(partition["population"][d])         for d in districts]
    minority = [int(partition[cfg["minority_col"]][d])  for d in districts]
    total    = [int(partition[cfg["total_col"]][d])     for d in districts]
    dem      = [int(partition["votes_dem"][d])          for d in districts]
    rep      = [int(partition["votes_rep"][d])          for d in districts]

    minority_frac = [
        round(minority[i] / total[i], 4) if total[i] > 0 else 0.0
        for i in range(n)
    ]

    ideal = sum(pop) / n
    max_dev = max(abs(p - ideal) / ideal for p in pop)

    return {
        "step":            step,
        "population":      pop,
        "minority_frac":   minority_frac,
        "dem_seats":       sum(1 for i in range(n) if dem[i] > rep[i]),
        "rep_seats":       sum(1 for i in range(n) if rep[i] >= dem[i]),
        "cut_edges":       len(partition["cut_edges"]),
        "max_pop_dev":     round(max_dev, 6),
    }


def find_vra_seed(graph, cfg: dict, vra_fn, pop_tol: float,
                  base_seed: int, max_tries: int = 300) -> dict:
    """Try up to max_tries random seeds until one passes the VRA constraint."""
    ideal_pop  = sum(dict(graph.nodes(data=cfg["pop_col"])).values()) / cfg["n_districts"]
    updaters   = _build_updaters(cfg)

    for attempt in range(max_tries):
        random.seed(base_seed + attempt * 7919)   # prime stride to avoid seed collisions
        np.random.seed(base_seed + attempt * 7919)

        assignment = recursive_tree_part(
            graph,
            parts=range(1, cfg["n_districts"] + 1),
            pop_target=ideal_pop,
            pop_col=cfg["pop_col"],
            epsilon=pop_tol,
        )
        partition = GeographicPartition(
            graph=graph, assignment=assignment, updaters=updaters
        )
        if vra_fn(partition):
            print(f"  VRA seed found on attempt {attempt + 1}.", flush=True)
            return assignment

    sys.exit(
        f"ERROR: Could not find a VRA-satisfying seed partition after {max_tries} attempts.\n"
        "Try a wider pop_tol or verify that a majority-minority district is feasible."
    )


def _build_updaters(cfg: dict) -> dict:
    """Build the gerrychain updater dict for a state config."""
    upd = {
        "population":            Tally(cfg["pop_col"], alias="population"),
        "cut_edges":             cut_edges,
        cfg["minority_col"]:     Tally(cfg["minority_col"]),
        "votes_dem":             Tally("votes_dem"),
        "votes_rep":             Tally("votes_rep"),
    }
    if cfg["total_col"] not in (cfg["pop_col"], cfg["minority_col"]):
        upd[cfg["total_col"]] = Tally(cfg["total_col"])
    elif cfg["total_col"] == cfg["pop_col"] and cfg["total_col"] not in upd:
        # MS: total_col == pop_col, accessed via "population" alias
        upd[cfg["total_col"]] = Tally(cfg["total_col"])
    return upd


# ── Graph connectivity fix ───────────────────────────────────────────────────

def _connect_graph_components(graph, gdf: "gpd.GeoDataFrame") -> None:
    """
    Bridge disconnected components by adding edges between each isolated
    component and its nearest node in the main component (by centroid distance).

    MD's Eastern Shore is separated from the Western Shore by the Chesapeake Bay,
    so the raw adjacency graph comes out disconnected.
    """
    components = list(nx.connected_components(graph))
    if len(components) == 1:
        return

    print(f"  Graph has {len(components)} components — stitching …", flush=True)

    gdf_proj = gdf.to_crs("EPSG:26985")   # MD state plane (metres)
    centroids = gdf_proj.geometry.centroid

    # Connect closest component to main set, one at a time
    components.sort(key=len, reverse=True)
    main_nodes = set(components[0])

    for comp in components[1:]:
        best_dist = float("inf")
        best_pair = (None, None)

        for u in main_nodes:
            for v in comp:
                d = centroids.iloc[u].distance(centroids.iloc[v])
                if d < best_dist:
                    best_dist = d
                    best_pair = (u, v)

        u, v = best_pair
        graph.add_edge(u, v)
        print(
            f"    Added bridge edge {u} ↔ {v}  "
            f"({gdf.iloc[u]['UNIQUE_ID']} ↔ {gdf.iloc[v]['UNIQUE_ID']}, "
            f"{best_dist/1000:.1f} km)",
            flush=True,
        )
        main_nodes.update(comp)

    remaining = list(nx.connected_components(graph))
    print(f"  Graph is now {'connected' if len(remaining) == 1 else f'{len(remaining)}-component'}.", flush=True)


# ── Main chain runner ─────────────────────────────────────────────────────────

def run_chain(state: str, mode: str, steps: int, pop_tol: float,
              output_dir: str, seed: int, thin: int = 1) -> None:
    """Run one ReCom chain and write plans/metrics JSON to output_dir."""
    random.seed(seed)
    np.random.seed(seed)

    cfg = STATE_CFG[state]
    print(f"[{state.upper()} | {mode} | seed={seed}] Loading GeoJSON …", flush=True)
    gdf = gpd.read_file(cfg["geojson"])
    gdf = gdf.reset_index(drop=True)

    # MS: total_pop isn't in the data, derive it
    if state == "ms":
        gdf["total_pop"] = (
            gdf["white_pop"].fillna(0).astype(int)
            + gdf["black_pop"].fillna(0).astype(int)
        )

    # Fill NaN demographic columns with 0
    demo_cols = [cfg["pop_col"], cfg["minority_col"], cfg["total_col"],
                 "votes_dem", "votes_rep"]
    for col in demo_cols:
        if col in gdf.columns:
            gdf[col] = gdf[col].fillna(0).astype(int)

    # recom breaks on zero-pop precincts
    before = len(gdf)
    gdf = gdf[gdf[cfg["pop_col"]] > 0].reset_index(drop=True)
    if len(gdf) < before:
        print(f"  Dropped {before - len(gdf)} zero-population precincts.", flush=True)

    total_pop = int(gdf[cfg["pop_col"]].sum())
    ideal_pop = total_pop / cfg["n_districts"]
    print(
        f"  Precincts: {len(gdf):,}  |  "
        f"Total {cfg['pop_col']}: {total_pop:,}  |  "
        f"Ideal district size: {ideal_pop:,.0f}",
        flush=True,
    )

    # ── Build adjacency graph ─────────────────────────────────────────────────
    print("  Building adjacency graph …", flush=True)
    graph = Graph.from_geodataframe(gdf, ignore_errors=True)
    _connect_graph_components(graph, gdf)  # fixes MD Chesapeake Bay disconnect

    updaters = _build_updaters(cfg)

    # ── Initial (seed) partition ──────────────────────────────────────────────
    if cfg["seed_col"] and cfg["seed_col"] in gdf.columns:
        print(f"  Using '{cfg['seed_col']}' column as warm-start seed …", flush=True)
        raw_assignment = normalize_labels(gdf[cfg["seed_col"]])
        assignment = dict(zip(gdf.index, raw_assignment))
    else:
        print("  Generating seed with recursive_tree_part …", flush=True)
        assignment = recursive_tree_part(
            graph,
            parts=range(1, cfg["n_districts"] + 1),
            pop_target=ideal_pop,
            pop_col=cfg["pop_col"],
            epsilon=pop_tol,
        )

    initial_partition = GeographicPartition(
        graph=graph, assignment=assignment, updaters=updaters
    )

    # ── Constraints ───────────────────────────────────────────────────────────
    pop_constraint = within_percent_of_ideal_population(initial_partition, pop_tol)
    chain_constraints = [pop_constraint]

    if mode == "vra":
        # MS: black_pop / total_pop; MD: black_vap / cvap_total
        # When total_col == pop_col (MS), reference it via the "population" alias
        minority_key = cfg["minority_col"]
        total_key    = cfg["total_col"] if cfg["total_col"] != cfg["pop_col"] \
                       else "population"

        vra_fn = make_vra_constraint(
            minority_key, total_key,
            cfg["vra_min_districts"], cfg["vra_threshold"],
        )
        chain_constraints.append(vra_fn)

        # Regenerate seed if it doesn't satisfy VRA
        if not vra_fn(initial_partition):
            print(
                "  Initial seed does not satisfy VRA — searching for a valid seed …",
                flush=True,
            )
            assignment = find_vra_seed(graph, cfg, vra_fn, pop_tol, seed)
            initial_partition = GeographicPartition(
                graph=graph, assignment=assignment, updaters=updaters
            )

        # Log minority fracs for the starting partition
        parts = sorted(initial_partition.parts)
        minority = initial_partition[minority_key]
        total_d  = initial_partition[total_key]
        fracs = [
            f"D{d}: {minority[d] / total_d[d]:.1%}" if total_d[d] > 0 else f"D{d}: N/A"
            for d in parts
        ]
        print(f"  Seed minority fracs — {', '.join(fracs)}", flush=True)

    # ── ReCom proposal ────────────────────────────────────────────────────────
    proposal = partial(
        recom,
        pop_col=cfg["pop_col"],
        pop_target=ideal_pop,
        epsilon=pop_tol,
        node_repeats=1,
    )

    # ── Markov chain ──────────────────────────────────────────────────────────
    chain = MarkovChain(
        proposal=proposal,
        constraints=chain_constraints,
        accept=always_accept,
        initial_state=initial_partition,
        total_steps=steps,
    )

    # ── Collect results ───────────────────────────────────────────────────────
    plans:   list[dict] = []
    metrics: list[dict] = []

    # Use the partition alias when total_col == pop_col (MS)
    metrics_cfg = dict(cfg)
    if cfg["total_col"] == cfg["pop_col"]:
        metrics_cfg["total_col"] = "population"

    # Use UNIQUE_ID as the plan key so the viz can join regardless of reindexing
    idx_to_uid = gdf["UNIQUE_ID"].to_dict()

    for i, partition in enumerate(chain):
        if i % 500 == 0:
            print(f"    step {i:>6} / {steps}", flush=True)

        if i % thin == 0:
            plans.append(
                {idx_to_uid[node]: int(part) for node, part in partition.assignment.items()}
            )
            metrics.append(compute_metrics(partition, metrics_cfg, i))

    # ── Write output ──────────────────────────────────────────────────────────
    os.makedirs(output_dir, exist_ok=True)
    tag = f"{state}_{mode}_seed{seed}"

    plans_path   = os.path.join(output_dir, f"{tag}_plans.json")
    metrics_path = os.path.join(output_dir, f"{tag}_metrics.json")

    with open(plans_path, "w") as f:
        json.dump(plans, f, separators=(",", ":"))
    with open(metrics_path, "w") as f:
        json.dump(metrics, f, indent=2)

    print(
        f"  Done. Saved {len(plans)} plans → {output_dir}/{tag}_*.json",
        flush=True,
    )


# ── CLI ───────────────────────────────────────────────────────────────────────

def parse_args():
    p = argparse.ArgumentParser(
        description="ReCom redistricting sampler — Maryland & Mississippi",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    p.add_argument("--state",   required=True, choices=["md", "ms"],
                   help="State to redistrict")
    p.add_argument("--mode",    required=True, choices=["blind", "vra"],
                   help="blind = pop equality only; vra = + majority-minority constraint")
    p.add_argument("--steps",   type=int,   default=10_000,
                   help="Number of MCMC steps")
    p.add_argument("--pop-tol", type=float, default=0.02,
                   help="Fractional population tolerance (e.g. 0.02 = ±2%%)")
    p.add_argument("--output",  default="results",
                   help="Output directory")
    p.add_argument("--seed",    type=int,   default=42,
                   help="Random seed (set to $SLURM_ARRAY_TASK_ID for parallel chains)")
    p.add_argument("--thin",    type=int,   default=1,
                   help="Save every Nth plan (1 = save all)")
    return p.parse_args()


if __name__ == "__main__":
    args = parse_args()
    run_chain(
        state=args.state,
        mode=args.mode,
        steps=args.steps,
        pop_tol=args.pop_tol,
        output_dir=args.output,
        seed=args.seed,
        thin=args.thin,
    )
