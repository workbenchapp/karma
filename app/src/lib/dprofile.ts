import {
  bundlrStorage,
  JsonMetadata,
  keypairIdentity,
  LazyNft,
  Metaplex,
  Nft,
  toMetaplexFileFromBrowser,
  WalletAdapter,
  walletAdapterIdentity,
} from "@metaplex-foundation/js";
import { Connection, Keypair } from "@solana/web3.js";

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
  json: DProfile | null;
};

export class DProfileCore {
  client: Metaplex;
  dprofile?: DProfileNft;
  avatars?: string[];
  constructor(
    private connection: Connection,
    private identity: Keypair | WalletAdapter
  ) {
    this.client = Metaplex.make(this.connection).use(
      bundlrStorage({
        address: "https://devnet.bundlr.network",
        providerUrl: "https://api.devnet.solana.com",
        timeout: 60000,
      })
    );
    if (identity instanceof Keypair) {
      this.client.use(keypairIdentity(identity));
    } else {
      this.client.use(walletAdapterIdentity(identity));
    }
  }

  async fetchDProfile() {
    if (!this.identity.publicKey)
      throw new Error("adapter has no public key available");

    const lazyNfts = await this.client
      .nfts()
      .findAllByOwner(this.identity.publicKey)
      .run();

    // concurrently fetch the metadata for all NFTs
    const nfts = (
      await Promise.all(
        lazyNfts.map(async (nft) => {
          try {
            const res = await this.client
              .nfts()
              .loadNft(nft as LazyNft)
              .run();
            return res;
          } catch (e) {
            return undefined;
          }
        })
      )
    ).filter((nft) => !!nft) as Nft[];

    const otherNfts = nfts.filter((nft) => nft.name !== "dprofile");
    const dprofileNft = nfts.find((nft) => nft.name === "dprofile");
    console.log({ otherNfts, nfts });

    // set the DProfile NFT
    this.dprofile = dprofileNft as DProfileNft | undefined;

    this.avatars = [
      ...(this.dprofile?.json?.previousAvatars ?? []),
      ...otherNfts.map((nft) => nft.json?.image!),
    ];
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
      const uris = this.dprofile.json?.previousAvatars ?? [];
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
    const metadata = await this.client
      .nfts()
      .uploadMetadata({} as DProfile)
      .run();

    await this.client
      .nfts()
      .create({
        isMutable: true,
        uri: metadata.uri,
        name: "dprofile",
        sellerFeeBasisPoints: 0,
      })
      .run();
    await this.fetchDProfile();
  }
}
