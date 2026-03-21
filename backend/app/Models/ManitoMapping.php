<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class ManitoMapping extends Model {
    protected $fillable = ['assessor_id', 'target_id', 'is_active'];

    public function assessor() {
        return $this->belongsTo(User::class, 'assessor_id');
    }

    public function target() {
        return $this->belongsTo(User::class, 'target_id');
    }
}
