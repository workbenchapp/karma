import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useEffect, useMemo, useState } from "react";
import { Karma } from "./karma";

export const WalletNotDefined = () =>
  new Error("anchor wallet not connected / defined");

export const useKarma = (creator: PublicKey) => {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  const karma = useMemo(
    () => (wallet ? new Karma(connection, creator, wallet) : undefined),
    [connection, creator, wallet]
  );

  const [tips, setTips] = useState<bigint | undefined>(undefined);

  const refresh = async () => {
    if (!karma) throw WalletNotDefined();
    setTips(await karma.getBalance());
  };

  const tip = async (user: PublicKey) => {
    if (!karma) throw WalletNotDefined();
    karma?.tip(user);
  };

  useEffect(() => {
    (async () => {
      if (!karma) return;
      await karma.init();
      refresh();
    })();
  }, [karma]);

  return { tips, karma, tip };
};
