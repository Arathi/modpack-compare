export type ModFileException = Error & {
  modFileName?: string;
};

export class ManifestException implements ModFileException {
  name: string = "ManifestException";
  message: string = "解析 MANIFEST.MF 时出现异常";
  line?: number;
  field?: string;

  constructor(message?: string, line?: number, field?: string) {
    this.line = line;
    this.field = field;
    
    if (message != undefined) {
      this.message = message;
    } else if (line !== undefined) {
      this.message = `解析第 ${line} 行出现问题`;
      if (field !== undefined) {
        this.message += `，字段名：${field}`;
      }
    }
  }
};

export class ModsTomlException implements ModFileException {
  name: string = "ModsTomlException";
  message: string = "解析 mods.toml 时出现异常";
  path?: string;

  constructor(message?: string, path?: string) {
    if (message !== undefined) {
      this.message = message;
    } else if (path !== undefined) {
      this.message = `解析 ${path} 时出现异常`;
    }
  }
}
