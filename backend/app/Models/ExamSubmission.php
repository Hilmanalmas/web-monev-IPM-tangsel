<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class ExamSubmission extends Model {
    protected $fillable = ['user_id', 'exam_id', 'score', 'archetype', 'day', 'submitted_at'];
    
    public function user() { return $this->belongsTo(User::class); }
    public function exam() { return $this->belongsTo(Exam::class); }
    public function answers() { return $this->hasMany(ExamAnswer::class, 'submission_id'); }
}
