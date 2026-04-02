<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class ExamQuestion extends Model {
    protected $fillable = ['exam_id', 'type', 'question_text', 'options', 'weights', 'correct_answer', 'points'];
    protected $casts = ['options' => 'array', 'weights' => 'array'];
    public function exam() { return $this->belongsTo(Exam::class); }
}
