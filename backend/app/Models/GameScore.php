<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class GameScore extends Model {
    protected $fillable = ['user_id', 'observer_id', 'slot_id', 'score', 'notes', 'day'];

    public function user() { return $this->belongsTo(User::class); }
    public function observer() { return $this->belongsTo(User::class, 'observer_id'); }
    public function slot() { return $this->belongsTo(GameSlot::class, 'slot_id'); }
}
