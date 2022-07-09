import {
  bundlrStorage,
  Metaplex,
  Nft,
  useMetaplexFileFromBrowser,
  walletAdapterIdentity
} from "@metaplex-foundation/js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";
import { useMemo, useRef } from "react";
import usePromise from "react-use-promise";
import { css } from 'vite-plugin-inline-css-modules';
import IconMdiPlus from "~icons/mdi/plus";

const classes = css`
.davatar_hover {
  @apply opacity-0 absolute top-0 left-0 w-full h-full bg-black/80 transition duration-200 cursor-pointer flex items-center justify-center;
}

.davatar {
  @apply relative rounded-md w-32 h-32 bg-surface-300 hover:bg-surface-200 flex items-center justify-center transition duration-200 overflow-hidden;
  &:hover > .davatar_hover {
    @apply opacity-100;
  }
}
`

function App() {
  const { connection } = useConnection();
  const adapter = useWallet();
  const client = useMemo(() => {
    return Metaplex.make(connection)
      .use(walletAdapterIdentity(adapter))
      .use(
        bundlrStorage({
          address: 'https://devnet.bundlr.network',
          providerUrl: 'https://api.devnet.solana.com',
          timeout: 60000,
        })
      );
  }, [adapter]);

  const [nfts, nftFetchError, nftFetchState] = usePromise(async () => {
    if (!adapter.publicKey) throw new Error("no public key");
    return client.nfts().findAllByOwner(adapter.publicKey!);
  }, [adapter]);

  const uploadInput = useRef<HTMLInputElement | null>(null);

  const onFileSelect = async (ev: React.ChangeEvent<HTMLInputElement>) => {
    const target = ev.target.files?.[0];
    if (!target) return;
    const address = await client.storage().upload(await useMetaplexFileFromBrowser(target));
    await client.nfts().create({
      uri: address,
      name: address.slice(address.indexOf("/"), 30),
    })
    // await client.nfts().uploadMetadata({

    //   attributes: {

    //   },
    // })
  }

  const onMakeActive = async (nft: Nft) => {
    await client.nfts().update(nft, {
      uri: "wtf",
    })
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="p-3 text-center flex items-center justify-center flex-col bg-surface-400">
        <h1 className="text-2xl font-bold mb-3">Your Davatars</h1>
        {adapter.publicKey ? (
          <div>
            {
              {
                pending: <span>Loading davatars...</span>,
                resolved: (
                  <div className="grid grid-cols-4 gap-4 w-full items-center">
                    {nfts?.map((nft) => (
                      <div className={classes.davatar} key={nft.name}>
                        <img src={nft.uri} />
                        <div className={classes.davatar_hover} onClick={() => onMakeActive(nft)}>
                          <span className="font-bold text-sm">Make Active</span>
                        </div>
                      </div>
                    ))}
                    <input
                      ref={uploadInput}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={onFileSelect}
                    />
                    <button
                      aria-label="Upload Davatar"
                      className={classes.davatar}
                      onClick={() => uploadInput.current?.click()}
                    >
                      <IconMdiPlus />
                    </button>
                  </div>
                ),
                rejected: <span>{JSON.stringify(nftFetchError)}</span>,
              }[nftFetchState]
            }
          </div>
        ) : (
          <>
            <h1 className="text-center mb-3">Connect ur wallet to continue</h1>
            <WalletMultiButton />
          </>
        )}
      </div>
    </div>
  );
}

export default App;
