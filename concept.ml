#!/usr/bin/env -S ocaml -w +A

type outcome = [`Outcome_a | `Outcome_b]

type whinger = string

(** The Oracle is in a state of waiting for its start date to begin. *)
type s_o_waiting

(**
 *  The Oracle is in a state of someone needing to declare * that the
 *  outcome has taken place.
 *)
type s_o_calling

(**
 * The Oracle has had someone declare that the proposed outcome is
 * incorrect, and this contestor has submitted a bond while stating so. A
 * period of people needing to bet on what they expect the outcome to be
 * has begun.
 *)
type s_o_whinged

(**
 * The Oracle has seen a prediction from someone to an outcome that was
 * given.
 *)
type s_o_predicting

(**
 * The Oracle two day period has completed. Trading can benefit from the
 * outcome now.
 *)
type s_o_completed

(**
 * The Oracle is now in a state where slashing is possible of bad
 * predictors.
 *)
type s_o_slashing

(**
 * The Oracle is in a state of Anything Goes, where anyone could slash
 * anyone.
 *)
type s_o_anything_goes

(**
 * The Oracle has completed the Anything Goes period.
 *)
type s_o_done_anything_goes

type 's o =
  | Waiting : s_o_waiting o
  | Calling : s_o_waiting o -> s_o_calling o
  | Whinged : outcome * whinger * s_o_calling o -> s_o_predicting o
  | Prediction : [`Lockup_arb_spent of int] * s_o_whinged o -> s_o_predicting o
  | Predicting_over : s_o_predicting o -> s_o_completed o
  | Calling_over : s_o_calling -> s_o_completed o
  | Slashing_begun : s_o_completed o -> s_o_slashing o
  | Slashed : [`Victim of whinger] * [`Slasher of whinger] * s_o_slashing o -> s_o_slashing o
  | Slashing_two_days_over : s_o_slashing o -> s_o_anything_goes o
  | Anything_goes_slash : whinger * s_o_anything_goes o -> s_o_anything_goes o
  | Anything_goes_slashing_over : s_o_anything_goes o -> s_o_done_anything_goes o

(**
 * The Trading market is trading, and people are predicting outcomes.
 *)
type s_m_trading

(**
 * The Trading market is pending an answer from the oracle.
 *)
type s_m_pending_oracle

(**
 * The Trading market is in a state where people can claim from their prediction.
 *)
type s_m_claiming

type 's m =
  | Created : s_m_trading m
  | Traded : outcome * [`Fusdc of int] * [`Shares of int] * s_m_trading m -> s_m_trading m
  | Deadline_passed : s_m_trading m -> s_m_pending_oracle m
  | Oracle_submission :  s_o_completed o * s_m_pending_oracle m -> s_m_claiming m
  | Claim : outcome * int * s_m_claiming m -> s_m_claiming m

(* Edit ,.-1>ai can you convert this gadt into a mermaid diagram? *)

(*
stateDiagram
    [*] --> Waiting
    Waiting --> Calling
    Calling --> Whinged
    Whinged --> Prediction
    Whinged --> Predicting_over
    Calling --> Calling_over
    Predicting_over --> Completed
    Calling_over --> Completed
    Completed --> Slashing_begun
    Completed --> Oracle_submission
    Slashing_begun --> Slashing_two_days_over
    Slashing_begun --> Slashed
    Slashed --> Slashing_begun
    Slashing_two_days_over --> Anything_goes
    Anything_goes --> Anything_goes_slash
    Anything_goes_slash --> Anything_goes
    Anything_goes --> Anything_goes_slashing_over
    Anything_goes_slashing_over --> Done_anything_goes
    Created --> Traded
    Traded --> Deadline_passed
    Deadline_passed --> Oracle_submission
    Oracle_submission --> Claim
*)
