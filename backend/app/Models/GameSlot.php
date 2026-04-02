<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class GameSlot extends Model {
    protected $fillable = ['name', 'day', 'start_time', 'end_time'];
}
