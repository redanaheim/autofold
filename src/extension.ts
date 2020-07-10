import * as vscode from "vscode";

// autofold/fold_next
const check_document = function (doc: vscode.TextDocument): void {
  if (doc === undefined) {
    return;
  }
  let fold_next = false;
  let regexes = [];
  for (let i = 0; i < doc.lineCount; i++) {
    var line = doc.lineAt(i).text;
    if (/.+autofold\/fold_next$/.test(line)) {
      fold_next = true;
      continue;
    }
    let regex_results = /.+autofold\/regex (.+)$/.exec(line);
    if (regex_results !== null) {
      regexes.push(new RegExp(regex_results[1], "i"));
    }
    if (fold_next) {
      vscode.commands.executeCommand("editor.fold", {
        selectionLines: [i],
        levels: 1,
        direction: "down",
      });
      fold_next = false;
    }
    for (const regex of regexes) {
      if (regex.test(line)) {
        vscode.commands.executeCommand("editor.fold", {
          selectionLines: [i],
          levels: 1,
          direction: "down",
        });
        fold_next = false;
      }
    }
  }
};

// autofold/fold_next
export function activate(context: vscode.ExtensionContext) {
  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    "autofold.fold_active_line",
    () => {
      if (!vscode.window.activeTextEditor) {
        return;
      }
      let line = vscode.window.activeTextEditor.document.lineAt(
        vscode.window.activeTextEditor?.selection.active.line
      );
      vscode.window.activeTextEditor.edit(
        (edit: vscode.TextEditorEdit): void => {
          edit.insert(
            new vscode.Position(
              line.lineNumber,
              line.firstNonWhitespaceCharacterIndex
            ),
            "// autofold/fold_next\n" +
              (/^(\s+)/.exec(line.text) || ["", ""])[1]
          );
        }
      );
      vscode.commands.executeCommand("editor.fold");
    }
  );

  context.subscriptions.push(disposable);
  if (vscode.window.activeTextEditor) {
    check_document(vscode.window.activeTextEditor.document);
  }
}

// vs-autofold/fold_next
vscode.workspace.onDidOpenTextDocument(check_document);
