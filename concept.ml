#!/usr/bin/env -S ocaml -w +A

(* s l is the Lockup, 's o is the Infrastructure Market, 's m is the Trading contract *)

(**
 * Lockup had an amount locked up and is able to be spent.
*)
type s_l_unspent

(**
 * Lockup is in a spent stage and can't be spent again after it's vested.
*)
type s_l_spent

type 's l =
  | Locked_up : int -> s_l_unspent l
  | Spent : s_l_unspent l -> s_l_spent l

type outcome = [`Outcome_a | `Outcome_b]

type whinger = string

(** The Oracle is in a state of waiting for its start date to begin. *)
type s_o_waiting

(**
 *  The Oracle is in a state of someone needing to declare that the
 *  outcome has taken place. This could be re-entered if someone
 * were to supply the zero bytes8 as the winner.
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
 * The Oracle has seen a commitment from someone that will need to reveal.
*)
type s_o_committing

(*
 * The Oracle has seen the commitment stage conclude, and is now
 * expecting the reveal stage.
 *)
type s_o_committing_over

(**
 * The Oracle is in a stage where revealing is needed from those who previously committed.
 *)
type s_o_revealing

(**
 * The Oracle has seen the revealing stage conclude, and is now expecting
 * the slashing stage.
 *)
type s_o_revealing_done

(**
 * The Oracle two day period predicting period has completed. Trading can benefit from the
 * outcome now.
*)
type s_o_slashing_needed

(**
 * The Oracle is now in a state where slashing is possible of bad
 * predictors.
*)
type s_o_slashing

(*
 * The Oracle is in a conclusive state where it either concludes, or it
 * reverts to the reset stage if the outcome is 0.
 *)
type s_o_done

(*
 * This is a very bad situation. The Escape Hatch functionality is
 * needed, as the contract has been in a waiting stage past the deadline.
 * In this circumstance, the infra market must notify Trading that the
 * situation is unusual, and that DAO intervention is potentially needed.
 * Really, this outcome is only needed in the DPM, as the AMM should
 * include a indeterminate state to skip this behaviour, and to track correct
 * betting (since the current iteration of the DPM is only two outcomes).
 *)
type s_o_escape_hatch

type _ o =
  | Calling : s_o_calling o
  | Whinged : outcome * whinger * s_o_calling o -> s_o_committing o
  | Commitment : s_l_spent l * s_o_whinged o -> s_o_committing o
  | Committing_over : s_o_committing o -> s_o_revealing o
  | Revealed : outcome * s_o_revealing o -> s_o_revealing o
  | Revealing_done : s_o_revealing o -> s_o_revealing_done o
  | Declared : [`Winner of outcome]  * s_o_revealing_done o -> s_o_slashing_needed o
  | Calling_over : s_o_calling -> s_o_done o
  | Sweeped : [`Victim of whinger] * [`Slasher of whinger] * s_o_done o -> s_o_done o
  | Reset_winner_is_zero : s_o_done o -> s_o_calling o
  | Escape_hatch_is_needed: s_o_calling o -> s_o_escape_hatch o

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

(*
 * The Escape Hatch has been used on this market, and it's in an
 * indeterminate state. The DAO needs to intervene to rescue this
 * contract. It's possible that this could be called in any state, but
 * the frontend should always create the indeterminate state for the
 * custom outcomes. This is really for the DPM.
 *)
type s_m_escape_hatch

type 's m =
  | Created : s_m_trading m
  | Traded : outcome * [`Fusdc of int] * [`Shares of int] * s_m_trading m -> s_m_trading m
  | Deadline_passed : s_m_trading m -> s_m_pending_oracle m
  | Oracle_submission_pending_oracle :  s_o_done o * s_m_pending_oracle m -> s_m_claiming m
  | Oracle_submission_trading :  s_o_done o * s_m_trading m -> s_m_claiming m
  | Oracle_escape_hatch_trading : s_o_escape_hatch o * s_m_trading m -> s_m_escape_hatch m
  | Claim : outcome * int * s_m_claiming m -> s_m_claiming m

(* Edit ,.-1>ai can you convert this gadt into a state mermaid diagram? *)
