use std::process::Command;
use std::fs;
use std::path::PathBuf;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct ToolResult {
    success: bool,
    output: String,
    error: Option<String>,
}

#[derive(Serialize, Deserialize)]
pub struct JsonDataResult {
    success: bool,
    data: Option<String>,
    error: Option<String>,
}

fn get_project_path() -> PathBuf {
    let home = std::env::var("HOME").unwrap_or_default();
    PathBuf::from(format!("{}/Developer/Projects/creative", home))
}

fn get_tools_path() -> String {
    get_project_path().join("tools").to_string_lossy().to_string()
}

fn get_output_path() -> PathBuf {
    get_project_path().join("tools").join("output")
}

fn get_shared_data_path() -> PathBuf {
    get_project_path().join("shared").join("data")
}

fn run_python_tool(script: &str, args: Vec<String>) -> ToolResult {
    let tools_path = get_tools_path();
    let mut cmd = Command::new("python3");
    cmd.arg(format!("{}/{}", tools_path, script)).current_dir(&tools_path);
    for arg in &args { cmd.arg(arg); }

    match cmd.output() {
        Ok(out) => ToolResult {
            success: out.status.success(),
            output: String::from_utf8_lossy(&out.stdout).to_string(),
            error: if out.status.success() { None } else { Some(String::from_utf8_lossy(&out.stderr).to_string()) },
        },
        Err(e) => ToolResult { success: false, output: String::new(), error: Some(e.to_string()) },
    }
}

// ============ TOOL COMMANDS ============

#[tauri::command]
fn run_idea_generator(count: Option<u32>, topic: Option<String>) -> ToolResult {
    let count_str = count.unwrap_or(5).to_string();
    let mut args = vec!["-n".to_string(), count_str];
    if let Some(t) = topic {
        if !t.is_empty() {
            args.push("--topic".to_string());
            args.push(t);
        }
    }
    run_python_tool("idea_generator.py", args)
}

#[tauri::command]
fn run_script_generator(topic: String, style: Option<String>, duration: Option<String>) -> ToolResult {
    let mut args = vec![topic];
    if let Some(s) = style {
        if !s.is_empty() {
            args.push("--style".to_string());
            args.push(s);
        }
    }
    if let Some(d) = duration {
        if !d.is_empty() {
            args.push("--duration".to_string());
            args.push(d);
        }
    }
    run_python_tool("script_generator.py", args)
}

#[tauri::command]
fn run_description_generator(title: String) -> ToolResult {
    run_python_tool("description_generator.py", vec![title])
}

#[tauri::command]
fn run_viral_content(topic: String) -> ToolResult {
    run_python_tool("viral_content.py", vec![topic])
}

#[tauri::command]
fn run_youtube_analytics(channel: Option<String>) -> ToolResult {
    let channel_name = channel.unwrap_or_else(|| "Anshuman Parmar".to_string());
    run_python_tool("youtube_analytics.py", vec![channel_name])
}

#[tauri::command]
fn run_content_calendar() -> ToolResult {
    run_python_tool("content_calendar.py", vec![])
}

// ============ DATA LOADING COMMANDS ============

#[tauri::command]
fn read_youtube_data() -> JsonDataResult {
    // Try to read from tools/output first, then shared/data
    let output_path = get_output_path().join("youtube_analytics.json");
    let shared_path = get_shared_data_path().join("youtube_analytics.json");
    
    let path = if output_path.exists() {
        output_path
    } else if shared_path.exists() {
        shared_path
    } else {
        return JsonDataResult {
            success: false,
            data: None,
            error: Some("YouTube analytics data not found. Run YouTube Analytics to fetch data.".to_string()),
        };
    };
    
    match fs::read_to_string(&path) {
        Ok(content) => JsonDataResult {
            success: true,
            data: Some(content),
            error: None,
        },
        Err(e) => JsonDataResult {
            success: false,
            data: None,
            error: Some(e.to_string()),
        },
    }
}

#[tauri::command]
fn load_json_data(filename: String) -> JsonDataResult {
    let output_path = get_output_path().join(&filename);
    let shared_path = get_shared_data_path().join(&filename);
    
    let path = if output_path.exists() {
        output_path
    } else if shared_path.exists() {
        shared_path
    } else {
        return JsonDataResult {
            success: false,
            data: None,
            error: Some(format!("File not found: {}", filename)),
        };
    };
    
    match fs::read_to_string(&path) {
        Ok(content) => JsonDataResult {
            success: true,
            data: Some(content),
            error: None,
        },
        Err(e) => JsonDataResult {
            success: false,
            data: None,
            error: Some(e.to_string()),
        },
    }
}

#[tauri::command]
fn save_json_data(filename: String, data: String) -> JsonDataResult {
    let shared_path = get_shared_data_path();
    
    if let Err(e) = fs::create_dir_all(&shared_path) {
        return JsonDataResult {
            success: false,
            data: None,
            error: Some(format!("Failed to create directory: {}", e)),
        };
    }
    
    let file_path = shared_path.join(&filename);
    
    match fs::write(&file_path, &data) {
        Ok(_) => JsonDataResult {
            success: true,
            data: Some(data),
            error: None,
        },
        Err(e) => JsonDataResult {
            success: false,
            data: None,
            error: Some(e.to_string()),
        },
    }
}

#[tauri::command]
fn list_output_files() -> Vec<String> {
    let output_path = get_output_path();
    let mut files = Vec::new();
    
    if let Ok(entries) = fs::read_dir(&output_path) {
        for entry in entries.flatten() {
            if let Some(name) = entry.file_name().to_str() {
                if name.ends_with(".json") {
                    files.push(name.to_string());
                }
            }
        }
    }
    
    files
}

// ============ APP ENTRY ============

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            run_idea_generator,
            run_script_generator,
            run_description_generator,
            run_viral_content,
            run_youtube_analytics,
            run_content_calendar,
            read_youtube_data,
            load_json_data,
            save_json_data,
            list_output_files
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
