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

export type UpdatePayload = Partial<{
  avatar: string | File;
  username: string;
}>;

export type DProfileNft = Nft & {
  json: DProfile | null;
};

export class DProfileCore {
  client: Metaplex;
  dprofile?: DProfileNft;
  avatars?: string[];
  nftImages?: string[];

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

    // set the DProfile NFT
    this.dprofile = dprofileNft as DProfileNft | undefined;

    this.avatars = [...new Set(this.dprofile?.json?.previousAvatars)] ?? [];
    this.nftImages = otherNfts
      .map((nft) => nft.json?.image)
      .filter((v) => !!v) as string[];
  }

  async update({ avatar, username }: UpdatePayload) {
    const newMetadata = { ...this.dprofile?.json };

    if (avatar) {
      if (avatar instanceof File) {
        const metaplexFile = await toMetaplexFileFromBrowser(avatar);
        avatar = await this.client.storage().upload(metaplexFile);
      }
      const uris = this.dprofile?.json?.previousAvatars ?? [];
      if (uris.indexOf(avatar) === -1) {
        uris.push(avatar);
        console.log(`added new dprofile to list: ${avatar}`);
      }
      newMetadata.previousAvatars = uris;
      newMetadata.avatar = avatar;
      newMetadata.image = avatar;
    }

    if (username) {
      newMetadata.username = username;
    }

    if (!this.dprofile) {
      const metadata = await this.client
        .nfts()
        .uploadMetadata({
          image: avatar,
          avatar,
          username,
        } as DProfile)
        .run();

      return this.client.nfts().create({
        isMutable: true,
        uri: metadata.uri,
        name: "dprofile",
        sellerFeeBasisPoints: 0,
      });
    } else {
      return this.client
        .nfts()
        .update(this.dprofile, {
          uri: (await this.client.nfts().uploadMetadata(newMetadata).run()).uri,
        })
        .run();
    }
  }
}
