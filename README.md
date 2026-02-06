# Portfolio Update Procedure

This document describes how to update portfolio folders with the latest content from GitHub repositories.

## Prerequisites

- Node.js installed
- Git installed
- `GITHUB_TOKEN` environment variable set in `.env` file (optional but recommended for higher API rate limits)

## Step-by-Step Procedure

### 1. Update Blacklist (Optional)

Edit `blacklist.json` to exclude repos you don't want to include:

```json
{
  "students": [],
  "repos": ["repo-name-to-exclude", "another-repo"]
}
```

### 2. Gather Latest Repositories

Run the gather script to fetch the latest repo list from all student GitHub profiles:

```bash
node scripts/gather-repos.js
```

This will:
- Fetch all repos from configured student accounts
- Apply blacklist filters
- Generate `repos-list.json` with filtered repos
- Generate `add-submodules.sh` with git submodule commands

### 3. Clean Configuration Files

Remove entries from `.gitmodules` that are no longer in the valid list:

```bash
node scripts/clean-gitmodules.js
```

This will:
- Compare `.gitmodules` against `add-submodules.sh`
- Remove invalid submodule entries
- Report how many were kept/removed

### 4. Clean Portfolio Folders

Remove portfolio folders that are no longer in the valid list:

```bash
node scripts/clean-submodule-folders.js
```

This will:
- Scan `portfolio/` directory
- Remove folders not in `add-submodules.sh`
- Report removed folders

### 5. Update Portfolio Content

Download latest files from all repositories:

```bash
node scripts/update-portfolio.js
```

This will:
- Fetch important files (HTML, CSS, JS, JSON, images, etc.) from each repo
- Build React projects if detected
- Report download progress and results

### 6. Generate Portfolio Data

Generate the static portfolio data file for the website:

```bash
node scripts/generate-portfolio-data.js
```

This will:
- Scan all portfolio folders
- Create `portfolio-data.json` with metadata
- Report number of users and repos

### 7. Commit and Deploy

Commit all changes to git:

```bash
git add .
git commit -m "Update portfolio: $(date +%Y-%m-%d)"
git push
```

## Quick Update (All Steps)

Run all steps in sequence:

```bash
node scripts/gather-repos.js && \
node scripts/clean-gitmodules.js && \
node scripts/clean-submodule-folders.js && \
node scripts/update-portfolio.js && \
node scripts/generate-portfolio-data.js && \
git add . && \
git commit -m "Update portfolio: $(date +%Y-%m-%d)" && \
git push
```

## Troubleshooting

### Rate Limit Issues
- Set `GITHUB_TOKEN` in `.env` for higher API limits
- Use `--depth 1` in git commands to reduce data transfer

### Build Failures
- Check `update-portfolio.js` output for specific repo errors
- Some repos may fail to build - this is normal and non-blocking

### Submodule Issues
- If git complains about submodules, run: `git submodule deinit --all -f`
- Then re-run the gather and clean scripts

## Configuration Files

- **blacklist.json** - Repos/students to exclude
- **repos-list.json** - Current list of valid repos (auto-generated)
- **add-submodules.sh** - Git submodule commands (auto-generated)
- **.gitmodules** - Git submodule configuration (auto-updated)
- **portfolio-data.json** - Static data for website (auto-generated)

## Notes

- The `update-portfolio.js` script respects the blacklist
- React projects are automatically built and output moved to repo root
- Empty folders are cleaned up automatically
- All scripts are idempotent (safe to run multiple times)
