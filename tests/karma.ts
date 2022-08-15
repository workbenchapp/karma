import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { ASSOCIATED_PROGRAM_ID } from "@project-serum/anchor/dist/cjs/utils/token";
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import * as web3 from "@solana/web3.js";
import { step } from "mocha-steps";
import idl from "../target/idl/karma.json";
import { Karma } from "../target/types/karma";

describe("karma", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Karma as Program<Karma>;

  // Get anchor wallet's public key
  const walletPubKey = provider.wallet.publicKey;

  // Get a public key to generate realm PDA

  const programID = new web3.PublicKey(idl.metadata.address);

  step("Creating a new realm.", async () => {
    // Iterate through all possibilities to find a bump that kicks the address off the eliptic curve
    let [realmAccount, realmAccountBump] =
      await web3.PublicKey.findProgramAddress(
        [Buffer.from("realm"), walletPubKey.toBuffer()],
        programID
      );
    let [mintAccount, mintAccountBump] =
      await web3.PublicKey.findProgramAddress(
        [Buffer.from("realm-mint"), walletPubKey.toBuffer()],
        programID
      );
    console.log(
      await program.methods
        .initializeRealm("First Realm", realmAccountBump, mintAccountBump)
        .accounts({
          realm: realmAccount,
          creator: walletPubKey,
          systemProgram: anchor.web3.SystemProgram.programId,
          mint: mintAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: web3.SYSVAR_RENT_PUBKEY,
        })
        .rpc()
    );
    console.log({
      mintAccount: mintAccount.toJSON(),
      realmAccount: realmAccount.toJSON(),
    });

    // const realmAccount = await program.account.realm.fetch(realm.publicKey);

    // assert.equal(realmAccount.creator.toBase58(), walletPubKey.toBase58());
    // assert.equal(realmAccount.name, 'First Realm');
  });

  step("Tipping", async () => {
    let [realmAccount, realmAccountBump] =
      await web3.PublicKey.findProgramAddress(
        [Buffer.from("realm"), walletPubKey.toBuffer()],
        programID
      );
    let [mintAccount, mintAccountBump] =
      await web3.PublicKey.findProgramAddress(
        [Buffer.from("realm-mint"), walletPubKey.toBuffer()],
        programID
      );
    const associatedTokenAccount = await getAssociatedTokenAddress(
      mintAccount,
      walletPubKey
    );
    console.log({
      mintAccount: mintAccount.toJSON(),
      realmAccount: realmAccount.toJSON(),
      associatedTokenAccount: associatedTokenAccount.toJSON(),
      walletPubKey: walletPubKey.toJSON(),
    });
    console.log(
      await program.methods
        .tip()
        .accounts({
          realm: realmAccount,
          mint: mintAccount,
          authority: walletPubKey,
          recipient: walletPubKey,
          recipientWallet: associatedTokenAccount,
          systemProgram: web3.SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
          rent: web3.SYSVAR_RENT_PUBKEY,
        })
        .rpc()
    );
  });

  // it("Minting a new token.", async () => {
  //   // Generate a random keypair that will represent the token
  //   const mintKeyPair: anchor.web3.Keypair = anchor.web3.Keypair.generate();

  //   // Amout of sol for rent
  //   const lamports: number =
  //     await program.provider.connection.getMinimumBalanceForRentExemption(
  //       MINT_SIZE
  //     );

  //   // Get associated token account(ATA) address (pub key)
  //   const associatedTokenAccount = await getAssociatedTokenAddress(
  //     mintKeyPair.publicKey,
  //     walletPubKey
  //   );

  //   // Fire a list of instructions in a single transaction
  //   const mint_tx = new anchor.web3.Transaction().add(
  //     // Create an account from the mint key we created
  //     anchor.web3.SystemProgram.createAccount({
  //       fromPubkey: walletPubKey,
  //       newAccountPubkey: mintKeyPair.publicKey,
  //       space: MINT_SIZE,
  //       programId: TOKEN_PROGRAM_ID,
  //       lamports,
  //     }),

  //     // Transaction to create our mint account that is controlled by our anchor wallet
  //     createInitializeMintInstruction(
  //       mintKeyPair.publicKey,
  //       0,
  //       walletPubKey,
  //       walletPubKey
  //     ),

  //     // Create ATA that is associated with our mint on our anchor wallet
  //     createAssociatedTokenAccountInstruction(
  //       walletPubKey,
  //       associatedTokenAccount,
  //       walletPubKey,
  //       mintKeyPair.publicKey
  //     )
  //   );

  //   // send and create the transaction
  //   const res = await provider.sendAndConfirm(mint_tx, [mintKeyPair]);

  //   console.log(
  //     await provider.connection.getParsedAccountInfo(mintKeyPair.publicKey)
  //   );

  //   console.log("Account: ", res);
  //   console.log("Mint key: ", mintKeyPair.publicKey.toString());
  //   console.log("User: ", walletPubKey.toString());

  //   // Executes our code to mint our token into our specified ATA
  //   await program.methods
  //     .mintToken()
  //     .accounts({
  //       mint: mintKeyPair.publicKey,
  //       tokenProgram: TOKEN_PROGRAM_ID,
  //       tokenAccount: associatedTokenAccount,
  //       authority: walletPubKey,
  //     })
  //     .rpc();

  //   // Get minted token amount on the ATA for our anchor wallet
  //   const minted = (
  //     await provider.connection.getParsedAccountInfo(associatedTokenAccount)
  //   ).value.data.parsed.info.tokenAmount.amount;
  //   assert.equal(minted, 10);
  // });
});
