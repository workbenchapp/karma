use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{self, Mint, TokenAccount};
use anchor_spl::token::{MintTo, Token};

declare_id!("CcuuujtRRoaQV9zdw8P8puFrGrVW5EddWEkHBRbGymHy");

#[program]
pub mod karma {

    use super::*;

    pub fn initialize_realm(
        ctx: Context<InitializeRealm>,
        name: String,
        realm_bump: u8,
        mint_bump: u8,
    ) -> Result<()> {
        let realm = &mut ctx.accounts.realm;
        let creator = &ctx.accounts.creator;

        realm.creator = *creator.key;
        realm.name = name;
        realm.bump = realm_bump;
        realm.mint_bump = mint_bump;

        Ok(())
    }

    // TODO: tip instruction to be used to transfer 1 token to a given recipient

    pub fn tip(ctx: Context<Tip>) -> Result<()> {
        let creator_key = ctx.accounts.realm.creator.key();
        let bump_bytes = ctx.accounts.realm.bump.to_le_bytes();
        let inner = vec![b"realm".as_ref(), creator_key.as_ref(), bump_bytes.as_ref()];
        let outer = vec![inner.as_slice()];
        // Create the CpiContext we need for the request
        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.mint.to_account_info(),
                to: ctx.accounts.recipient_wallet.to_account_info(),
                authority: ctx.accounts.realm.to_account_info(),
            },
            outer.as_slice(),
        );

        // Execute anchor's helper function to mint tokens
        token::mint_to(cpi_ctx, 1)?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeRealm<'info> {
    #[account(init, seeds = [b"realm".as_ref(), creator.key().as_ref()], bump, payer = creator, space = Realm::LEN)]
    pub realm: Account<'info, Realm>,
    #[account(init, mint::decimals = 0, mint::authority = realm, payer = creator, seeds = [b"realm-mint".as_ref(), creator.key().as_ref()], bump)]
    pub mint: Box<Account<'info, Mint>>,
    #[account(mut)]
    pub creator: Signer<'info>,
    /// CHECK: This is the token that we want to mint
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct Tip<'info> {
    pub realm: Account<'info, Realm>,
    #[account(mut)]
    pub mint: Box<Account<'info, Mint>>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub recipient: SystemAccount<'info>,
    /// CHECK: make sure that init_if_needed is safe here
    #[account(init_if_needed, payer = authority, associated_token::mint = mint, associated_token::authority = recipient)]
    pub recipient_wallet: Account<'info, TokenAccount>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
}

#[account]
pub struct Realm {
    pub name: String,
    pub creator: Pubkey, // TODO: add some more fields
    pub bump: u8,
    pub mint_bump: u8,
}

// Kepping track of the space required
const DISCRIMINATOR_LENGTH: usize = 8;
const PUBLIC_KEY_LENGTH: usize = 32;
const STRING_LENGTH_PREFIX: usize = 4;
const NAME_LENGTH: usize = 50 * 4;

impl Realm {
    const LEN: usize =
        DISCRIMINATOR_LENGTH + STRING_LENGTH_PREFIX + NAME_LENGTH + PUBLIC_KEY_LENGTH;
}
