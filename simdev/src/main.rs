mod crypto;
mod nostr;
mod preludes;
mod report;

use clap::Parser;
use preludes::*;
use report::run_device_main;

#[tokio::main]
async fn main() -> Result<()> {
    let _ = dotenvy::dotenv();
    env_logger::Builder::from_env(env_logger::Env::default().default_filter_or("info")).init();
    let cmd = Cmd::parse();
    match &cmd.command {
        Command::RunDevice(args) => run_device_main(&cmd, args).await?,
    };
    Ok(())
}