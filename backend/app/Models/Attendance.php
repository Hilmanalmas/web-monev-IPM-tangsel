<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Attendance extends Model {
    protected $fillable = ['user_id', 'slot_id', 'selfie_url', 'latitude', 'longitude', 'recorded_at', 'day'];
    public $timestamps = true;

    protected $casts = [
        'recorded_at' => 'datetime',
    ];

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function slot() {
        return $this->belongsTo(AttendanceSlot::class, 'slot_id');
    }
}
