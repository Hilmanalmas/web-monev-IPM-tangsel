<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Evaluation extends Model {
    protected $guarded = ['id', 'created_at', 'updated_at'];

    public function assessor() {
        return $this->belongsTo(User::class, 'assessor_id');
    }

    public function target() {
        return $this->belongsTo(User::class, 'target_id');
    }
}
