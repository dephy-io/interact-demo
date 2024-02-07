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
import { useNostrHooksContext } from "nostr-hooks";
import { NostrHooksContextProvider } from "nostr-hooks";
import NDK from "@nostr-dev-kit/ndk";
import NDKCacheAdapterDexie from "@nostr-dev-kit/ndk-cache-dexie";
import { useMemo } from "react";
import { useListData } from "react-stately";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Spacer,
  Input,
  Button,
} from "@nextui-org/react";
import bs58 from "bs58";
import { BorshSchema, borshDeserialize, borshSerialize } from "borsher";
import { RawMessage, SignedMessage } from "dephy-borsh-types/src/index.js";
import { useCallback } from "react";

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

  const ndk = useMemo(() => {
    if (!connInfo) return null;
    const initialRelays = [connInfo.nostrRelayAddr];

    return [
      initialRelays,
      new NDK({
        explicitRelayUrls: initialRelays,
        // enableOutboxModel: true,
        // outboxRelayUrls: initialRelays,
        cacheAdapter: new NDKCacheAdapterDexie({ dbName: "nostr-hooks-cache" }),
      }),
    ];
  }, [connInfo]);

  if (!connInfo) return null;

  return (
    <>
      <RingsConnection />
      <ConnectionStatus />
      <WeightInput />
      <NostrHooksContextProvider ndk={ndk[1]} relays={ndk[0]}>
        <NostrData />
      </NostrHooksContextProvider>
    </>
  );
}

function RingsConnection() {
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

function WeightInput() {
  const connInfo = useAtomValue(connInfoAtom);
  const ringsClient = useAtomValue(ringsClientAtom);
  const inputRef = useRef();

  const applyWeight = useCallback(() => {
    if (!ringsClient) return;
    (async () => {
      console.log(
        RingsPb.SendBackendMessageRequest.create({
          destinationDid: connInfo.deviceAddr,
          data: JSON.stringify({
            PlainText: parseFloat(inputRef.current.value).toString(),
          }),
        }),
      );
      await ringsClient.request("sendBackendMessage", {
        destination_did: connInfo.deviceAddr,
        data: JSON.stringify({
          PlainText: parseFloat(inputRef.current.value).toString(),
        }),
      });
      alert("Ok!");
    })().catch(console.error);
  }, [ringsClient, connInfo]);

  return (
    <>
      <div className="flex w-full flex-wrap flex-row md:flex-nowrap mb-0 gap-2">
        <Input
          size="sm"
          type="number"
          variant="bordered"
          label="Weight"
          ref={inputRef}
          initialValue="1"
        />
        <Button
          color="primary"
          variant="flat"
          className="w-1 mt-1"
          onClick={applyWeight}
        >
          Set
        </Button>
      </div>
      <Spacer y={3} />
    </>
  );
}

function ConnectionStatus() {
  const connInfo = useAtomValue(connInfoAtom);
  const ringsInfo = useAtomValue(ringsInfoAtom);

  return (
    <>
      <p>
        <pre>Conn: {JSON.stringify(connInfo, null, 2)}</pre>
      </p>
      <Spacer y={3} />
      <p>
        <pre>Rings: {JSON.stringify(ringsInfo, null, 2)}</pre>
      </p>
      <Spacer y={3} />
    </>
  );
}

const EventData = BorshSchema.Struct({
  original: BorshSchema.f64,
  weight: BorshSchema.f64,
  actually: BorshSchema.f64,
});

const processEvent = (event, did) => {
  if (event.tags.findIndex((t) => t[0] === "dephy_from" && t[1] === did) < 0) {
    return;
  }

  const content = bs58.decode(event.content);
  const m = borshDeserialize(SignedMessage, content);
  const r = borshDeserialize(RawMessage, new Uint8Array(m.raw));
  const payload = borshDeserialize(EventData, new Uint8Array(r.payload));

  return {
    id: event.id,
    event,
    m,
    r,
    payload: JSON.stringify(payload),
  };
};

const useNostrData = () => {
  const connInfo = useAtomValue(connInfoAtom);
  const list = useListData({ initialItems: [], getKey: (item) => item.id });
  const now = useRef(parseInt(Date.now() / 1000));
  const { ndk } = useNostrHooksContext();

  useEffect(() => {
    if (!ndk || !connInfo) return;

    const did = "did:dephy:" + connInfo.deviceAddr.toLowerCase();

    const s = ndk.subscribe({
      kinds: [1111],
      since: now.current,
      ["#c"]: ["dephy"],
    });
    s.on("event", (e) => {
      const i = processEvent(e, did);
      if (i) {
        list.prepend(i);
      }
    });
    s.start();
    return () => {
      s.off("event");
      s.stop();
    };
  }, [ndk, connInfo]);
  return list;
};

const columns = [
  {
    key: "data",
    label: "Data",
  },
];

const NostrData = () => {
  const events = useNostrData();

  return (
    <Table>
      <TableHeader columns={columns}>
        {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
      </TableHeader>
      <TableBody items={events.items || []}>
        {(item) => (
          <TableRow key={item.id}>
            <TableCell>
              <pre>{item.payload}</pre>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export const dateToUnix = (d) => {
  const date = d || new Date();

  return Math.floor(date.getTime() / 1000);
};
