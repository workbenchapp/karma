import { useStore } from "@builder.io/mitosis";
import { WalletAdapter } from "@metaplex-foundation/js";
import { Connection } from "@solana/web3.js";
import { DProfileCore } from "./dprofile";

export default function Component(props: {
  connection: Connection;
  adapter: WalletAdapter;
}) {
  const state = useStore({
    dprofile: new DProfileCore(props.connection, props.adapter),
  });
  return <div>{JSON.stringify(state.dprofile)}</div>;
}
