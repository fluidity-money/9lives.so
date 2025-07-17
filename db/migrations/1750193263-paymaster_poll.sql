-- migrate:up

CREATE TABLE ninelives_paymaster_poll_1 (
	id SERIAL PRIMARY KEY,
	created_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

	-- Owner of the request.
	owner ADDRESS NOT NULL,

	-- Deadline of the request.
	deadline INTEGER NOT NULL,

	-- Type of the request (converted from enum literally).
	typ INTEGER NOT NULL,

	-- Amount that was used in the Permit signature.
	permit_amount HUGEINT,

	-- R part of the Permit signature.
	permit_r BYTES32,

	-- S part of the Permit signature.
	permit_s BYTES32,

	-- V part of the Permit signature.
	permit_v INTEGER,

	-- The market to Paymaster this calldata for.
	market ADDRESS NOT NULL,

	-- The maximum of the underlying asset to take the fee from.
	maximum_fee HUGEINT NOT NULL,

	-- The amount of USDC to spend here.
	amount_to_spend HUGEINT NOT NULL,

	-- The amount to receive back as a minimum amount.
	minimum_back HUGEINT,

	-- The R part of the signature to reconstruct for the operation.
	r BYTES32 NOT NULL,

	s BYTES32 NOT NULL,

	v INTEGER NOT NULL,

	-- The referrer that would be submitted alongside the request depending on the
	-- type.
	referrer ADDRESS,

	-- The outcome to use this interaction for, if any.
	outcome BYTES8,

	-- The originating chain id to use for the domain.
	originating_chain_id HUGEINT NOT NULL,

	-- The nonce associated with this chain combination.
	nonce HUGEINT NOT NULL,

	-- Outgoing EID of the paymaster operation.
	outgoing_chain_eid INTEGER NOT NULL DEFAULT 0
);

-- migrate:down
