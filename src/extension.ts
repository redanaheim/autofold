import * as vscode from "vscode";

const is_string = function(thing?: unknown): thing is string {
  if (thing === "") {
      return true;
  }
  else if (!thing) {
      return false;
  }
  else if (typeof thing === "string") {
      return true;
  }
  else {
      return false;
  }
}

// autofold/fold_next
const check_document = function (doc: vscode.TextDocument): void {
  if (doc === undefined) {
    return;
  }
  let fold_next = false;
  let regexes_no_type: any = vscode.workspace
    .getConfiguration()
    .get("autofold.more_fold_regexes"); // type unknown
  let valid_regexes: RegExp[] = []
  if (regexes_no_type instanceof Array) {
    regexes_no_type.forEach(el => {
      if (is_string(el)) {
        try {
          valid_regexes.push(new RegExp(el));
        }
        catch (err) {
          return;
        }
      }
    })
  }
  let fold_regex: any = vscode.workspace
    .getConfiguration()
    .get("autofold.fold_regex");
  if (fold_regex !== "" && typeof fold_regex === "string") {
    try {
      regexes_no_type.push(new RegExp(fold_regex));
    } catch (err) {}
  }
  for (let i = doc.lineCount - 1; i >= 0; i--) {
    var line = doc.lineAt(i).text;
    if (/.+autofold\/fold_next$/.test(line)) {
      fold_next = true;
      continue;
    }
    let regex_results = /.+autofold\/regex (.+)$/.exec(line);
    if (regex_results !== null) {
      try {
        valid_regexes.push(new RegExp(regex_results[1]));
      }
      catch (err) {}
    }
    if (fold_next) {
      vscode.commands.executeCommand("editor.fold", {
        selectionLines: [i],
        levels: 1,
        direction: "down",
      });
      fold_next = false;
    }
    let skip_rest = false;
    for (const regex of regexes_no_type) {
      if (regex.test(line) && !skip_rest) {
        vscode.commands.executeCommand("editor.fold", {
          selectionLines: [i],
          levels: 1,
          direction: "down",
        });
        fold_next = false;
        skip_rest = true;
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
