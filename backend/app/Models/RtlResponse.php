<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class RtlResponse extends Model {
    protected $fillable = ['user_id', 'question_id', 'slot_id', 'selfie_url', 'answer', 'date'];
}
