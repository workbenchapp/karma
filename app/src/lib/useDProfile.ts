import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useMemo, useState } from "react";
import { DProfileCore, DProfileNft, UpdatePayload } from "./dprofile";

export const useDProfile = () => {
  const { connection } = useConnection();
  const adapter = useWallet();
  const [dProfile, setDProfile] = useState<DProfileNft>();
  const username = useMemo(() => dProfile?.json?.username, [dProfile]);
  const avatar = useMemo(() => dProfile?.json?.avatar, [dProfile]);
  const [avatarsList, setAvatarsList] = useState<string[]>();
  const [nftImagesList, setNftImagesList] = useState<string[]>();

  const client = useMemo(
    () => new DProfileCore(connection, adapter),
    [connection, adapter]
  );

  const refresh = async () => {
    if (!adapter.publicKey) return;
    await client.fetchDProfile();
    setDProfile(client.dprofile);
    setAvatarsList(client.avatars);
    setNftImagesList(client.nftImages);
  };

  const update = async (payload: UpdatePayload) => {
    await client.update(payload);
    await refresh();
  };

  useEffect(() => {
    refresh();
  }, [adapter]);

  return { client, username, avatar, avatarsList, nftImagesList, update };
};
