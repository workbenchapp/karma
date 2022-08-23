import { AnchorProvider, Program } from "@project-serum/anchor";
import { ASSOCIATED_PROGRAM_ID } from "@project-serum/anchor/dist/esm/utils/token";
import {
  getAccount,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import * as web3 from "@solana/web3.js";
import { idl, Karma as KarmaProgram } from ".";

const programID = new web3.PublicKey(idl.metadata.address);

export class Karma {
  mintAccount?: web3.PublicKey;
  mintAccountBump?: number;
  realmAccount?: web3.PublicKey;
  realmAccountBump?: number;
  ata?: web3.PublicKey;
  provider: AnchorProvider;
  program: Program<KarmaProgram>;

  constructor(
    private conn: web3.Connection,
    private creator: web3.PublicKey,
    private wallet: AnchorWallet
  ) {
    this.provider = new AnchorProvider(
      this.conn,
      this.wallet,
      AnchorProvider.defaultOptions()
    );
    this.program = new Program<KarmaProgram>(
      idl as any,
      programID,
      this.provider
    );
  }

  async init() {
    const [mintAccount, mintAccountBump] =
      await web3.PublicKey.findProgramAddress(
        [Buffer.from("realm-mint"), this.creator.toBuffer()],
        programID
      );
    this.mintAccount = mintAccount;
    this.mintAccountBump = mintAccountBump;
    const [realmAccount, realmAccountBump] =
      await web3.PublicKey.findProgramAddress(
        [Buffer.from("realm"), this.creator.toBuffer()],
        programID
      );
    this.realmAccount = realmAccount;
    this.realmAccountBump = realmAccountBump;
    this.ata = await getAssociatedTokenAddress(
      mintAccount,
      this.wallet.publicKey
    );
  }

  newRealm() {
    return this.program.methods
      .initializeRealm(
        "First Realm",
        this.realmAccountBump!,
        this.mintAccountBump!
      )
      .accounts({
        realm: this.realmAccount,
        creator: this.wallet.publicKey,
        systemProgram: web3.SystemProgram.programId,
        mint: this.mintAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: web3.SYSVAR_RENT_PUBKEY,
      })
      .rpc();
  }

  async getBalance() {
    const account = await getAccount(this.conn, this.ata!);
    return account.amount;
  }

  tip(user: web3.PublicKey) {
    return this.program.methods
      .tip()
      .accounts({
        realm: this.realmAccount,
        mint: this.mintAccount,
        authority: this.wallet.publicKey,
        recipient: user,
        recipientWallet: this.ata,
        systemProgram: web3.SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
        rent: web3.SYSVAR_RENT_PUBKEY,
      })
      .rpc();
  }
}
