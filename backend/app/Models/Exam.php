<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Exam extends Model {
    protected $fillable = ['title', 'description', 'start_time', 'end_time', 'duration_minutes'];
    public function questions() { return $this->hasMany(ExamQuestion::class); }
    public function submissions() { return $this->hasMany(ExamSubmission::class); }
}

class ExamQuestion extends Model {
    protected $fillable = ['exam_id', 'type', 'question_text', 'options', 'correct_answer', 'points'];
    protected $casts = ['options' => 'array'];
    public function exam() { return $this->belongsTo(Exam::class); }
}

class ExamSubmission extends Model {
    protected $fillable = ['user_id', 'exam_id', 'score', 'submitted_at'];
    public function answers() { return $this->hasMany(ExamAnswer::class, 'submission_id'); }
    public function user() { return $this->belongsTo(User::class); }
    public function exam() { return $this->belongsTo(Exam::class); }
}

class ExamAnswer extends Model {
    protected $fillable = ['submission_id', 'question_id', 'user_answer', 'is_correct'];
    public function submission() { return $this->belongsTo(ExamSubmission::class); }
    public function question() { return $this->belongsTo(ExamQuestion::class); }
}
