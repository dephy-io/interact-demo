use crate::preludes::*;
use crate::report::DeviceContext;
use async_trait::async_trait;

use futures::channel::mpsc::Sender;
use futures::SinkExt;
use rings_core::dht::Did;
use rings_core::ecc::SecretKey as RingsSecretKey;
use rings_core::message::MessagePayload;
use rings_core::message::{Message, MessageVerificationExt};
use rings_core::session::SessionSkBuilder;
use rings_core::storage::MemStorage;
use rings_core::swarm::callback::SwarmCallback;
use rings_core::swarm::callback::SwarmEvent;
use rings_node::backend::types::BackendMessage;
use rings_node::processor::ProcessorBuilder;
use rings_node::processor::ProcessorConfig;
use rings_node::provider::Provider;
use rings_rpc::method::Method;
use rings_rpc::protos::rings_node::*;
use std::sync::Arc;
use std::time::Duration;
use tokio::sync::Mutex;

pub struct BackendBehaviour {
    pub provider: Arc<Provider>,
    pub ctx: Arc<Mutex<DeviceContext>>,
    pub tx: Option<Sender<GuiAppMessage>>,
}

#[async_trait]
impl SwarmCallback for BackendBehaviour {
    async fn on_inbound(&self, payload: &MessagePayload) -> Result<(), Box<dyn std::error::Error>> {
        let msg: Message = payload.transaction.data()?;
        let s = payload.transaction.signer();

        if let Message::CustomMessage(msg) = msg {
            let msg: BackendMessage = bincode::deserialize(msg.0.as_slice())?;
            if let BackendMessage::PlainText(msg) = msg {
                let i: f64 = msg.parse()?;
                let mut c = self.ctx.lock().await;
                c.weight = i;
                drop(c);
                let m = format!("Weight changed to {} by {}", i, s.to_string());
                info!("{}", &m);
                if let Some(tx) = &self.tx {
                    tx.clone().send(GuiAppMessage::Message(m)).await?
                }
            };
        }
        Ok(())
    }

    async fn on_event(&self, _event: &SwarmEvent) -> Result<(), Box<dyn std::error::Error>> {
        Ok(())
    }
}

#[async_trait]
pub trait AppRingsProvider {
    async fn create(key: &SigningKey) -> Result<Arc<Self>>;
    fn init(
        self: Arc<Self>,
        p2p_bootstrap_node_list: &Vec<String>,
        backend: Arc<dyn SwarmCallback + Send + Sync>,
    ) -> Result<()>;
}

#[async_trait]
impl AppRingsProvider for Provider {
    async fn create(key: &SigningKey) -> Result<Arc<Self>> {
        let key = key.to_bytes();
        let key: &[u8; 32] = key.as_slice().try_into()?;
        let key = libsecp256k1::SecretKey::parse(key)?;
        let key: RingsSecretKey = key.into();
        let did = Did::from(key.address());
        debug!("Local p2p node started with DID {}", did.to_string());

        let mut skb = SessionSkBuilder::new(did.to_string(), "secp256k1".to_string());
        let sig = key.sign(&skb.unsigned_proof());
        skb = skb.set_session_sig(sig.to_vec());
        let sk = skb.build()?;

        let config = ProcessorConfig::new("stun://stun.l.google.com:19302".to_string(), sk, 3);
        let storage = Box::new(MemStorage::new());
        let processor = Arc::new(
            ProcessorBuilder::from_config(&config)?
                .storage(storage)
                .build()?,
        );
        Ok(Arc::new(Self::from_processor(processor)))
    }

    fn init(
        self: Arc<Self>,
        p2p_bootstrap_node_list: &Vec<String>,
        backend: Arc<dyn SwarmCallback + Send + Sync>,
    ) -> Result<()> {
        let self_move = self.clone();
        self.set_swarm_callback(backend)?;
        tokio::spawn(async move { self_move.listen().await });

        let self_move = self.clone();
        tokio::spawn(async move {
            loop {
                let resp = self_move
                    .request(Method::NodeInfo, NodeInfoRequest {})
                    .await
                    .unwrap();
                debug!("NodeInfo: {:?}", resp);
                tokio::time::sleep(Duration::from_secs(30)).await;
            }
        });

        for url in p2p_bootstrap_node_list {
            let provider = self.clone();
            let url = url.to_string();
            tokio::spawn(async move {
                // todo: monitor connection to bootstrap nodes
                let resp = provider
                    .request(
                        Method::ConnectPeerViaHttp,
                        ConnectPeerViaHttpRequest {
                            url: url.to_string(),
                        },
                    )
                    .await;
                match resp {
                    Ok(resp) => {
                        info!("Connecting to {}: {}", url, resp);
                    }
                    Err(e) => error!("Connecting to {}: {}", url, e),
                }
            });
        }

        Ok(())
    }
}

#[async_trait]
pub trait ToRingsDIDString {
    fn to_did_string(&self) -> String;
}

#[async_trait]
impl ToRingsDIDString for Vec<u8> {
    fn to_did_string(&self) -> String {
        format!("0x{}", hex::encode(self))
    }
}
