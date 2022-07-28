use anchor_lang::prelude::*;
use anchor_spl::token;
use anchor_spl::token::{MintTo, Token, Transfer};

declare_id!("HvE81vvHBa7bZ3bkJS4Zm4mZc1TaX2vdb5U1V5eiNuVp");

#[program]
pub mod karma {
    use super::*;

    pub fn initialize_realm(ctx: Context<InitializeRealm>, name: String) -> Result<()> {
        let realm: &mut Account<Realm> = &mut ctx.accounts.realm;
        let creator: &Signer = &ctx.accounts.creator;

        // passed name is 

        realm.name = name;
        realm.creator = *creator.key;

        // TODO: mint karma tokens for this realm (moving the logic from mint_token here)
        // TODO: establish an authority for who can allocate those tokens

        Ok(())
    }

    // TODO: tip instruction to be used to transfer 1 token to a given recipient

    pub fn mint_token(ctx: Context<MintToken>) -> Result<()> {
        // Create the MintTo struct for our context
        let cpi_accounts: MintTo = MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.token_account.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(),
        };

        let cpi_program: AccountInfo = ctx.accounts.token_program.to_account_info();
        // Create the CpiContext we need for the request
        let cpi_ctx: CpiContext<MintTo> = CpiContext::new(cpi_program, cpi_accounts);

        // Execute anchor's helper function to mint tokens
        token::mint_to(cpi_ctx, 10)?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeRealm<'info> {
    #[account(init, seeds = [b"realm".as_ref()], bump, payer = creator, space =  Realm::LEN)]
    pub realm: Account<'info, Realm>, // Is the realms program itself going to own the realm account? Not sure
    #[account(mut)]
    pub creator: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MintToken<'info> {
    /// CHECK: This is the token that we want to mint
    #[account(mut)]
    pub mint: UncheckedAccount<'info>,
    pub token_program: Program<'info, Token>,
    /// CHECK: This is the token account that we want to mint tokens to
    #[account(mut)]
    pub token_account: UncheckedAccount<'info>,
    /// CHECK: the authority of the mint account
    #[account(mut)]
    pub authority: AccountInfo<'info>,
}

#[account]
pub struct Realm {
    pub name: String,
    pub creator: Pubkey
    // TODO: add some more fields
}

// Kepping track of the space required
const DISCRIMINATOR_LENGTH: usize = 8;
const PUBLIC_KEY_LENGTH: usize = 32;
const STRING_LENGTH_PREFIX: usize = 4;
const NAME_LENGTH: usize = 50 * 4;

impl Realm {
    const LEN: usize = DISCRIMINATOR_LENGTH + STRING_LENGTH_PREFIX + NAME_LENGTH + PUBLIC_KEY_LENGTH;
}