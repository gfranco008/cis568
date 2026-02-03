# GitHub Copilot instructions for CIS568 repository

## Quick context
- Purpose: course repository for *Data Visualization (CIS568)*. Primary work is notebook-driven exercises (see `Activity_1/`).
- Language: Python (requires >=3.11 per `pyproject.toml`).
- Key dependencies (see `pyproject.toml`): pandas, matplotlib, plotly, seaborn, numpy, jupyter.

---

## What an AI coding agent should know 🔧
- This repo is minimal and centered around Jupyter notebooks. Changes will often be to *.ipynb* files under `Activity_*` directories.
- Data / outputs: large or content-addressed blobs are stored under `artifacts/` and `cache/`. Treat these as read-only unless asked to modify or regenerate artifacts.
- Packaging: project uses Poetry (`pyproject.toml` with `poetry-core`), not a full Python package (package-mode=false). Use Poetry for dependency management and running commands.

---

## Setup & common commands (examples) ✅
- Install dependencies: `poetry install` (or `poetry shell` then `poetry install`).
- Run a notebook server: `poetry run jupyter lab` or `poetry run jupyter notebook` from the repository root.
- Quick environment check: `poetry run python -c "import pandas as pd; import jupyter; print(pd.__version__)"`

---

## Project patterns & conventions 🧭
- Notebook-first workflow: prefer to add small, well-contained notebook cells or scripts and keep notebooks' outputs cleared before committing unless outputs are explicitly required for an assignment.
- Directory layout to inspect:
  - `Activity_1/` — notebooks for first assignment(s). Example: `Activity_1/activity1.ipynb`.
  - `artifacts/` — content-addressed artifacts (large binary/structured data). Do not change unless regenerating artifacts as part of an accepted change.
  - `cache/` — local caches; avoid touching in PRs.
- No tests or CI files detected. Don't add broad tests unless instructed; prefer targeted unit/test notebooks when requested.

---

## What to change and what to avoid ❗
- Good candidate changes: fixing notebook code cells, adding small helper modules under `cis568/` for reuse, improving README with run instructions, adding scripts for reproducibility (e.g., small `scripts/` to run data prep).
- Avoid: modifying `artifacts/` or `cache/` without explicit intent; making sweeping architectural changes (project is an educational repo, keep changes small and well-explained).

---

## How to document changes in PRs ✍️
- Explain how to reproduce results locally (`poetry install`, `poetry run jupyter lab`, which notebook/cell to run).
- If you regenerate artifacts, include a short note explaining the steps and why it changed (commands, data source).
- Include an example notebook run (one or two cells) to verify behavior when relevant.

---

## Files to inspect for context 🕵️‍♂️
- `pyproject.toml` — dependency and Python version constraints.
- `Activity_1/activity1.ipynb` — canonical example of how code is written for assignments.
- `artifacts/` and `cache/` — where data / outputs are stored (read-only by default).
- `README.md` — currently empty; adding short setup instructions here is appropriate.
- `SYLLABUS.md` — (recommended) course syllabus that contains schedule, grading, assignment deadlines, and instructor contact. If present, prefer instructions there for assignment expectations and due dates.

---

## Syllabus & course materials 📚
- If the syllabus is provided, add it as `SYLLABUS.md` at the repository root (or request the instructor provide it). Include:
  - Course schedule, assignment due dates, grading rubric, and links to specific notebooks (e.g., `Activity_1/activity1.ipynb`).
  - Any datasets or external resources required and steps to reproduce them (e.g., data download scripts or `artifacts/` regeneration steps).
- When adding or updating the syllabus, also:
  - Add a short summary to `README.md` and link `SYLLABUS.md`.
  - Update this file (`.github/copilot-instructions.md`) to reference any new process or commands introduced by the syllabus (e.g., special setup commands or submission instructions).

---

If anything in this guide is unclear or you'd like additional examples (e.g., a sample script to run an assignment end-to-end or a suggested PR template), tell me which parts to expand and I'll iterate. 🚀
