import { Branch } from '../types';

interface LocalizedMessages {
  description: string;
  refreshButton: string;
  deleteSelectedButton: string;
  noBranches: string;
  selectAll: string;
  unselectAll: string;
}

function getLocalizedMessages(isChineseLanguage: boolean): LocalizedMessages {
  return isChineseLanguage
    ? {
        description:
          'Git Branch Pruner helps you manage local Git branches by identifying and removing branches that are no longer needed, especially those that have been merged or deleted from remote.',
        refreshButton: 'Refresh Branches',
        deleteSelectedButton: 'Delete Selected',
        noBranches: 'No branches found',
        selectAll: 'Select All',
        unselectAll: 'Unselect All',
      }
    : {
        description:
          'Git Branch Pruner helps you manage local Git branches by identifying and removing branches that are no longer needed, especially those that have been merged or deleted from remote.',
        refreshButton: 'Refresh Branches',
        deleteSelectedButton: 'Delete Selected',
        noBranches: 'No branches found',
        selectAll: 'Select All',
        unselectAll: 'Unselect All',
      };
}

export function getInitialContent(isChineseLanguage: boolean): string {
  const messages = getLocalizedMessages(isChineseLanguage);
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { 
                padding: 10px; 
                font-family: var(--vscode-font-family);
                color: var(--vscode-foreground);
            }
            .description {
                margin-bottom: 20px;
                line-height: 1.4;
            }
            .actions { 
                margin: 10px 0; 
            }
            button { 
                background-color: var(--vscode-button-background);
                color: var(--vscode-button-foreground);
                border: none;
                padding: 6px 12px;
                cursor: pointer;
                margin: 5px;
                border-radius: 2px;
            }
            button:hover {
                background-color: var(--vscode-button-hoverBackground);
            }
            button:disabled {
                opacity: 0.6;
                cursor: not-allowed;
                background-color: var(--vscode-button-secondaryBackground);
            }
        </style>
    </head>
    <body>
        <div class="description">
            ${messages.description}
        </div>
        <div class="actions">
            <button id="refreshBtn" onclick="refresh()">${messages.refreshButton}</button>
        </div>
        <script>
            const vscode = acquireVsCodeApi();

            function refresh() {
                vscode.postMessage({ type: 'refresh' });
            }
        </script>
    </body>
    </html>
  `;
}

export function getErrorContent(errorMessage: string, isChineseLanguage: boolean): string {
  const messages = getLocalizedMessages(isChineseLanguage);
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            /* Keep original styles */
        </style>
    </head>
    <body>
        <div class="description">
            ${messages.description}
        </div>
        <div class="error-message">
            ${errorMessage}
        </div>
    </body>
    </html>
  `;
}

