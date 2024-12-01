// sweeper.ethereum: Listens to Postgres CDC to get live updates to the
// tables of tracked infrastructure, and when it sees that a market
// should be sweeped, which it then turns into "sweep" calls, leveraging
// the database to identify users to claim funds from. It uses Gorm to
// construct users to focus on at first.

package main
