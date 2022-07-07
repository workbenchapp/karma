## Karma Program

A Solana program for identity and reputation.

Installation (Rust required):

```
cargo install --git https://github.com/project-serum/anchor avm --locked --force
avm install 0.25.0
avm use 0.25.0
yarn
anchor build
```

To deploy to a local validator:

```
anchor deploy
```

Anchor tests (will spin up local validator):

```
anchor test
```

## Spec

### Goal

Build a smart contract which can be used as a composable piece for any dapp’s reputation (and possibly reward) system, sort of like [Stack Exchange](https://stackexchange.com/), but distributed.

The pieces of this project would be a smart contract offering a protocol to do this, as well as a dapp front end to display this information (perhaps with an embeddable component so other dapp front ends can easily leverage it).

For instance, in [daonetes.com](http://daonetes.com), we want a “reputation system” of sorts that we can call using [CPI](https://docs.solana.com/developing/programming-model/calling-between-programs) to highlight that someone has reused your work.

### Design

a prototype frontend page for a user profile, to help visualize —

![](../blob/master/docs/images/karma_main.png?raw=true)

some feature ideas —

-   Standardized system for avatars to represent visual identity
-   Configurable “Realms” allow unique projects to set up their own karmaspace
-   Activity chart could encourage users to keep going a la github contribution graph
-   Users would receive a karma token from the program
-   Honorary NFTs as badges for specific accomplishments or thresholds
    -   Perhaps per-realm — for instance, Daonetes could have its own run of NFTs it could award based on
    -   The fact that these badges are specifically for Karma program, could be stored in the Metaplex metadata so that they could be delineated from other NFts
-   Transactions indicating karma was received would be listed, perhaps the “Tip” transactions themselves could
-   Optional tipping or some form of staking (e.g., if you want to sponsor them, stake some SOL with them which the program would deploy to [https://www.castle.finance/](https://www.castle.finance/)) with a user would allow them to make $, generate yield.

### Avatar / PFP

Part of this identity/reputation system can be chunked out into associating visual identity to a particular keypair or series of keypairs, i.e., avatar(s).

![](../blob/master/docs/images/davatar_main.png?raw=true)

Users should be able to view avatars associated with their wallet as well as mint new ones.

![](../blob/master/docs/images/davatar_logged_in.png?raw=true)

**Implementation Details**

-   To mint the NFTs, it’s easiest to use [Metaplex](https://docs.metaplex.com/) who have [bindings for Typescript](https://github.com/metaplex-foundation/js).
-   Image uploads are generally to Arweave, which Metaplex has some helpers to accomplish.
-   You’ll probably want to use [https://www.npmjs.com/package/@metaplex-foundation/js#findAllByCreator](https://www.npmjs.com/package/@metaplex-foundation/js#findAllByCreator) to locate the users’ NFTs, then manually filter to the ones that are associated with the avatar dapp (which you can use metadata to store).
    -   Metadata is not loaded by default, so you’ll need to get that (see [NFT model](https://www.npmjs.com/package/@metaplex-foundation/js#the-nft-model)), unless you can figure out some clever way to call out davatar specific things in the top level data.
    -   In the metadata, you could store properties like whether or not that davatar is the active one. And anything else cute you can think of (e.g., you could allow user to add custom metadata when they mint the NFT).
-   Where you can, structure things as composable React components — e.g., a `<NFTPFP />` component that takes in a wallet pubkey, queries . That way, any dapp could embed the NFT davatar logic, and load up the user’s active avatar.
-   I’ve also thought it might be cool if the user could select an existing NFT and you would update that NFT’s metadata to mark it as the user’s PFP, but I’m not sure if that work given Metaplex / Candy Machine limitations (I don’t know that they allow arbitrary access to parameters/metadata because of trait rarity in NFT collections).

#### Karma Program (Smart Contract)

-   Use [https://www.anchor-lang.com/](https://www.anchor-lang.com/), it simplifies everything
-   Instructions
    -   `InitializeRealm` — Create a new “realm” for the karma accounts, a mint for those karma tokens, and establish an authority for who can allocate those tokens, i.e., `Tip` (e.g., PDA on the originating program’s side).
        -   Accounts:
            -   TODO
    -   `Tip` — Issue 1 karma token to the given recipient from the mint created in that realm with `InitializeRealm`
