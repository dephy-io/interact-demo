use clap::Parser;
use simdev::preludes::*;
use simdev::report::run_device_main;
use simdev::report::DeviceContext;
use std::sync::Arc;
use tokio::sync::Mutex;

#[tokio::main]
async fn main() -> Result<()> {
    let _ = dotenvy::dotenv();
    env_logger::Builder::from_env(env_logger::Env::default().default_filter_or("off,simdev=info"))
        .init();
    let cmd = Cmd::parse();

    let ctx = Arc::new(Mutex::new(DeviceContext::default()));
    run_device_main(cmd, ctx, None).await?;
    Ok(())
}
