# Regular Sync Workflow

This guide explains how to keep your dev branch updated with the latest character data from the upstream repository while preserving your custom structure.

---

## 🔄 Regular Sync (Do this weekly/monthly)

Run these commands whenever you want to get the latest character data from 2Shankz's repository:

```bash
# 1. Switch to master and get latest data
git checkout master
git fetch upstream
git merge upstream/master
git push origin master

# 2. Switch to dev and update it with new data
git checkout dev
git rebase master

# 3. Push updated dev (if rebase was clean, no force needed)
git push origin dev
```

**That's it!** These 3 steps keep your custom structure + latest data.

---

## ⚠️ Handling Merge Conflicts

If you get conflicts during the rebase (usually in `index.html` and `README.md`):

### Quick Resolution (Keep Your Versions)
```bash
# Keep your custom structure files
git checkout --ours index.html
git checkout --ours README.md

# Stage the files
git add index.html README.md

# Continue the rebase
git rebase --continue

# Push the changes
git push origin dev
```

### Manual Resolution (Choose Specific Parts)
If you want to manually review conflicts:

1. Git will mark conflicts with `<<<<<<<`, `=======`, `>>>>>>>` markers
2. Open the conflicted files in VS Code
3. Choose which sections to keep
4. Remove the conflict markers
5. Save the files
6. Run:
   ```bash
   git add index.html README.md
   git rebase --continue
   git push origin dev
   ```

---

## ✅ What Gets Updated Automatically

These files sync with NO conflicts (they contain game data):

- ✅ `common/data/units.js` - New character data
- ✅ `common/data/details.js` - Captain/Sailor/Special abilities
- ✅ `common/data/evolutions.js` - Evolution chains
- ✅ `common/data/cooldowns.js` - Special cooldowns
- ✅ `common/data/rumble.js` - Pirate Rumble data
- ✅ `common/data/flags.js` - Character flags
- ✅ `common/data/drops.js` - Drop locations
- ✅ `common/data/tandems.js` - Tandem abilities
- ✅ `common/data/families.js` - Character families
- ✅ All other data files in `common/data/`

**Your custom structure in `index.html` and `README.md` stays intact!**

---

## 🚨 Troubleshooting

### Conflict during rebase
```bash
# See which files have conflicts
git status

# Keep your version for specific files
git checkout --ours <filename>

# Or keep upstream version for specific files
git checkout --theirs <filename>

# After resolving
git add .
git rebase --continue
```

### Need to abort and start over
```bash
git rebase --abort
```

### Force push if history was rewritten
```bash
# Only if you rebased and git rejects normal push
git push --force origin dev
```

---

## 📊 Check Sync Status

Before syncing, check how far behind you are:

```bash
# Fetch upstream without merging
git fetch upstream

# See how many commits behind you are
git log HEAD..upstream/master --oneline

# See changed files
git diff HEAD..upstream/master --name-only
```

---

## 🎯 Quick Reference Card

**Save this for copy-paste:**

```bash
# === FULL SYNC WORKFLOW ===

git checkout master
git fetch upstream
git merge upstream/master
git push origin master

git checkout dev
git rebase master

# If conflicts:
git checkout --ours index.html
git checkout --ours README.md
git add index.html README.md
git rebase --continue

git push origin dev
```

---

## 📅 Recommended Sync Schedule

- **Weekly:** If you're actively developing
- **Monthly:** If you just want latest character data
- **Before starting new work:** Always sync before adding new features
- **After major game updates:** New characters, events, or game mechanics

---

## 💡 Pro Tips

1. **Always commit your work** before syncing to avoid losing changes
2. **Use `git status`** frequently to see what's happening
3. **Create a backup branch** before major syncs:
   ```bash
   git branch backup-dev
   ```
4. **Test locally** after syncing to ensure everything still works
5. **Keep notes** of any custom changes you make to track files

---

## 🔗 Related Files

- `sync-and-update.md` - Initial setup guide (one-time use)
- `README.md` - Your custom project description
- `index.html` - Your custom character table entry point
