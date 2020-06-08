import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { paramCase, pascalCase } from "change-case";

export function activate(context: vscode.ExtensionContext) {
  console.log('Extension "momentum-code" is now active!');

  let createComponent = vscode.commands.registerCommand(
    "extension.createComponent",
    (uri: vscode.Uri) => {
      var templateDir = path.join(__dirname, `..`, `template`);

      var controllerDir = `${templateDir}/template.controller.txt`;
      var modelDir = `${templateDir}/template.model.txt`;
      var indexDir = `${templateDir}/index.txt`;

      vscode.window
        .showInputBox({ prompt: `Flutter - Momentum Component Name` })
        .then((input) => {
          if (input !== undefined) {
            fs.lstat(uri.fsPath, (err, stats) => {
              if (err === null || err.code === undefined) {
                if (stats.isDirectory()) {
                  var folderPath = `${uri.fsPath}/${paramCase(input)}`;
                  fs.lstat(folderPath, (err, stats) => {
                    if (err !== null && err.code !== undefined) {
                      if (err.code === `ENOENT`) {
                        fs.mkdir(folderPath, () => {
                          createCodeFile(
                            folderPath,
                            input,
                            `controller`,
                            controllerDir
                          );
                          createCodeFile(folderPath, input, `model`, modelDir);
                          createCodeFile(folderPath, input, ``, indexDir, true);
                        });
                      }
                    } else {
                      if (stats.isDirectory()) {
                        vscode.window.showErrorMessage(
                          `"${paramCase(
                            input
                          )}" already exists in the selected directory.`
                        );
                      }
                    }
                  });
                }
              }
            });
          }
        });
    }
  );

  context.subscriptions.push(createComponent);
}

export function deactivate() {}

function createCodeFile(
  basePath: string,
  name: string,
  type: string,
  generatePath: string,
  isIndex: boolean = false
): void {
  var filePath = `${basePath}/${paramCase(name)}.${type}.dart`;
  fs.lstat(filePath, (err, stats) => {
    if (err !== null) {
      if (err.code !== undefined && err.code === `ENOENT`) {
        fs.readFile(generatePath, (err, data) => {
          var str = data.toString();
          let template: string;
          if (!isIndex) {
            template = str.replace(
              new RegExp("MomentumTemplate", "g"),
              pascalCase(name)
            );
          } else {
            template = str.replace(
              new RegExp("MomentumTemplate", "g"),
              paramCase(name)
            );
          }
          if (!isIndex) {
            fs.writeFileSync(
              `${basePath}/${paramCase(name)}.${type}.dart`,
              template
            );
          } else {
            fs.writeFileSync(`${basePath}/index.dart`, template);
          }
        });
        return;
      }
      if (!isIndex) {
        throw Error(
          `${pascalCase(
            name
          )} code file named "${name}.${type}.dart" already exists.`
        );
      } else {
        throw Error(`${name} code file named "index.dart" already exists.`);
      }
    }
  });
}
