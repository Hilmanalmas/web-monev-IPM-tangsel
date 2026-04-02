<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorshipLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'observer_id',
        'slot_id',
        'score',
        'notes',
        'day'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
