import { useEffect, useRef } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { connInfoAtom, ringsClientAtom, ringsInfoAtom } from "../atoms.js";
import initRings, {
  Provider,
  BackendBehaviour,
  rings_node as RingsPb,
} from "@ringsnetwork/rings-node";
import RingsWasmUrl from "@ringsnetwork/rings-node/dist/rings_node_bg.wasm?url";
import { Wallet } from "ethers";

function hexToUint8Array(hexString) {
  // Remove the "0x" prefix if it exists
  if (hexString.startsWith("0x")) {
    hexString = hexString.slice(2);
  }
  const byteArray = [];
  for (let i = 0; i < hexString.length; i += 2) {
    byteArray.push(parseInt(hexString.substr(i, 2), 16));
  }
  return new Uint8Array(byteArray);
}

export default function _Connection() {
  const connInfo = useAtomValue(connInfoAtom);

  useEffect(() => {
    if (!connInfo) return;
    console.log("Starting connection with", connInfo);
  }, [connInfo]);

  if (!connInfo) return null;
  return (
    <>
      <RingsConnection />
      <ConnectionStatus />
    </>
  );
}

function RingsConnection() {
  const MESSAGE = useRef({});
  const TIMER = useRef({});

  const connInfo = useAtomValue(connInfoAtom);
  const setRingsInfo = useSetAtom(ringsInfoAtom);
  const setRingsClient = useSetAtom(ringsClientAtom);

  useEffect(() => {
    if (!connInfo) return;
    (async () => {
      console.log("Loading Rings WASM from " + RingsWasmUrl);
      const ringsWasm = await initRings(RingsWasmUrl);

      const callback = new BackendBehaviour(
        async (from, message) => {
          console.log("get custom message %s from %s", message, from);
        },
        async (from, message) => {
          console.log("get http response message %s from %s", message, from);
        },
        async (from, message) => {
          console.log("get buildin message %s from %s", message, from);
        },
      );
      const account = Wallet.createRandom();
      const signer = async (proof) => {
        let sig = await account.signMessage(proof);
        return hexToUint8Array(sig);
      };

      setRingsInfo((val) => {
        return {
          ...val,
          wasmLoaded: true,
          wasm: ringsWasm,
          accountAddress: account.address,
        };
      });

      // Don't ask why
      const ringsClient = await new Provider(
        "stun://stun.l.google.com:19302",
        100n, // stab timeout
        account.address, // account
        "eip191", // account type
        signer,
        callback,
      );
      await ringsClient.listen();
      setRingsClient(ringsClient);

      console.log("Connecting to relay node %s", connInfo.ringsNodeAddr);
      await ringsClient.request(
        "connectPeerViaHttp",
        RingsPb.ConnectPeerViaHttpRequest.create({
          url: connInfo.ringsNodeAddr,
        }),
      );
      setRingsInfo((val) => ({
        ...val,
        connectedToRelay: true,
      }));
    })().catch((e) => {
      console.error(e);
      setRingsInfo((val) => ({
        ...val,
        error: e,
      }));
    });
  }, [connInfo]);

  return null;
}

function ConnectionStatus() {
  const connInfo = useAtomValue(connInfoAtom);
  const ringsInfo = useAtomValue(ringsInfoAtom);

  useEffect(() => {
    if (!connInfo) return;
    console.log(1121, connInfo);
  }, [connInfo]);

  return (
    <>
      <p>rings: {JSON.stringify(ringsInfo)}</p>
    </>
  );
}
