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
import classnames from "classnames";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { css } from "vite-plugin-inline-css-modules";
import IconMdiPlus from "~icons/mdi/plus";

const classes = css`
  .davatar_hover {
    @apply opacity-0 absolute top-0 left-0 w-full h-full bg-black/80 transition duration-200 cursor-pointer flex items-center justify-center;
  }

  .davatar {
    @apply relative rounded-full w-32 h-32 bg-surface-300 hover:bg-surface-200 flex items-center justify-center transition duration-200 overflow-hidden;

    &.active {
      @apply border-4 border-primary-dark;
    }

    &:hover > .davatar_hover {
      @apply opacity-100;
    }
  }
`;

function App() {
  const { connection } = useConnection();
  const adapter = useWallet();
  const client = useMemo(() => {
    return Metaplex.make(connection)
      .use(walletAdapterIdentity(adapter))
      .use(
        bundlrStorage({
          address: "https://devnet.bundlr.network",
          providerUrl: "https://api.devnet.solana.com",
          timeout: 60000,
        })
      );
  }, [adapter]);

  const [nfts, setNfts] = useState<Nft[] | undefined>(undefined);
  const [davatar, setDavatar] = useState<Nft | undefined>(undefined);
  const [processingState, setProcessingState] = useState<"processing" | "error" | undefined>(undefined)

  const isActiveDavatar = useCallback(
    (nft: Nft) => nft.uri === davatar?.uri,
    [davatar]
  );

  const fetchNfts = async () => {
    if (!adapter.publicKey) return;
    const nfts = await client.nfts().findAllByOwner(adapter.publicKey!);
    console.log(nfts);
    setDavatar(nfts?.find((nft) => nft.name === "davatar"));
    setNfts(nfts);
  };

  useEffect(() => {
    fetchNfts();
  }, [adapter]);

  const uploadInput = useRef<HTMLInputElement | null>(null);

  const onFileSelect = useCallback(async (files: File[]) => {
    setProcessingState('processing');
    const target = files[0];
    if (!target) return;
    const address = await client
      .storage()
      .upload(await useMetaplexFileFromBrowser(target));
    const { nft } = await client.nfts().create({
      uri: address,
      name: address.slice(address.indexOf("/"), 30),
      isMutable: false,
    });
    await onMakeActive(nft);
  }, [client, davatar]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop: onFileSelect, noClick: true });

  const onMakeActive = async (nft: Nft) => {
    setProcessingState('processing');
    if (!davatar)
      throw new Error(
        "You don't have a Davatar NFT. You need to create one first."
      );
    await client.nfts().update(davatar, {
      uri: nft.uri,
    });
    await fetchNfts();
    setProcessingState(undefined)
  };

  const initDavatar = async () => {
    await client.nfts().create({
      isMutable: true,
      uri: "",
      name: "davatar",
    });
  };

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="p-3 flex items-center justify-center flex-col gap-3 bg-surface-400 min-w-md relative" {...getRootProps()}>
      { isDragActive || processingState !== undefined  && <div className="w-full h-full absolute top-0 left-0 bg-black/50 z-1 grid place-items-center">
        {isDragActive && <span className="text-lg font-bold">Drop Your Avatar</span>}
        {processingState === "processing" && <span className="text-lg font-bold">Applying Davatar...</span>}
        {processingState === "error" && <span className="text-lg font-bold">Error Applying Davatar</span>}
      </div> }
        {adapter.publicKey ? (
          davatar ? (
            <>
              <h1 className="text-2xl font-bold">Your Davatar</h1>
              {davatar && (
                <div className={classes.davatar}>
                  <img className="w-full h-full object-cover" src={davatar.uri} />
                  <div
                    className={classes.davatar_hover}
                    onClick={() => uploadInput.current?.click()}
                  >
                    <span className="font-bold text-sm">Change Avatar</span>
                  </div>
                </div>
              )}
              <div className="flex w-full items-center gap-2">
                <h2 className="text-gray-400">Available avatars</h2>
                <button
                  className="p-1 hover:bg-surface-200 rounded-full"
                  aria-label="Upload Davatar"
                  onClick={() => uploadInput.current?.click()}
                >
                  <IconMdiPlus />
                </button>
                <input
                  ref={uploadInput}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(ev) => onFileSelect(Array.from(ev.currentTarget.files!))}
                  {...getInputProps()}
                />
              </div>
              <div className="grid grid-cols-4 gap-4 w-full items-center">
                {nfts
                  ?.filter((nft) => nft.name !== "davatar")
                  .map((nft) => (
                    <div
                      className={classnames(
                        classes.davatar,
                        isActiveDavatar(nft) ? classes.active : undefined
                      )}
                      key={nft.name}
                    >
                      <img src={nft.uri} className="object-cover w-full h-full" />
                      <div
                        className={classes.davatar_hover}
                        onClick={() => onMakeActive(nft)}
                      >
                        <span className="font-bold text-sm">Make Active</span>
                      </div>
                    </div>
                  ))}
              </div>
            </>
          ) : (
            <>
              <h1 className="text-lg">
                You have no Davatar initialized. Would you like to create one?
              </h1>
              <button
                className="bg-primary-base hover:bg-primary-dark px-3 py-2 rounded-md"
                onClick={initDavatar}
              >
                Initialize
              </button>
            </>
          )
        ) : (
          <>
            <h1 className="text-center">Connect your wallet to continue</h1>
            <WalletMultiButton />
          </>
        )}
      </div>
    </div>
  );
}

export default App;
