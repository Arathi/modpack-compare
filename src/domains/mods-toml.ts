export default interface ModsToml {
  /**
   * 模组加载器
   */
  modLoader: string;

  /**
   * 加载器版本
   */
  loaderVersion: string;

  /**
   * 模组
   */
  mods: Record<string, Mod>;
}

export interface Mod {
  /**
   * 模组ID
   */
  modId: string;

  /**
   * 版本
   */
  version: string;

  /**
   * 名称
   */
  displayName: string;

  /**
   * 依赖
   */
  dependencies: Dependency[];
}

export interface Dependency {
  /**
   * 模组ID
   */
  modId: string;

  /**
   * 是否必要
   */
  mandatory: boolean;

  /**
   * 版本范围
   */
  versionRange: string;

  /**
   * 加载顺序
   */
  ordering: string;

  /**
   * Side
   */
  side: Side;
}

export type Side = "BOTH" | "CLIENT" | "SERVER";
