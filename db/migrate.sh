#!/bin/sh -e

table="ninelives_migrations"

dbmate -d migrations --migrations-table "$table" -u "$1" up
