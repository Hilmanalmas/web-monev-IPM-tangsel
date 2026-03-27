<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Survey extends Model {
    protected $fillable = ['title', 'description', 'is_active'];
    public function questions() { return $this->hasMany(SurveyQuestion::class); }
}

class SurveyQuestion extends Model {
    protected $fillable = ['survey_id', 'question_text', 'type', 'options'];
    protected $casts = ['options' => 'array'];
    public function survey() { return $this->belongsTo(Survey::class); }
}

class SurveyResponse extends Model {
    protected $fillable = ['user_id', 'target_id', 'question_id', 'answer'];
    public function question() { return $this->belongsTo(SurveyQuestion::class); }
    public function user() { return $this->belongsTo(User::class); }
    public function target() { return $this->belongsTo(User::class, 'target_id'); }
}
