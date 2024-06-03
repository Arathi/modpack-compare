import ModFile from '@/domains/mod-file';
import * as fflate from 'fflate';
import { parse as parseToml, TomlPrimitive } from 'smol-toml';
import { ManifestException } from '@/exceptions/mod-file-exception';
import Manifest from '@/domains/manifest';
import ModsToml, { Mod, Dependency } from '@/domains/mods-toml';

export async function parseModFile(
  fileName: string, 
  bytes: Uint8Array,
): Promise<ModFile> {
  const length = bytes.length;
  const zip = fflate.unzipSync(bytes);
  const manifest = await parseManifest(fileName, zip['META-INF/MANIFEST.MF']);
  const modsToml = await parseModsToml(fileName, zip['META-INF/mods.toml']);
  return {
    fileName,
    length,
    manifest,
    modsToml,
  }
}

export async function parseManifest(
  modFileName: string,
  bytes?: Uint8Array
): Promise<Manifest | undefined> {
  if (bytes == undefined) {
    console.info(`${modFileName}的 MANIFEST.MF 文件不存在`);
    return undefined;
  }

  const utf8 = new TextDecoder();
  const content = utf8.decode(bytes);
  const lines = content.split("\n").map(line => line.trim());
  
  const manifest: Manifest = {};
  for (const line of lines) {
    const colonIndex = line.indexOf(":");
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex);
      const value = line.substring(colonIndex + 1);
      switch (key) {
        case 'Specification-Title':
          manifest.modId = value;
          break;
        case 'Implementation-Title':
          manifest.name = value;
          break;
        case 'Implementation-Version':
          manifest.version = value;
          break;
      }
    }
  }

  return manifest;
}

export async function parseModsToml(
  modFileName: string,
  bytes?: Uint8Array,
): Promise<ModsToml | undefined> {
  if (bytes == undefined) {
    console.info(`${modFileName}的 mods.toml 文件不存在`);
    return undefined;
  }

  const utf8 = new TextDecoder();
  const content = utf8.decode(bytes);
  
  const toml = parseToml(content);
  const {
    modLoader,
    loaderVersion,
  } = toml;
  const tomlMods: TomlPrimitive[] = toml.mods as any ?? [];
  const tomlDependencies: Record<string, Dependency[]> = toml.dependencies as any ?? {};

  const mods: Record<string, Mod> = {};
  for (const tomlMod of tomlMods) {
    const { modId, version, displayName } = tomlMod as any;
    const dependencies: Dependency[] = tomlDependencies[modId];
    const mod: Mod = {
      modId,
      version,
      displayName,
      dependencies,
    };
    mods[modId] = mod;
  }

  return {
    modLoader,
    loaderVersion,
    mods,
  } as ModsToml;
}
