use crate::preludes::*;
use crate::rings::AppRingsProvider;
use crate::rings::BackendBehaviour;
use borsh::{to_vec, BorshDeserialize, BorshSerialize};
use rand::rngs::OsRng;
use rand::Rng;
use rings_node::provider::Provider;
use std::sync::Arc;
use std::time::Duration;
use tokio::sync::Mutex;
use tokio::time::sleep;

#[derive(Debug, Clone, Copy)]
pub struct DeviceContext {
    pub weight: f64,
}

#[derive(Debug, Clone, BorshSerialize, BorshDeserialize)]
struct EventData {
    original: f64,
    weight: f64,
    actually: f64,
}

pub async fn run_device_main(cmd: &Cmd, args: &RunDeviceArgs) -> Result<()> {
    let ctx = Arc::new(Mutex::new(DeviceContext { weight: 1.0 }));

    let report_to: Vec<_> = [0u8; 20].into();
    let signer = match &args.from {
        None => random_signing_key(),
        Some(key) => parse_signing_key(key.replace("0x", ""))?,
    };
    let d = Duration::from_secs(args.interval);
    let http = reqwest::Client::new();

    info!("Signer: {}", get_eth_address(&signer.clone().into()));

    let rings_provider = Provider::create(&signer).await?;
    let rings_handler = BackendBehaviour {
        provider: rings_provider.clone(),
        ctx: ctx.clone(),
    };
    let p_move = rings_provider.clone();
    p_move.init(
        &vec![cmd.rings_relay_endpoint.clone()],
        Arc::new(rings_handler),
    )?;

    loop {
        let weight = ctx.lock().await.weight;
        let report = OsRng.gen_range(0.1..100.0);
        let report = EventData {
            original: report,
            weight,
            actually: report * weight,
        };

        let to = Some(report_to.clone());

        let payload = to_vec(&report)?;
        let (payload, _) = signer
            .create_message(MessageChannel::Normal(233), payload, to, None)
            .await?;
        info!("Fake report: {:?}", &report);
        let payload = to_vec(&payload)?;
        info!("Hex: 0x{}", hex::encode(payload.as_slice()));

        match http
            .post(cmd.dephy_http_endpoint.as_str())
            .body(payload)
            .header("content-type", "application/x-dephy")
            .send()
            .await
        {
            Ok(res) => {
                info!("publish message: {}", res.text().await?);
            }
            Err(e) => {
                error!("publish message: {e}");
            }
        }

        sleep(d).await;
    }
}
