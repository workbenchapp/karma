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
  davatars?: string[];

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

  async fetchDavatars() {
    if (!this.adapter.publicKey)
      throw new Error("adapter has no public key available");
    const nfts = await this.client
      .nfts()
      .findAllByOwner(this.adapter.publicKey);
    this.davatar = nfts.find((nft) => nft.name === "davatar");
    await this.davatar?.metadataTask.run();
    const davatars = this.davatar?.metadata.description?.split("\n") ?? [];
    this.davatars = [
      ...davatars,
      ...(nfts
        .filter((nft) => nft.name !== "davatar")
        .map((nft) => nft.metadata.image)
        .filter((v) => !!v) as string[]),
    ];
  }

  async setAsActive(addr: string) {
    if (!this.davatar) throw new Error("you do not have a davatar initialized");

    const uris = this.davatar.metadata.description?.split("\n") ?? [];
    console.log("davatar list", uris);
    if (uris.indexOf(addr) === -1) {
      uris.push(addr);
      console.log(`added new davatar to list: ${addr}`);
    }
    console.log("uploading metadata");
    const meta = await this.client.nfts().uploadMetadata({
      ...this.davatar.metadata,
      name: "davatar",
      description: uris.join("\n"),
      image: addr,
    });
    console.log("metadata uploaded");
    console.log("updating nft");
    await this.client.nfts().update(this.davatar, {
      uri: meta.uri,
    });
    console.log("nft updated");
  }

  async uploadNew(file: File) {
    if (!this.davatar) throw new Error("You do not have a davatar initialized");
    console.log("uploading file...");
    const metadata = await this.client.nfts().uploadMetadata({
      ...this.davatar.metadata,
      image: await useMetaplexFileFromBrowser(file),
    });
    console.log("file uploaded!...");
    return metadata;
  }

  async initialize() {
    console.log("initializing davatar...");
    const { nft } = await this.client.nfts().create({
      isMutable: true,
      uri: "",
      name: "davatar",
    });
    this.davatar = nft;
    console.log("davatar initialized!");
  }
}
