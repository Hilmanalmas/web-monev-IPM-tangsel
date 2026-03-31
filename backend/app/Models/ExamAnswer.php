<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class ExamAnswer extends Model {
    protected $fillable = ['submission_id', 'question_id', 'user_answer', 'is_correct'];

    public function question() { return $this->belongsTo(ExamQuestion::class); }
}
