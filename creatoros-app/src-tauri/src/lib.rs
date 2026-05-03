use std::process::Command;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct ToolResult {
    success: bool,
    output: String,
    error: Option<String>,
}

fn get_tools_path() -> String {
    let home = std::env::var("HOME").unwrap_or_default();
    format!("{}/Developer/Projects/creative/tools", home)
}

fn run_python_tool(script: &str, args: Vec<&str>) -> ToolResult {
    let tools_path = get_tools_path();
    let mut cmd = Command::new("python3");
    cmd.arg(format!("{}/{}", tools_path, script)).current_dir(&tools_path);
    for arg in args { cmd.arg(arg); }

    match cmd.output() {
        Ok(out) => ToolResult {
            success: out.status.success(),
            output: String::from_utf8_lossy(&out.stdout).to_string(),
            error: if out.status.success() { None } else { Some(String::from_utf8_lossy(&out.stderr).to_string()) },
        },
        Err(e) => ToolResult { success: false, output: String::new(), error: Some(e.to_string()) },
    }
}

#[tauri::command]
fn run_idea_generator(count: Option<u32>) -> ToolResult {
    run_python_tool("idea_generator.py", vec!["-n", &count.unwrap_or(5).to_string()])
}

#[tauri::command]
fn run_script_generator(topic: String, style: Option<String>, duration: Option<String>) -> ToolResult {
    let mut args = vec![topic.as_str()];
    let style_val = style.unwrap_or_default();
    let duration_val = duration.unwrap_or_default();
    if !style_val.is_empty() { args.push("--style"); args.push(&style_val); }
    if !duration_val.is_empty() { args.push("--duration"); args.push(&duration_val); }
    run_python_tool("script_generator.py", args)
}

#[tauri::command]
fn run_viral_content(topic: String) -> ToolResult {
    run_python_tool("viral_content.py", vec![&topic])
}

#[tauri::command]
fn run_youtube_analytics(channel: Option<String>) -> ToolResult {
    run_python_tool("youtube_analytics.py", vec![&channel.unwrap_or_else(|| "Anshuman Parmar".to_string())])
}

#[tauri::command]
fn run_content_calendar() -> ToolResult {
    run_python_tool("content_calendar.py", vec![])
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            run_idea_generator, run_script_generator, run_viral_content,
            run_youtube_analytics, run_content_calendar
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
