use chrono::Local;
use clap::Parser;
use futures::SinkExt;
use iced::font::{Family, Weight};
use iced::widget::{column, row, *};
use iced::{
    executor, subscription, Alignment, Application, Command, Element, Font, Length, Padding,
    Settings, Subscription, Theme,
};
use simdev::preludes::*;
use simdev::report::run_device_main;
use simdev::report::DeviceContext;
use std::collections::VecDeque;
use std::process::exit;
use std::sync::Arc;
use tokio::sync::Mutex;

pub const MONOSPACE: Font = Font {
    family: Family::Monospace,
    weight: Weight::Normal,
    ..Font::DEFAULT
};

fn main() -> iced::Result {
    let _ = dotenvy::dotenv();
    env_logger::Builder::from_env(env_logger::Env::default().default_filter_or("off,simdev=info"))
        .init();

    GuiApp::run(Settings::default())
}

#[derive(Debug, Clone)]
struct GuiApp {
    ctx: Arc<Mutex<DeviceContext>>,
    cmd: Cmd,
    state: AppState,
    messages: VecDeque<String>,
}

#[derive(Debug, Clone)]
enum AppState {
    Loading,
    Error(String),
    Running(String),
}

impl Application for GuiApp {
    type Executor = executor::Default;
    type Message = GuiAppMessage;
    type Theme = Theme;
    type Flags = ();

    fn new(_flags: Self::Flags) -> (Self, Command<Self::Message>) {
        let cmd = Cmd::parse();
        let ctx = Arc::new(Mutex::new(DeviceContext { weight: 1.0 }));
        let app = GuiApp {
            ctx: ctx.clone(),
            cmd,
            state: AppState::Loading,
            messages: VecDeque::new(),
        };
        (app, Command::none())
    }

    fn title(&self) -> String {
        "DePHY Interact Demo".to_string()
    }

    fn update(&mut self, message: Self::Message) -> Command<Self::Message> {
        macro_rules! push_message {
            ($msg:expr) => {
                let t = Local::now();
                self.messages
                    .push_front(format!("[{}] {}", t.format("%H:%M:%S"), $msg));
            };
        }
        match message {
            GuiAppMessage::Noop => {}
            GuiAppMessage::Start(addr) => {
                self.state = AppState::Running(addr);
                push_message!("Device started.");
            }
            GuiAppMessage::Error(e) => {
                error!("{}", &e);
                self.state = AppState::Error(format!("Error: {}", e));
            }
            GuiAppMessage::Message(m) => {
                push_message!(m);
            }
            GuiAppMessage::CopyToClipboard(e) => {
                if let Err(e) = cli_clipboard::set_contents(e) {
                    error!("Failed to copy to clipboard: {}", e);
                }
            }
            GuiAppMessage::UpdateWeight(_) => {}
        }
        Command::none()
    }

    fn view(&self) -> Element<Self::Message> {
        let content = match &self.state {
            AppState::Loading => container(column![text("Loading...")]),
            AppState::Error(e) => container(column![text(e)]),
            AppState::Running(addr) => {
                let addr_line = container(
                    row![
                        text(format!("Signer: {}", addr)).font(MONOSPACE).size(20),
                        button("Copy Address")
                            .on_press(GuiAppMessage::CopyToClipboard(addr.clone()))
                            .padding(Padding::from([5, 10]))
                    ]
                    .align_items(Alignment::Center)
                    .spacing(10),
                );
                let messages = Column::with_children(self.messages.iter().map(|m| {
                    let m = m.clone();
                    Text::new(m).font(MONOSPACE).size(14).into()
                }));
                container(column![addr_line, horizontal_space(), messages].spacing(5))
                // return addr_line.into();/
            }
        };
        scrollable(content.padding(15).width(Length::Fill)).into()
    }

    fn subscription(&self) -> Subscription<Self::Message> {
        struct AppSubscription;

        let cmd = self.cmd.clone();
        let ctx = self.ctx.clone();

        subscription::channel(std::any::TypeId::of::<AppSubscription>(), 512, move |tx| {
            let tx = tx.clone();
            async move {
                loop {
                    if let Err(e) =
                        run_device_main(cmd.clone(), ctx.clone(), Some(tx.clone())).await
                    {
                        let _ = tx.clone().send(GuiAppMessage::Error(format!("{e}"))).await;
                    }
                    exit(255);
                }
            }
        })
    }
}
