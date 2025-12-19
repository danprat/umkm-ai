-- Migration: Atomic Credit Deduction
-- Purpose: Fix race conditions in credit system
-- Created: 2024-12-19

-- Create atomic credit deduction function
-- This prevents race conditions by doing check + deduct in single transaction
CREATE OR REPLACE FUNCTION deduct_credit_atomic(
  p_user_id UUID,
  p_rate_limit_seconds INTEGER DEFAULT 60
)
RETURNS TABLE(success BOOLEAN, new_credits INTEGER) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_credits INTEGER;
  v_email_verified BOOLEAN;
  v_last_generate_at TIMESTAMPTZ;
  v_wait_seconds INTEGER;
BEGIN
  -- Lock the row for update to prevent race conditions
  SELECT credits, email_verified, last_generate_at
  INTO v_credits, v_email_verified, v_last_generate_at
  FROM profiles
  WHERE id = p_user_id
  FOR UPDATE;  -- Row-level lock prevents concurrent modifications
  
  -- Check if profile exists
  IF NOT FOUND THEN
    RAISE EXCEPTION 'PROFILE_NOT_FOUND';
  END IF;
  
  -- Check email verification
  IF NOT v_email_verified THEN
    RAISE EXCEPTION 'EMAIL_NOT_VERIFIED';
  END IF;
  
  -- Check credits
  IF v_credits <= 0 THEN
    RAISE EXCEPTION 'INSUFFICIENT_CREDITS';
  END IF;
  
  -- Check rate limit
  IF v_last_generate_at IS NOT NULL THEN
    v_wait_seconds := p_rate_limit_seconds - EXTRACT(EPOCH FROM (NOW() - v_last_generate_at))::INTEGER;
    IF v_wait_seconds > 0 THEN
      RAISE EXCEPTION 'RATE_LIMITED:%', v_wait_seconds;
    END IF;
  END IF;
  
  -- Atomic deduction: decrement credits and update timestamp
  UPDATE profiles
  SET credits = credits - 1,
      last_generate_at = NOW()
  WHERE id = p_user_id;
  
  -- Return new credit balance
  RETURN QUERY
  SELECT TRUE, v_credits - 1;
END;
$$;

-- Create atomic refund function
CREATE OR REPLACE FUNCTION refund_credit_atomic(
  p_user_id UUID
)
RETURNS TABLE(success BOOLEAN, new_credits INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_credits INTEGER;
BEGIN
  -- Atomic increment
  UPDATE profiles
  SET credits = credits + 1
  WHERE id = p_user_id
  RETURNING credits INTO v_new_credits;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'PROFILE_NOT_FOUND';
  END IF;
  
  RETURN QUERY
  SELECT TRUE, v_new_credits;
END;
$$;
