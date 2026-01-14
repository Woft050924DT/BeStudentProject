export interface Student {
    student_code: string;
    class_id: number;
    admission_year: number;
    gpa ?: number;
    credits_earned ?: number;
    academic_status ?: string;
    cv_file ?: string;
}
