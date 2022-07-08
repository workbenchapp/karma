import { Box, Heading } from "@chakra-ui/react";
import {
  bundlrStorage, Metaplex,
  walletAdapterIdentity
} from "@metaplex-foundation/js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import '@solana/wallet-adapter-react-ui/styles.css';
import { useMemo } from "react";
import usePromise from "react-use-promise";

function App() {
  const { connection } = useConnection();
  const adapter = useWallet();
  const client = useMemo(() => {
    return Metaplex.make(connection).use(walletAdapterIdentity(adapter)).use(bundlrStorage({
      providerUrl: "https://devnet.bundlr.network"
    }))
  }, [adapter]);
  const [nfts, nftFetchError, nftFetchState] = usePromise(async () => {
    if (!adapter.publicKey) throw new Error("no public key");
    return client.nfts().findAllByOwner(adapter.publicKey!)
  }, [adapter])

  return (
    <div className="w-full h-full flex items-center justify-center">
      <Box className="p-3 text-center flex items-center justify-center flex-col" bg="blackAlpha.400" width="lg">
      {adapter.publicKey
      ? <div>
          {
            {
              pending: <span>Loading davatars...</span>,
              resolved: <div>
                {
                  !nfts?.length
                  ? <span className="italic">You have no Davatars</span>
                  : nfts?.map((nft) => <div>
                    {JSON.stringify(nft)}
                  </div>)}
              </div>,
              rejected: <span>{JSON.stringify(nftFetchError)}</span>,
            }[nftFetchState]
          }
        </div>
      : 
        <>
        <Heading size="md" className="text-center mb-3">Connect ur wallet to continue</Heading>
        <WalletMultiButton />
        </>
      }
      </Box>
    </div>
  )
}

export default App
