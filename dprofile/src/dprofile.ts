import {
  bundlrStorage,
  JsonMetadata,
  LazyNft,
  Metaplex,
  Nft,
  toMetaplexFileFromBrowser,
  WalletAdapter,
  walletAdapterIdentity,
} from "@metaplex-foundation/js";
import { Connection } from "@solana/web3.js";

/**
 * The metadata structure for the DProfile NFT
 * this is a bit different from your typical NFT
 * so it has fields you wouldn't normally see
 */
export type DProfile = {
  avatar?: string;
  username?: string;
  previousAvatars?: string[];
} & JsonMetadata;

export type DProfileNft = Nft & {
  json: DProfile;
};

export class DProfileCore {
  client: Metaplex;
  dprofile?: DProfileNft;
  avatars?: string[];

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

  async fetchDProfile() {
    if (!this.adapter.publicKey)
      throw new Error("adapter has no public key available");

    const lazyNfts = await this.client
      .nfts()
      .findAllByOwner(this.adapter.publicKey)
      .run();

    // concurrently fetch the metadata for all NFTs
    const nfts = await Promise.all(
      lazyNfts.map((nft) =>
        this.client
          .nfts()
          .loadNft(nft as LazyNft)
          .run()
      )
    );

    // set the DProfile NFT
    const dprofileNft = nfts.find((nft) => nft.name === "dprofile")!;
    this.dprofile = dprofileNft as DProfileNft;

    const saved_avatars = this.dprofile.json.previousAvatars ?? [];

    // merge both saved avatars and NFT images
    this.avatars = [...saved_avatars, ...nfts.map((nft) => nft.json?.image!)];
  }

  async update({
    newAvatar,
    newUsername,
  }: {
    newUsername?: string;
    newAvatar?: string;
  }) {
    if (!this.dprofile)
      throw new Error("you do not have a dprofile initialized");

    const newMetadata = { ...this.dprofile.json };

    if (newAvatar) {
      const uris = this.dprofile.json.previousAvatars ?? [];
      if (uris.indexOf(newAvatar) === -1) {
        uris.push(newAvatar);
        console.log(`added new dprofile to list: ${newAvatar}`);
      }
      newMetadata.previousAvatars = uris;
      newMetadata.avatar = newAvatar;
      newMetadata.image = newAvatar;
    }

    if (newUsername) {
      newMetadata.username = newUsername;
    }

    return this.client
      .nfts()
      .update(this.dprofile, {
        uri: (await this.client.nfts().uploadMetadata(newMetadata).run()).uri,
      })
      .run();
  }

  async uploadNew(file: File) {
    if (!this.dprofile)
      throw new Error("You do not have a dprofile initialized");
    const metaplexFile = await toMetaplexFileFromBrowser(file);
    const url = await this.client.storage().upload(metaplexFile);
    const metadata = await this.client
      .nfts()
      .uploadMetadata({
        ...this.dprofile.json,
        image: url,
        avatar: url,
      } as DProfile)
      .run();
    return metadata;
  }

  async initialize() {
    const { nft } = await this.client
      .nfts()
      .create({
        isMutable: true,
        uri: "",
        name: "dprofile",
        sellerFeeBasisPoints: 0,
      })
      .run();
    this.dprofile = nft as DProfileNft;
  }
}
