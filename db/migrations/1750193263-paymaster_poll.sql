-- migrate:up

CREATE TABLE ninelives_paymaster_poll_1 (
	id SERIAL PRIMARY KEY,
	created_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

	-- Resolved is whether the request for the Paymaster has been resolved by the
	-- paymaster.ethereum worker.
	resolved BOOLEAN NOT NULL DEFAULT FALSE,

	-- Attempts to conclude this in the past using the returned ticket system.
	-- Will hit a number of 5 then give up.
	attempts INTEGER NOT NULL DEFAULT 0,

	-- Owner of the request.
	owner ADDRESS NOT NULL,

	-- Deadline of the request.
	deadline INTEGER NOT NULL,

	-- Type of the request (stringified).
	typ VARCHAR NOT NULL,

	-- R part of the Permit signature.
	permitR BYTES32 NOT NULL,

	-- S part of the Permit signature.
	permitS BYTES32 NOT NULL,

	-- V part of the Permit signature.
	permitV INTEGER NOT NULL,

	-- The market to Paymaster this calldata for.
	market ADDRESS NOT NULL,

	-- The maximum of the underlying asset to take the fee from.
	maximum_fee HUGEINT NOT NULL,

	-- The amount of USDC to spend here.
	amount_to_spend HUGEINT NOT NULL,

	-- The amount to receive back as a minimum amount.
	minimum_back HUGEINT NOT NULL,

	-- The calldata in bytes.
	calldata VARCHAR NOT NULL,

	-- The R part of the signature to reconstruct for the operation.
	r BYTES32 NOT NULL,

	s BYTES32 NOT NULL,

	v INTEGER NOT NULL
);

CREATE VIEW ninelives_paymaster_poll_outstanding_1 AS
	SELECT
		owner,
		deadline,
		typ,
		permitR,
		permitS,
		permitV,
		market,
		maximum_fee,
		amount_to_spend,
		minimum_back,
		calldata,
		r,
		s,
		v
	FROM
		ninelives_paymaster_poll_1
	WHERE attempts < 5 AND NOT resolved;

-- migrate:down
