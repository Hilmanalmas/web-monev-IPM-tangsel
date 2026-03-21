<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Penalty extends Model {
    protected $fillable = ['user_id', 'type', 'points_deducted', 'reason'];

    public function user() {
        return $this->belongsTo(User::class);
    }
}
