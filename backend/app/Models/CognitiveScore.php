<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class CognitiveScore extends Model {
    protected $fillable = ['user_id', 'observer_id', 'score', 'notes'];
}
