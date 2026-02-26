
-- Function to handle review updates based on Ebbinghaus curve

CREATE OR REPLACE FUNCTION handle_review_update(
    p_schedule_id UUID,
    p_success BOOLEAN
)
RETURNS VOID AS $$
DECLARE
    v_current_stage INTEGER;
    v_vocab_id UUID;
    v_next_interval INTEGER;
BEGIN
    -- Get current schedule info
    SELECT review_stage, vocabulary_id INTO v_current_stage, v_vocab_id
    FROM review_schedules
    WHERE id = p_schedule_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Review schedule not found';
    END IF;

    IF p_success THEN
        -- Calculate next interval based on stage
        -- Stage 1 -> 2 days
        -- Stage 2 -> 4 days
        -- Stage 3 -> 7 days
        -- Stage 4 -> 15 days
        -- Stage 5 -> 30 days
        -- Stage 6 -> 60 days
        -- Stage 7 -> 90 days
        
        -- Note: The TAD says:
        -- 1st review: 1 day later (This is the initial state)
        -- 2nd review: 2 days later
        -- 3rd review: 4 days later
        -- ...
        
        IF v_current_stage >= 8 THEN
            -- Mark as mastered
            UPDATE vocabularies 
            SET mastery_level = 'mastered' 
            WHERE id = v_vocab_id;
            
            UPDATE review_schedules 
            SET completed = TRUE, 
                completed_at = NOW() 
            WHERE id = p_schedule_id;
        ELSE
            -- Determine interval for NEXT review
            v_next_interval := CASE (v_current_stage + 1)
                WHEN 2 THEN 2
                WHEN 3 THEN 4
                WHEN 4 THEN 7
                WHEN 5 THEN 15
                WHEN 6 THEN 30
                WHEN 7 THEN 60
                WHEN 8 THEN 90
                ELSE 90
            END;

            -- Update schedule
            UPDATE review_schedules 
            SET review_stage = v_current_stage + 1,
                review_date = CURRENT_DATE + (v_next_interval || ' days')::INTERVAL
            WHERE id = p_schedule_id;
            
            -- Update vocabulary status to learning if it was new
            UPDATE vocabularies
            SET mastery_level = 'learning'
            WHERE id = v_vocab_id AND mastery_level = 'new';
        END IF;
    ELSE
        -- Reset to stage 1 if failed
        UPDATE review_schedules 
        SET review_stage = 1,
            review_date = CURRENT_DATE + INTERVAL '1 day'
        WHERE id = p_schedule_id;
        
        -- Ensure mastery level is learning
        UPDATE vocabularies
        SET mastery_level = 'learning'
        WHERE id = v_vocab_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION handle_review_update TO authenticated;
GRANT EXECUTE ON FUNCTION handle_review_update TO anon;
