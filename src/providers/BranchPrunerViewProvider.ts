import * as vscode from 'vscode';
import { GitService } from '../services/GitService';
import { getErrorContent, getBranchListContent, getLoadingContent } from '../views/webview';

/**
 * WebView provider for Git Branch Pruner
 * Manages branch list display, refresh, and delete operations
 */
export class BranchPrunerViewProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;
  private gitService: GitService;
  private isOperationInProgress = false;
  private readonly currentLanguage: string;

  constructor(private readonly _extensionUri: vscode.Uri) {
    this.gitService = new GitService();
    this.currentLanguage = vscode.env.language;
  }

  /**
   * Check if current environment is Chinese
   * Supports both Simplified and Traditional Chinese
   */
  private isChineseLanguage(): boolean {
    return this.currentLanguage.toLowerCase().startsWith('zh');
  }

  /**
   * Get localized message text
   * Returns Chinese or English messages based on current language environment
   */
  private getLocalizedMessages() {
    return this.isChineseLanguage()
      ? {
          checking: 'Checking Git environment...',
          refreshing: 'Refreshing branch information...',
          deleting: (count: number) => `Deleting ${count} branch(es)...`,
          gitNotInstalled: 'Git is not installed or cannot be found in PATH. Please install Git and try again.',
          notGitRepo: 'Current workspace is not a Git repository. Please open a Git repository and try again.',
          failedToCheck: 'Failed to check Git environment. Please try again.',
          failedToRefresh: 'Failed to refresh branches. Please try again.',
          failedToDelete: 'Failed to delete branches. Please try again.',
          deleteConfirmSingle: 'Are you sure you want to delete the following branch?',
          deleteConfirmMultiple: (total: number) => `Are you sure you want to delete the following ${total} branches?`,
          deleteDetail: 'This operation will only delete local branches. Remote branches will not be affected.',
          deleteButton: 'Delete Branches',
          cancelButton: 'Cancel',
          andMore: (count: number) => `...and ${count} more`,
        }
      : {
          checking: 'Checking Git environment...',
          refreshing: 'Refreshing branch information...',
          deleting: (count: number) => `Deleting ${count} branch(es)...`,
          gitNotInstalled: 'Git is not installed or not available in PATH. Please install Git and try again.',
          notGitRepo: 'Current workspace is not a Git repository. Please open a Git repository and try again.',
          failedToCheck: 'Failed to check Git environment. Please try again.',
          failedToRefresh: 'Failed to refresh branches. Please try again.',
          failedToDelete: 'Failed to delete branches. Please try again.',
          deleteConfirmSingle: 'Are you sure you want to delete the following branch?',
          deleteConfirmMultiple: (total: number) => `Are you sure you want to delete the following ${total} branches?`,
          deleteDetail: 'This operation will only delete local branches. Remote branches will not be affected.',
          deleteButton: 'Delete Branches',
          cancelButton: 'Cancel',
          andMore: (count: number) => `...and ${count} more`,
        };
  }

  /**
   * Set enabled state of WebView UI controls
   * @param enabled Whether to enable controls
   */
  private async setControlsState(enabled: boolean) {
    if (this._view) {
      await this._view.webview.postMessage({
        type: 'setControlsState',
        enabled,
      });
    }
  }

  /**
   * Wrapper method to disable UI controls during operation execution
   * Ensures UI is disabled during operation to prevent duplicate operations
   * @param operation Async operation to execute
   */
  private async withControlsDisabled<T>(operation: () => Promise<T>): Promise<T> {
    if (this.isOperationInProgress) {
      return Promise.reject(new Error('Operation already in progress'));
    }

    try {
      this.isOperationInProgress = true;
      await this.setControlsState(false);
      const result = await operation();
      return result;
    } finally {
      this.isOperationInProgress = false;
      await this.setControlsState(true);
    }
  }

  /**
   * Initialize WebView view
   * Set WebView configuration and register message handlers
   */
  public async resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    // Register WebView message handler
    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case 'refresh':
          await this.withControlsDisabled(() => this.refreshBranches());
          break;
        case 'confirmDelete':
          await this.withControlsDisabled(() => this.confirmAndDeleteBranches(data.branches));
          break;
      }
    });

    // Check Git environment on initialization
    this._view.webview.html = getLoadingContent('Checking Git environment...', this.isChineseLanguage());
    await this.checkEnvironment();
  }

  /**
   * Check Git environment
   * Validate Git installation status and repository validity
   */
  private async checkEnvironment() {
    if (!this._view) {
      return;
    }

    const messages = this.getLocalizedMessages();
    const isChineseLanguage = this.isChineseLanguage();

    try {
      this._view.webview.html = getLoadingContent(messages.checking, isChineseLanguage);

      if (!(await this.gitService.checkGitInstallation())) {
        this._view.webview.html = getErrorContent(messages.gitNotInstalled, isChineseLanguage);
        return;
      }

      const workingDir = this.gitService.getWorkingDirectory();
      if (!workingDir || !(await this.gitService.isGitRepository(workingDir))) {
        this._view.webview.html = getErrorContent(messages.notGitRepo, isChineseLanguage);
        return;
      }

      // After environment check passes, directly execute refresh instead of showing ready status
      await this.refreshBranches();
    } catch (error) {
      this._view.webview.html = getErrorContent(messages.failedToCheck, isChineseLanguage);
    }
  }

  /**
   * Confirm and delete selected branches
   * @param branchNames List of branch names to delete
   */
  private async confirmAndDeleteBranches(branchNames: string[]) {
    if (!this._view || !branchNames.length) {
      return;
    }

    const messages = this.getLocalizedMessages();
    const isChineseLanguage = this.isChineseLanguage();

    const confirmMessage = this.buildConfirmationMessage(branchNames);

    const result = await vscode.window.showWarningMessage(
      confirmMessage,
      {
        modal: true,
        detail: messages.deleteDetail,
      },
      messages.deleteButton // Only keep delete button as confirmation option
    );

    if (result === messages.deleteButton) {
      try {
        this._view.webview.html = getLoadingContent(messages.deleting(branchNames.length), isChineseLanguage);
        await this.gitService.deleteBranches(branchNames);
        await this.refreshBranches();
      } catch (error) {
        this._view.webview.html = getErrorContent(messages.failedToDelete, isChineseLanguage);
      }
    }
    // Removed refresh operation from else branch
  }

  /**
   * Build delete confirmation message
   * @param branchNames List of branch names to delete
   */
  private buildConfirmationMessage(branchNames: string[]): string {
    const messages = this.getLocalizedMessages();
    const totalBranches = branchNames.length;

    if (totalBranches === 1) {
      return `${messages.deleteConfirmSingle}\n\n${branchNames[0]}\n\nThe following command will be executed:\ngit branch -D "${branchNames[0]}"`;
    }

    const branchList = branchNames
      .slice(0, 5)
      .map((name) => `• ${name}`)
      .join('\n');
    const remainingCount = totalBranches - 5;
    const additionalMessage = remainingCount > 0 ? `\n${messages.andMore(remainingCount)}` : '';

    return `${messages.deleteConfirmMultiple(
      totalBranches
    )}\n\n${branchList}${additionalMessage}\n\nThe following commands will be executed:\n${branchNames
      .map((name) => `git branch -D "${name}"`)
      .join('\n')}`;
  }

  /**
   * Refresh branch list
   * Get latest branch information and update display
   */
  private async refreshBranches() {
    if (!this._view) {
      return;
    }

    const messages = this.getLocalizedMessages();
    const isChineseLanguage = this.isChineseLanguage();

    try {
      this._view.webview.html = getLoadingContent(messages.refreshing, isChineseLanguage);
      const branches = await this.gitService.getBranches();
      this._view.webview.html = getBranchListContent(branches, isChineseLanguage);
    } catch (error) {
      this._view.webview.html = getErrorContent(messages.failedToRefresh, isChineseLanguage);
    }
  }
}
