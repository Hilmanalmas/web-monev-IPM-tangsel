<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class CognitiveScore extends Model {
    protected $fillable = ['user_id', 'observer_id', 'exam_submission_id', 'score', 'notes', 'day'];

    public function user() { return $this->belongsTo(User::class); }
    public function observer() { return $this->belongsTo(User::class, 'observer_id'); }
    public function submission() { return $this->belongsTo(ExamSubmission::class, 'exam_submission_id'); }
}
