-- Fix for: column InstructorAssignment.added_by does not exist
-- Cause: Entity expects column "added_by" but DB table "instructor_assignments" is missing it (synchronize=false).

ALTER TABLE instructor_assignments
ADD COLUMN IF NOT EXISTS added_by INTEGER;