export function getBranchListContent(branches: Branch[], isChineseLanguage: boolean): string {
  const messages = getLocalizedMessages(isChineseLanguage);
  const getBranchStatus = (branch: Branch) => {
    const badges = [];

    if (branch.exists.remote) {
      badges.push(`<span class="status-badge in-sync">${isChineseLanguage ? 'Remote: ✓' : 'Remote: ✓'}</span>`);
    } else {
      badges.push(`<span class="status-badge stale">${isChineseLanguage ? 'Remote: ✗' : 'Remote: ✗'}</span>`);
    }

    if (branch.isCurrentBranch) {
      badges.push(`<span class="status-badge current">${isChineseLanguage ? 'Current' : 'Current'}</span>`);
    }

    if (branch.isMainBranch) {
      badges.push(`<span class="status-badge main">${isChineseLanguage ? 'Main' : 'Main'}</span>`);
    }

    return badges.join('');
  };

  const deletableBranches = branches.filter((branch) => !branch.isMainBranch && !branch.isCurrentBranch);

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { 
                padding: 10px; 
                font-family: var(--vscode-font-family);
                color: var(--vscode-foreground);
            }
            .description {
                margin-bottom: 20px;
                line-height: 1.4;
            }
            .branch-list { 
                margin: 10px 0; 
            }
            .branch-item { 
                display: flex;
                align-items: center;
                padding: 8px;
                margin: 5px 0;
                background: var(--vscode-editor-background);
                border: 1px solid var(--vscode-panel-border);
                border-radius: 4px;
            }
            .branch-name {
                flex: 1;
                margin-right: 10px;
            }
            .status-badge {
                padding: 2px 6px;
                border-radius: 3px;
                font-size: 12px;
                margin-right: 8px;
            }
            .in-sync {
                background-color: var(--vscode-testing-iconPassed);
                color: var(--vscode-editor-background);
            }
            .stale {
                background-color: var(--vscode-testing-iconFailed);
                color: var(--vscode-editor-background);
            }
            .current {
                background-color: var(--vscode-statusBarItem-warningBackground);
                color: var(--vscode-statusBarItem-warningForeground);
            }
            
            .main {
                background-color: var(--vscode-statusBarItem-prominentBackground);
                color: var(--vscode-statusBarItem-prominentForeground);
            }
            
            .branch-item.disabled {
                opacity: 0.7;
                cursor: not-allowed;
            }
            
            .branch-item.disabled .checkbox-wrapper {
                pointer-events: none;
            }
            .actions { 
                margin: 10px 0; 
            }
            button { 
                background-color: var(--vscode-button-background);
                color: var(--vscode-button-foreground);
                border: none;
                padding: 6px 12px;
                cursor: pointer;
                margin: 5px;
                border-radius: 2px;
            }
            button:hover {
                background-color: var(--vscode-button-hoverBackground);
            }
            button:disabled {
                opacity: 0.6;
                cursor: not-allowed;
                background-color: var(--vscode-button-secondaryBackground);
            }
            .checkbox-wrapper {
                margin-right: 10px;
            }
            #select-all {
                margin-bottom: 10px;
            }
            .no-branches {
                padding: 20px;
                text-align: center;
                color: var(--vscode-descriptionForeground);
            }
        </style>
    </head>
    <body>
        <div class="description">
            ${messages.description}
        </div>
        <div class="actions">
            <button id="refreshBtn" onclick="refresh()">${messages.refreshButton}</button>
        </div>
        
        ${
          branches.length > 0
            ? `
                <label id="select-all">
                    <input type="checkbox" onclick="toggleAll(this.checked)">
                    ${messages.selectAll}
                </label>
                
                <div class="branch-list">
                    ${branches
                      .map(
                        (branch) => `
                            <div class="branch-item ${branch.isMainBranch || branch.isCurrentBranch ? 'disabled' : ''}">
                                <div class="checkbox-wrapper">
                                    <input type="checkbox" 
                                        class="branch-checkbox" 
                                        data-branch="${branch.name}"
                                        ${branch.isMainBranch || branch.isCurrentBranch ? 'disabled' : ''}>
                                </div>
                                <span class="branch-name">${branch.name}</span>
                                ${getBranchStatus(branch)}
                            </div>
                        `
                      )
                      .join('')}
                </div>

                <div class="actions">
                    <button id="deleteBtn" 
                            onclick="deleteSelected()"
                            ${deletableBranches.length === 0 ? 'disabled' : ''}>
                        ${messages.deleteSelectedButton}
                    </button>
                </div>
            `
            : `
                <div class="no-branches">
                    ${messages.noBranches}
                </div>
            `
        }

        <script>
            const vscode = acquireVsCodeApi();

            // Get all button elements
            const allButtons = () => document.querySelectorAll('button');
            const checkboxes = () => document.querySelectorAll('.branch-checkbox');

            // Disable all interactive elements
            function setControlsEnabled(enabled) {
                allButtons().forEach(button => button.disabled = !enabled);
                checkboxes().forEach(checkbox => checkbox.disabled = !enabled || checkbox.closest('.branch-item').classList.contains('disabled'));
                const selectAllCheckbox = document.querySelector('#select-all input[type="checkbox"]');
                if (selectAllCheckbox) {
                    selectAllCheckbox.disabled = !enabled;
                }
            }

            // Listen for messages from extension
            window.addEventListener('message', event => {
                const message = event.data;
                switch (message.type) {
                    case 'setControlsState':
                        setControlsEnabled(message.enabled);
                        break;
                }
            });

            async function refresh() {
                setControlsEnabled(false);
                vscode.postMessage({ type: 'refresh' });
            }

            async function deleteSelected() {
                const selectedBranches = Array.from(document.querySelectorAll('.branch-checkbox:checked:not(:disabled)'))
                    .map(checkbox => checkbox.dataset.branch);
                
                if (selectedBranches.length === 0) {
                    return;
                }

                setControlsEnabled(false);
                vscode.postMessage({ 
                    type: 'confirmDelete',
                    branches: selectedBranches
                });
            }

            function toggleAll(checked) {
                document.querySelectorAll('.branch-checkbox:not(:disabled)')
                    .forEach(checkbox => checkbox.checked = checked);
            }
        </script>
    </body>
    </html>
  `;
}

export function getLoadingContent(message: string, isChineseLanguage: boolean): string {
  const messages = getLocalizedMessages(isChineseLanguage);
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { 
                padding: 10px; 
                font-family: var(--vscode-font-family);
                color: var(--vscode-foreground);
            }
            .description {
                margin-bottom: 20px;
                line-height: 1.4;
            }
            .status-message {
                margin: 20px 0;
                padding: 10px;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .loading-spinner {
                width: 16px;
                height: 16px;
                border: 2px solid var(--vscode-foreground);
                border-radius: 50%;
                border-top-color: transparent;
                animation: spin 1s linear infinite;
            }
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        </style>
    </head>
    <body>
        <div class="description">
            ${messages.description}
        </div>
        <div class="status-message">
            <div class="loading-spinner"></div>
            <span>${message}</span>
        </div>
    </body>
    </html>
  `;
}

export function getReadyContent(isChineseLanguage: boolean): string {
  const messages = getLocalizedMessages(isChineseLanguage);
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { 
                padding: 10px; 
                font-family: var(--vscode-font-family);
                color: var(--vscode-foreground);
            }
            .description {
                margin-bottom: 20px;
                line-height: 1.4;
            }
            .actions { 
                margin: 10px 0; 
            }
            button { 
                background-color: var(--vscode-button-background);
                color: var(--vscode-button-foreground);
                border: none;
                padding: 6px 12px;
                cursor: pointer;
                margin: 5px;
                border-radius: 2px;
            }
            button:hover {
                background-color: var(--vscode-button-hoverBackground);
            }
            button:disabled {
                opacity: 0.6;
                cursor: not-allowed;
                background-color: var(--vscode-button-secondaryBackground);
            }
        </style>
    </head>
    <body>
        <div class="description">
            ${messages.description}
        </div>
        <div class="actions">
            <button id="refreshBtn" onclick="refresh()">${messages.refreshButton}</button>
        </div>
        <script>
            const vscode = acquireVsCodeApi();

            function refresh() {
                const refreshBtn = document.getElementById('refreshBtn');
                refreshBtn.disabled = true;
                vscode.postMessage({ type: 'refresh' });
            }
        </script>
    </body>
    </html>
  `;
}

export function getCheckingContent(isChineseLanguage: boolean): string {
  return getLoadingContent('Checking Git environment...', isChineseLanguage);
}
