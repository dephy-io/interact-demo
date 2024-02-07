pub use crate::crypto::*;
pub use anyhow::{anyhow, bail, Result};
pub use bytes::Bytes;
use clap::{Args, Parser, Subcommand};
pub use dephy_types::preludes::*;
pub use k256::ecdsa::{SigningKey, VerifyingKey};
pub use log::{debug, error, info, warn};
pub use nostr_sdk::{
    secp256k1::SecretKey, Alphabet, Client, Event, EventBuilder, Filter, Keys, Kind,
    RelayPoolNotification, Tag, TagKind, Timestamp,
};
use std::{env, path::PathBuf};

pub static DEPHY_TOPIC: &'static str = "/dephy/signed_message";
pub static DEPHY_P2P_TOPIC: &'static str = "/dephy/p2p/#";
pub static DEPHY_P2P_TOPIC_PREFIX: &'static str = "/dephy/p2p/";

pub static ETH_ADDRESS_PREFIX: &'static str = "0x";

#[derive(Parser, Clone, Debug)]
pub struct Cmd {
    #[arg(
        short = 'd',
        long,
        env,
        default_value = "http://127.0.0.1:3883/dephy/signed_message"
    )]
    pub dephy_http_endpoint: String,
    #[arg(short = 'r', long, env, default_value = "https://rings-poc.dephy.io")]
    pub rings_relay_endpoint: String,
    #[command(subcommand)]
    pub command: Command,
}

#[derive(Subcommand, Clone, Debug)]
pub enum Command {
    RunDevice(RunDeviceArgs),
}

#[derive(Args, Clone, Debug)]
pub struct RunDeviceArgs {
    /// Report signer, no value means random signer
    #[arg(short, long, env)]
    pub from: Option<String>,

    /// Send interval in seconds
    #[arg(short, long, env, default_value_t = 10)]
    pub interval: u64,
}

fn get_relative_path(p: &str) -> PathBuf {
    let mut path = env::current_exe().unwrap();
    path.pop();
    path.push(p);
    path
}
