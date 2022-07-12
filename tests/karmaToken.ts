
import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { KarmaToken } from "../target/types/karma_token";
import {
    TOKEN_PROGRAM_ID,
    MINT_SIZE,
    createAssociatedTokenAccountInstruction,
    getAssociatedTokenAddress,
    createInitializeMintInstruction,
} from "@solana/spl-token";
import { assert } from "chai";

describe("karma token", () => {
    // Configure the client to use the local cluster.
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    
    const program = anchor.workspace.KarmaToken as Program<KarmaToken>;

    // Generate a random keypair that will represent the token
    const mintKeyPair: anchor.web3.Keypair = anchor.web3.Keypair.generate();

    it("Minting a new token.", async () => {
        // Get anchor wallet's public key
        const walletPubKey = provider.wallet.publicKey;

        // Amout of sol for rent
        const lamports: number = await program.provider.connection.getMinimumBalanceForRentExemption(
            MINT_SIZE
        )

        // Get associated token account(ATA) and acccount we want to own the ATA 
        const associatedTokenAccount = await getAssociatedTokenAddress(
            mintKeyPair.publicKey,
            walletPubKey
        )

        // Fire a list of instructions in a single transaction
        const mint_tx = new anchor.web3.Transaction().add(
            // Create ana account from the mint key we created
            anchor.web3.SystemProgram.createAccount({
                fromPubkey: walletPubKey,
                newAccountPubkey: mintKeyPair.publicKey,
                space: MINT_SIZE,
                programId: TOKEN_PROGRAM_ID,
                lamports
            }),

            // Transaction to create our mint account that is controlled by our anchor wallet
            createInitializeMintInstruction(
                mintKeyPair.publicKey, 0, walletPubKey, walletPubKey
            ),

            // Create ATA that is associated with our mint on our anchor wallet
            createAssociatedTokenAccountInstruction(
                walletPubKey, associatedTokenAccount, walletPubKey, mintKeyPair.publicKey
            )
        )

        // send and create the transaction
        const res = await provider.sendAndConfirm(mint_tx, [mintKeyPair])

        console.log(
            await provider.connection.getParsedAccountInfo(mintKeyPair.publicKey)
        )

        console.log("Account: ", res);
        console.log("Mint key: ", mintKeyPair.publicKey.toString());
        console.log("User: ", walletPubKey.toString());

        // Executes our code to mint our token into our specified ATA
        await program.methods.mintToken().accounts({
            mint: mintKeyPair.publicKey,
            tokenProgram: TOKEN_PROGRAM_ID,
            tokenAccount: associatedTokenAccount,
            authority: walletPubKey,
        }).rpc();

        // Get minted token amount on the ATA for our anchor wallet
        const minted = (await provider.connection.getParsedAccountInfo(associatedTokenAccount)).value.data.parsed.info.tokenAmount.amount;
        assert.equal(minted, 10);
    });
});