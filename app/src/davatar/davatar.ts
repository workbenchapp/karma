import {
  bundlrStorage,
  Metaplex,
  Nft,
  useMetaplexFileFromBrowser,
  WalletAdapter,
  walletAdapterIdentity,
} from "@metaplex-foundation/js";
import { Connection } from "@solana/web3.js";

export class DavatarCore {
  client: Metaplex;
  davatar?: Nft;
  nfts?: Nft[];

  constructor(private connection: Connection, private adapter: WalletAdapter) {
    this.client = Metaplex.make(this.connection)
      .use(walletAdapterIdentity(adapter))
      .use(
        bundlrStorage({
          address: "https://devnet.bundlr.network",
          providerUrl: "https://api.devnet.solana.com",
          timeout: 60000,
        })
      );
  }

  async fetchNfts() {
    if (!this.adapter.publicKey)
      throw new Error("adapter has no public key available");
    const nfts = await this.client
      .nfts()
      .findAllByOwner(this.adapter.publicKey);

    this.davatar = nfts.find((nft) => nft.name === "davatar");
    this.nfts = nfts.filter((nft) => nft.name !== "davatar");
  }

  async setAsActive(nft: Nft) {
    if (!this.davatar) throw new Error("you do not have a davatar initialized");
    await this.client.nfts().update(this.davatar, {
      uri: nft.uri,
    });
  }

  async uploadNew(file: File) {
    const address = await this.client
      .storage()
      .upload(await useMetaplexFileFromBrowser(file));
    const { nft } = await this.client.nfts().create({
      uri: address,
      name: address.slice(address.indexOf("/"), 30),
      isMutable: false,
    });
    return nft;
  }

  async initialize() {
    await this.client.nfts().create({
      isMutable: true,
      uri: "",
      name: "davatar",
    });
  }
}
