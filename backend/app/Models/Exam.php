<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Exam extends Model {
    protected $fillable = ['day', 'type', 'title', 'description', 'start_time', 'end_time', 'duration_minutes', 'show_result'];
    protected $casts = ['show_result' => 'boolean'];
    public function questions() { return $this->hasMany(ExamQuestion::class); }
    public function submissions() { return $this->hasMany(ExamSubmission::class); }
}

