import * as vscode from 'vscode';
import { BranchPrunerViewProvider } from './providers/BranchPrunerViewProvider';

/**
 * Extension activation entry point
 * Registers the WebView provider for Git Branch Pruner
 */
export function activate(context: vscode.ExtensionContext) {
  const provider = new BranchPrunerViewProvider(context.extensionUri);
  context.subscriptions.push(vscode.window.registerWebviewViewProvider('branchPrunerView', provider));
}


export function deactivate() {}
