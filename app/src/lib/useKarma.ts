import { web3 } from "@project-serum/anchor";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { useEffect, useMemo, useState } from "react";
import { Karma } from "./karma";

export const WalletNotDefined = () =>
  new Error("anchor wallet not connected / defined");

export const useKarma = (creator: web3.PublicKey) => {
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

  const tip = async (user: web3.PublicKey) => {
    if (!karma) throw WalletNotDefined();
    await karma?.tip(user);
    await refresh();
  };

  const newRealm = async () => karma?.newRealm();

  useEffect(() => {
    (async () => {
      if (!karma) return;
      await karma.init();
      refresh();
    })();
  }, [karma]);

  return { tips, karma, tip, newRealm };
};
