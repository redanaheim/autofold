# autofold

This extension helps manage folds in Visual Studio Code.

## Features

When you open a new file, the extension scans the file for comments that end with `autofold/fold_next`. For example in TypeScript for folding a function into a single line,

```
// autofold/fold_next
function (foo: string): number {
    return Number(foo);
}
```

You can also permanently fold by right-clicking and choosing "Fold Line Permanently", or by pressing `CTRL+[` on Mac, or `ALT+[` on Windows and Linux.

The extension also scans for regex lines, which end in the form `autofold/regex <your regex here>`. For example,

```
// autofold/regex (?:function|class)
```

folds lines that include function or class. These regexes use the JavaScript regex format.
