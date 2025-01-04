#!/bin/sh -e

cargo test -q --features testing -- test_print_error_table --include-ignored
