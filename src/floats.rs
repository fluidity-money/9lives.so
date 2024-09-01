use std::cell::OnceCell;

use stylus_sdk::storage::StorageCache;

use astro_float::BigFloat;

struct BigFloatWords {

}

pub struct StorageFloat {
    slot: U256,
    offset: u8,
    cached: OnceCell<BigFloatWords>
}

impl StorageFloat {
    pub fn get(&self) -> BigFloat {
        self.cached
            .get_or_init(|| unsafe {
                let bytes = Storage::get<32>(self.slot, self.offset.into());
            })
    }
}

impl stylus_sdk::storage::StorageType for StorageFloat {
    type Wraps = StorageFloat;
    type WrapsMut = StorageFloat;

    const SLOT_BYTES = 32;
    const REQUIRED_SLOTS = 1;

    unsafe fn new(slot: U256, offset: u8) -> Self {
        StorageFloat {
            slot,
            offset,
            cached: OnceCell::new()
        }
    }

    fn load<'s>(self) -> Self::Wraps<'s> {
        self.get()
    }

    fn
}
