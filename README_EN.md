# Git Branch Pruner

A VS Code extension to help you manage and clean up Git branches.

English

## Features

- 📊 Visualize all local branch statuses
- 🔄 Show branch synchronization status with remote
- 🗑️ Easily delete merged or remotely deleted branches
- 🔍 Clearly identify current and main branches
- 🌏 Support for English and Chinese interfaces

## How to Use

1. Open a Git repository in VS Code
2. Click the Git Branch Pruner icon in the activity bar
3. View branch list and status
4. Select branches to delete and click "Delete Selected"

## Branch Status Indicators

- ✓ Remote: Branch exists in remote repository
- ✗ Remote: Branch does not exist in remote repository
- Current: Currently checked out branch
- Main: main or master branch

## Requirements

- VS Code 1.80.0 or higher
- Git 2.0.0 or higher

## Important Notes

- Delete operations only affect local branches, not remote branches
- Ensure changes are merged before deleting branches
- Main branches (main/master) are protected from deletion by default

## Feedback

If you encounter any issues or have suggestions, please raise them in [GitHub Issues](https://github.com/monkeykjy/git-branch-pruner/issues).

## Changelog

See [CHANGELOG.md](CHANGELOG.md)

## License

[MIT](LICENSE)
