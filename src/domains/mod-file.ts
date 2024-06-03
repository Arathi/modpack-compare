import Manifest from "./manifest";
import ModsToml from "./mods-toml";

export default interface ModFile {
  /**
   * 文件名
   */
  fileName: string;

  /**
   * 文件长度
   */
  length: number;

  /**
   * MANIFEST.MF
   */
  manifest?: Manifest;

  /**
   * mods.toml
   */
  modsToml?: ModsToml;
}
