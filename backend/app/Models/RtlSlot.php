<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class RtlSlot extends Model {
    protected $fillable = ['name', 'start_time', 'end_time'];
}
