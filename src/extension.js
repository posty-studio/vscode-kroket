const vscode = require('vscode');
const config = require(vscode.workspace.rootPath + '/kroket.config.js');

const isCssValue = (line) => line.match(/.*:[\s]*/);

function activate(context) {
    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument((e) => {
            if (!e.document.isDirty && e.document.fileName.endsWith('kroket.config.js')) {
                vscode.window
                    .showInformationMessage(
                        'Your Kroket config file has changed. Please reload your workspace for the changes to take effect.',
                        'Reload'
                    )
                    .then((choice) => {
                        if (choice === 'Reload') {
                            vscode.commands.executeCommand('workbench.action.reloadWindow');
                        }
                    });
            }
        })
    );

    context.subscriptions.push(
        vscode.languages.registerCompletionItemProvider('scss', {
            provideCompletionItems(document, position) {
                let completions = [];
                const linePrefix = document.lineAt(position).text.substr(0, position.character);

                if (config.items) {
                    const items = Object.entries(config.items).filter((item) => item[1].output.includes('sass'));

                    if (items && isCssValue(linePrefix)) {
                        for (const [key, value] of items) {
                            const item = new vscode.CompletionItem(`get-${key}`, vscode.CompletionItemKind.Function);
                            const options = Object.keys(value.items).join(',');

                            item.insertText = new vscode.SnippetString(`get-${key}('\${1|${options}|}')`);
                            item.sortText = '0';

                            completions.push(item);
                        }
                    }
                }

                if (config.breakpoints) {
                    for (const [key, value] of Object.entries(config.breakpoints)) {
                        const item = new vscode.CompletionItem(
                            `media-query('${key}')`,
                            vscode.CompletionItemKind.Function
                        );

                        item.detail = value;
                        item.insertText = new vscode.SnippetString(`@include media-query('${key}') {\n\t\${1}\n}`);
                        item.sortText = '0';

                        completions.push(item);
                    }
                }

                if (config.utilities) {
                    for (const [key, value] of Object.entries(config.utilities)) {
                        const item = new vscode.CompletionItem(
                            `apply-utility('${key}')`,
                            vscode.CompletionItemKind.Function
                        );
                        const options = Object.keys(value.items).join(',');

                        item.insertText = new vscode.SnippetString(
                            `@include apply-utility('${key}', '\${1|${options}|}');`
                        );
                        item.sortText = '0';

                        completions.push(item);

                        if (isCssValue(linePrefix)) {
                            const getUtilityItem = new vscode.CompletionItem(
                                `get-utility('${key}')`,
                                vscode.CompletionItemKind.Function
                            );

                            getUtilityItem.insertText = new vscode.SnippetString(
                                `get-utility('${key}', '\${1|${options}|}')`
                            );
                            getUtilityItem.sortText = '0';

                            completions.push(getUtilityItem);
                        }
                    }
                }

                return completions;
            },
        })
    );
}

function deactivate() {}

module.exports = {
    activate,
    deactivate,
};
