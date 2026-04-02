<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class SurveyResponse extends Model {
    protected $fillable = ['user_id', 'target_id', 'question_id', 'answer', 'period', 'date', 'day'];
    public function question() { return $this->belongsTo(SurveyQuestion::class); }
    public function user() { return $this->belongsTo(User::class); }
    public function target() { return $this->belongsTo(User::class, 'target_id'); }
}
