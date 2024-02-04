import { atom } from "jotai";

export const connInfoAtom = atom(null);

export const ringsInfoAtom = atom({
  wasmLoaded: false,
  connectedToRelay: false,
  wasm: null,
  accountAddress: null,
  error: null,
});
export const ringsClientAtom = atom(null);
