import { useEffect, useMemo, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { Grid, Input, Button, InputProps, Table, TableProps, Progress } from '@arco-design/web-react';
import ModFile from "./domains/mod-file";

import '@arco-design/web-react/dist/css/arco.css';
import './App.less';
import { parseModFile } from "./utils/parse-mod-file";
import { formatFileSize } from "./utils/file-size";

const { Row, Col } = Grid;
type ModFiles = Record<string, ModFile>;

interface Response<D> {
  code: number;
  message: string;
  data?: D;
}

function App() {
  const [modsDir, setModsDir] = useState("");
  const [modsDirStatus, setModsDirStatus] = useState<InputProps['status']>(undefined);
  const [modFiles, setModFiles] = useState<ModFile[]>([]);
  const [loaded, setLoaded] = useState(0);
  const [amount, setAmount] = useState(0);

  const progress = useMemo(() => {
    if (amount == 0) return 0;
    return loaded * 100 / amount;
  }, [loaded, amount]);

  async function openModsDir() {
    const resp = await invoke<Response<string[]>>('open_mods_dir', {
      path: modsDir,
    });
    console.debug(`获取到模组文件如下：`, resp);

    if (resp.code !== 0 || resp.data === undefined) {
      console.warn(`获取文件列表失败！`);
      return;
    }

    const modFiles: ModFile[] = [];
    setAmount(resp.data.length);
    for (const modFilePath of resp.data) {
      const modFile = await readModFile(modFilePath);
      modFiles.push(modFile);
      setLoaded(loaded + 1);
    }
    setModFiles(modFiles);
  }

  async function readModFile(modFilePath: string): Promise<ModFile> {
    // console.info(`开始加载模组文件：`, modFilePath);
    const startAt = new Date().valueOf();
    const resp = await invoke<Response<number[]>>('read_mod_file', {
      path: modFilePath,
    });
    // console.info(`获取模组文件 ${modFilePath} 内容：`, resp);

    if (resp.code !== 0 || resp.data === undefined) {
      console.warn(`获取模组文件失败：`, modFilePath);
      throw "读取文件异常";
    }
    
    const bytes = new Uint8Array(resp.data);
    const modFile = await parseModFile(modFilePath, bytes);
    const duration = new Date().valueOf() - startAt;
    console.info(`模组 ${modFilePath} 加载完成，耗时 ${duration} ms`);
    return modFile;
  }

  const columns: TableProps<ModFile>['columns'] = [
    {
      key: 'file-name',
      title: '文件名',
      dataIndex: 'fileName',
    },
    {
      key: 'length',
      title: '大小',
      dataIndex: 'length',
      render: (length) => formatFileSize(length),
    },
    {
      key: 'manifest',
      title: 'MANIFEST.MF',
      render: (_, modFile) => {
        const exists = modFile.manifest !== undefined;
        const color = exists ? 'green' : 'red';
        const text = exists ? '存在' : '不存在';
        return <span style={{color}}>{text}</span>;
      },
    },
    {
      key: 'mods-toml',
      title: 'mods.toml',
      render: (_, modFile) => {
        const exists = modFile.modsToml !== undefined;
        const color = exists ? 'green' : 'red';
        const text = exists ? '存在' : '不存在';
        return <span style={{color}}>{text}</span>;
      },
    },
  ];

  return (
    <>
      <Row gutter={8}>
        <Col flex={1}>
          <Input
            placeholder="整合包模组目录"
            value={modsDir}
            onChange={(value) => setModsDir(value)}
            status={modsDirStatus}
          />
        </Col>
        <Col flex={"none"}>
          <Button type="primary" onClick={ openModsDir }>打开</Button>
        </Col>
      </Row>
      <Row style={{ marginTop: 8 }}>
        <Progress percent={progress} />
      </Row>
      <Row style={{ marginTop: 8 }}>
        <Col>
          <Table columns={columns} data={modFiles} />
        </Col>
      </Row>
    </>
  );
}

export default App;
