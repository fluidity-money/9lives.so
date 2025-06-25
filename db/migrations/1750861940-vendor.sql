-- migrate:up

CREATE TABLE vendor_events_borrow (
	id SERIAL PRIMARY KEY,
	created_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	block_hash HASH NOT NULL,
	transaction_hash HASH NOT NULL,
	block_number INTEGER NOT NULL,
	emitter_addr ADDRESS NOT NULL,

	borrower ADDRESS NOT NULL,
	vendor_fees HUGEINT NOT NULL,
	lender_fees HUGEINT NOT NULL,
	borrow_rate INTEGER NOT NULL,
	additional_col_amount HUGEINT NOT NULL,
	additional_debt HUGEINT NOT NULL
);

CREATE TABLE vendor_events_deposit (
	id SERIAL PRIMARY KEY,
	created_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	block_hash HASH NOT NULL,
	transaction_hash HASH NOT NULL,
	block_number INTEGER NOT NULL,
	emitter_addr ADDRESS NOT NULL,

	lender ADDRESS NOT NULL,
	amount HUGEINT NOT NULL
);

CREATE TABLE vendor_events_repay (
	id SERIAL PRIMARY KEY,
	created_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	block_hash HASH NOT NULL,
	transaction_hash HASH NOT NULL,
	block_number INTEGER NOT NULL,
	emitter_addr ADDRESS NOT NULL,

	borrower ADDRESS NOT NULL,
	debt_repaid HUGEINT NOT NULL,
	col_returned HUGEINT NOT NULL
);

CREATE TABLE vendor_events_roll_in (
	id SERIAL PRIMARY KEY,
	created_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	block_hash HASH NOT NULL,
	transaction_hash HASH NOT NULL,
	block_number INTEGER NOT NULL,
	emitter_addr ADDRESS NOT NULL,

	borrower ADDRESS NOT NULL,
	origin_pool ADDRESS NOT NULL,
	origin_debt HUGEINT NOT NULL,
	lend_to_repay HUGEINT NOT NULL,
	lender_fee_amt HUGEINT NOT NULL,
	protocol_fee_amt HUGEINT NOT NULL,
	col_rolled HUGEINT NOT NULL,
	col_to_reimburse HUGEINT NOT NULL
);

CREATE TABLE vendor_events_withdraw (
	id SERIAL PRIMARY KEY,
	created_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	block_hash HASH NOT NULL,
	transaction_hash HASH NOT NULL,
	block_number INTEGER NOT NULL,
	emitter_addr ADDRESS NOT NULL,

	lender ADDRESS NOT NULL,
	amount HUGEINT NOT NULL
);

-- migrate:down
