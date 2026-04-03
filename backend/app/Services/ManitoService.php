<?php
namespace App\Services;

use App\Models\User;
use App\Models\ManitoMapping;
use Illuminate\Support\Facades\DB;
use Exception;

class ManitoService
{
    /**
     * Shuffle all participants (peserta) and assign them a random target (Manito)
     * Ensures no one gets themselves as a target and ideally forms a closed loop.
     */
    public function shuffleAll($day = null)
    {
        DB::beginTransaction();
        try {
            if (!$day) {
                $day = \Illuminate\Support\Facades\DB::table('app_settings')
                    ->where('key', 'current_day')
                    ->value('value') ?: 1;
            }

            // Get all participants
            $pesertas = User::where('role', 'peserta')->get();
            
            if ($pesertas->count() < 2) {
                throw new Exception("Not enough participants to shuffle (minimum 2 required).");
            }

            // Invalidate old mappings for THIS day only
            ManitoMapping::where('day', $day)->delete();
            
            // Note: We don't want to globally deactivate other days anymore 
            // as it causes accounts from other days to lose their targets.
            // Mappings are already naturally filtered by 'day' and 'is_active'.

            $ids = $pesertas->pluck('id')->toArray();
            shuffle($ids);

            $mappings = [];
            // Create a cyclic matching (e.g., A->B, B->C, C->A)
            for ($i = 0; $i < count($ids); $i++) {
                $assessorId = $ids[$i];
                $targetId = $ids[($i + 1) % count($ids)]; // Next in shuffled array, wraps to 0 at the end

                $mappings[] = [
                    'assessor_id' => $assessorId,
                    'target_id' => $targetId,
                    'is_active' => true,
                    'day' => $day,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }

            ManitoMapping::insert($mappings);
            DB::commit();

            return ['success' => true, 'message' => "Manito mappings for Day $day successfully shuffled.", 'count' => count($mappings)];

        } catch (Exception $e) {
            DB::rollBack();
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }
}
