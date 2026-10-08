use std::{fs, process::{Child, Command, Stdio}, sync::Mutex, time::{Instant,SystemTime,UNIX_EPOCH}, path::PathBuf};
use tauri::{Manager, path::BaseDirectory};
use serde_json::{json,Value};

fn fixture(app:&tauri::AppHandle,id:&str)->Result<(PathBuf,String),String>{
 let catalog:Value=serde_json::from_str(include_str!("../fixture-manifest.json")).map_err(|e|e.to_string())?;
 let item=catalog.as_array().unwrap().iter().find(|v|v["id"]==id).ok_or("unknown fixture")?;
 let name=item["file"].as_str().ok_or("missing fixture")?;
 Ok((app.path().resolve(format!("fixtures/{name}"),BaseDirectory::Resource).map_err(|e|e.to_string())?,item["kind"].as_str().unwrap().to_string()))
}
#[tauri::command]
fn fixture_path(app:tauri::AppHandle,id:String)->Result<String,String>{Ok(fixture(&app,&id)?.0.to_string_lossy().into_owned())}
#[tauri::command]
fn runtime_info()->Value{json!({"os":std::env::consts::OS,"arch":std::env::consts::ARCH,"tauri":"2.12.1","executable":std::env::current_exe().ok(),"helper":"随包自有 Swift 实验组件；调用本机 Apple 框架；未证明 Windows 或干净系统可用"})}
struct Job{child:Child,dir:PathBuf,started:Instant,status:String,result:Option<Value>}
#[derive(Default)] struct Jobs(Mutex<Option<Job>>);
fn snapshot(j:&mut Job)->Result<Value,String>{
 if j.status=="running" {
  if let Some(exit)=j.child.try_wait().map_err(|e|e.to_string())?{
   if exit.success(){match fs::read_to_string(j.dir.join("result.json")).ok().and_then(|s|serde_json::from_str::<Value>(&s).ok()){
    Some(mut r)=>{let paths:Vec<_>=r["files"].as_array().into_iter().flatten().filter_map(|v|v.as_str()).map(|s|j.dir.join(s)).collect();
     if !paths.is_empty()&&paths.iter().all(|p|p.is_file()) {r["paths"]=json!(paths);j.result=Some(r);j.status="ready".into()} else{j.status="failed".into()}}
    None=>j.status="failed".into()
   }}else{j.status="failed".into()}
  }
 }
 Ok(json!({"status":j.status,"elapsedMs":j.started.elapsed().as_millis(),"outputDirectory":j.dir,"result":j.result,"diagnostic":fs::read_to_string(j.dir.join("stderr.log")).unwrap_or_default(),"original":"未改写","partialPolicy":"失败／取消输出仅保留于实验目录，不发布为可用代理"}))
}
#[tauri::command]
fn start_probe(app:tauri::AppHandle,jobs:tauri::State<Jobs>,id:String,mode:String)->Result<Value,String>{
 let (input,kind)=fixture(&app,&id)?;
 let allowed=match kind.as_str(){"image"=>mode=="image","animation"=>mode=="frames","pdf"=>mode=="pdf","video"=>mode=="poster"||mode=="proxy",_=>false};
 if !allowed{return Err("unsupported fixture operation".into())}
 let mut guard=jobs.0.lock().map_err(|e|e.to_string())?;
 if let Some(j)=guard.as_mut(){snapshot(j)?;if j.status=="running"{return Err("another probe is running".into())}}
 let dir=app.path().app_cache_dir().map_err(|e|e.to_string())?.join("media-probe").join(format!("{}-{}",std::process::id(),SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_nanos()));
 fs::create_dir_all(&dir).map_err(|e|e.to_string())?;
 let helper=app.path().resolve("media-probe",BaseDirectory::Resource).map_err(|e|e.to_string())?;
 let stderr=fs::File::create(dir.join("stderr.log")).map_err(|e|e.to_string())?;
 let child=Command::new(helper).args([mode]).arg(input).arg(&dir).stdin(Stdio::null()).stdout(Stdio::null()).stderr(stderr).spawn().map_err(|e|e.to_string())?;
 *guard=Some(Job{child,dir,started:Instant::now(),status:"running".into(),result:None});snapshot(guard.as_mut().unwrap())
}
#[tauri::command]
fn probe_status(jobs:tauri::State<Jobs>)->Result<Value,String>{let mut g=jobs.0.lock().map_err(|e|e.to_string())?;match g.as_mut(){Some(j)=>snapshot(j),None=>Ok(json!({"status":"none"}))}}
#[tauri::command]
fn cancel_probe(jobs:tauri::State<Jobs>)->Result<Value,String>{
 let mut g=jobs.0.lock().map_err(|e|e.to_string())?;let j=g.as_mut().ok_or("no probe")?;
 snapshot(j)?;
 if j.status=="running"{
  match j.child.kill(){Ok(())=>{j.child.wait().map_err(|e|e.to_string())?;j.status="interrupted".into();},Err(e)=>{j.status="unknown".into();return Err(format!("cannot establish cancellation: {e}"))}}
 }
 snapshot(j)
}
fn main(){tauri::Builder::default().manage(Jobs::default()).invoke_handler(tauri::generate_handler![fixture_path,runtime_info,start_probe,probe_status,cancel_probe]).run(tauri::generate_context!()).expect("media prototype could not start");}
