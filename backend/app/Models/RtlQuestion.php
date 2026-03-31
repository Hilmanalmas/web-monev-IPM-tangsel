<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class RtlQuestion extends Model {
    protected $fillable = ['question_text', 'is_active'];
}
