<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class PracticeScore extends Model {
    protected $fillable = ['user_id', 'observer_id', 'score', 'notes'];

    public function user() { return $this->belongsTo(User::class); }
    public function observer() { return $this->belongsTo(User::class, 'observer_id'); }
}
