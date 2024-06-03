// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs;
use std::path::Path;
use serde::Serialize;

#[derive(Serialize)]
struct Response<D> {
    code: i32,
    message: String,
    data: Option<D>,
}

#[tauri::command]
fn open_mods_dir(path: &str) -> Response<Vec<String>> {
    let mut code: i32 = 0;
    let mut message: String = String::from("成功");
    let mut data: Option<Vec<String>> = None;

    loop {
        let mods_path = Path::new(path);
        if !mods_path.is_dir() {
            code = 1;
            message = format!("{} 不是目录", path);
            break;
        }
        
        let result = fs::read_dir(path);
        match result {
            Err(err) => {
                code = 2;
                message = format!("{} 打开失败，返回错误：{}", path, err);
                break;
            },
            Ok(dir) => {
                data = list_files(dir);
                break;
            }
        }
    }

    Response {
        code: code,
        message: message,
        data: data,
    }
}

fn list_files(dir: fs::ReadDir) -> Option<Vec<String>> {
    let mut files = Vec::<String>::new();
    for dirent in dir {
        match dirent {
            Err(err) => {
                println!("列出文件失败：{}", err);
            },
            Ok(entry) => {
                let file_path_buf = entry.path();
                let file_path_option = file_path_buf.to_str();
                match file_path_option {
                    None => {
                        println!("文件名获取失败！");
                    },
                    Some(file_path) => {
                        if file_path.ends_with(".jar") {
                            files.push(file_path.to_string());
                        } else {
                            println!("{} 不是有效的模组文件", file_path);
                        }
                    }
                }
            }
        }
    }
    return Some(files);
}

#[tauri::command]
fn read_mod_file(path: &str) -> Response<Vec<u8>> {
    let mut code: i32 = 0;
    let mut message: String = String::from("成功");
    let mut data: Option<Vec<u8>> = None;

    println!("正在打开模组文件：{}", path);

    let mod_file_path = Path::new(path);
    if mod_file_path.is_file() {
        let result = fs::read(mod_file_path);
        match result {
            Err(err) => {
                code = 2;
                message = format!("{} 文件打开失败！{}", path, err);
            }
            Ok(bytes) => {
                println!("模组文件 {} 打开成功，长度：{}", path, bytes.len());
                data = Some(bytes);
            }
        }
    } else {
        code = 1;
        message = format!("{} 不是文件！", path);
    }
    
    Response {
        code: code,
        message: message,
        data: data,
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            open_mods_dir,
            read_mod_file,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
