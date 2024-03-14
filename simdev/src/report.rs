use crate::preludes::*;
use crate::rings::AppRingsProvider;
use crate::rings::BackendBehaviour;
use borsh::{to_vec, BorshDeserialize, BorshSerialize};
use dephy_edge::preludes::DephySessionStore;
use futures::SinkExt;
use iced::futures::channel::mpsc::Sender;
use rand::rngs::OsRng;
use rand::Rng;
use rings_node::provider::Provider;
use std::sync::Arc;
use std::time::Duration;
use tokio::sync::Mutex;
use tokio::time::sleep;

#[derive(Clone)]
pub struct DeviceContext {
    pub weight: f64,
    pub session: DephySessionStore,
}

impl Default for DeviceContext {
    fn default() -> Self {
        Self {
            weight: 1.0,
            session: DephySessionStore::new(),
        }
    }
}

#[derive(Debug, Clone, BorshSerialize, BorshDeserialize)]
struct EventData {
    original: f64,
    weight: f64,
    actually: f64,
}

pub async fn run_device_main(
    cmd: Cmd,
    ctx: Arc<Mutex<DeviceContext>>,
    tx: Option<Sender<GuiAppMessage>>,
) -> Result<()> {
    let report_to: Vec<_> = [0u8; 20].into();
    let signer = match &cmd.from {
        None => random_signing_key(),
        Some(key) => parse_signing_key(key.replace("0x", ""))?,
    };
    let d = Duration::from_secs(cmd.interval);
    let http = reqwest::Client::new();

    let session_store = ctx.clone();
    let session_store = session_store.lock().await.session.clone();

    macro_rules! tx_send {
        ($msg:expr) => {
            if let Some(tx) = &tx {
                tx.clone().send($msg).await?;
            }
        };
    }

    let addr = get_eth_address(&signer.clone().into());
    info!("Signer: {}", &addr);
    tx_send!(GuiAppMessage::Start(addr));

    tx_send!(GuiAppMessage::Message(format!(
        "Started with arguments: {:?}",
        &cmd
    )));

    let rings_provider = Provider::create(&signer).await?;
    let rings_handler = BackendBehaviour {
        provider: rings_provider.clone(),
        ctx: ctx.clone(),
        tx: tx.clone(),
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

        let session = session_store.fetch().await;

        let (payload, _) = signer
            .create_message(session.0, Some(session.1),MessageChannel::Normal(233), payload, to, None)
            .await?;
        info!("Fake report: {:?}", &report.weight);
        tx_send!(GuiAppMessage::Message(format!("Published {:?}", &report)));
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
