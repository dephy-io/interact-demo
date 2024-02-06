use crate::preludes::*;
use borsh::to_vec;
use rand::rngs::OsRng;
use rand::Rng;
use std::time::{Duration, SystemTime, UNIX_EPOCH};
use tokio::time::sleep;

pub async fn run_device_main(cmd: &Cmd, args: &RunDeviceArgs) -> Result<()> {
    let report_to: Vec<_> = [0u8; 20].into();
    let signer = match &args.from {
        None => random_signing_key(),
        Some(key) => parse_signing_key(key.replace("0x", ""))?,
    };
    let d = Duration::from_secs(args.interval);
    let http = reqwest::Client::new();

    info!("Signer: {}", get_eth_address(&signer.clone().into()));

    loop {
        let report = OsRng.gen_range(0.1..100.0);
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
