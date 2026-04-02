<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Exam;
use App\Models\ExamQuestion;
use Carbon\Carbon;

class ArchetypeExamSeeder extends Seeder
{
    public function run()
    {
        $exam = Exam::create([
            'day' => 1,
            'type' => 'archetype',
            'title' => 'Tes Mindset & Archetype Kader',
            'description' => 'Evaluasi psikologis untuk menentukan tipe kepemimpinan dan pola pikir kader (Growth Mindset & SPI Putih).',
            'start_time' => Carbon::now()->subDay(),
            'end_time' => Carbon::now()->addDays(7),
            'duration_minutes' => 30,
            'show_result' => false // Default set to false as requested by user to be chosen by admin
        ]);

        $questions = [
            [
                'text' => 'Bagaimana respon Anda ketika sebuah program kerja yang Anda pimpin mengalami kegagalan?',
                'options' => ['A' => 'Menganalisis kesalahan dan menjadikannya pelajaran berharga.', 'B' => 'Menerima kegagalan namun merasa kurang percaya diri setelahnya.', 'C' => 'Menganggap kegagalan adalah hal biasa dan tidak perlu dievaluasi berlebih.', 'D' => 'Cenderung menyalahkan keadaan atau faktor eksternal.'],
                'weights' => ['A' => 4, 'B' => 3, 'C' => 2, 'D' => 1]
            ],
            [
                'text' => 'Menurut Anda, apa yang paling menentukan keberhasilan seorang kader IPM?',
                'options' => ['A' => 'Kerja keras dan kemauan terus belajar hal baru.', 'B' => 'Kecerdasan bawaan dan bakat kepemimpinan.', 'C' => 'Kedekatan dengan struktur pimpinan di atasnya.', 'D' => 'Keberuntungan dan situasi organisasi yang mendukung.'],
                'weights' => ['A' => 4, 'B' => 3, 'C' => 2, 'D' => 1]
            ],
            [
                'text' => 'Seberapa sering Anda mencari feedback (masukan) dari orang lain terkait kinerja Anda?',
                'options' => ['A' => 'Sangat sering, karena masukan adalah bahan bakar pertumbuhan.', 'B' => 'Sesekali, jika saya merasa ragu dengan apa yang saya kerjakan.', 'C' => 'Jarang, saya lebih percaya pada penilaian diri sendiri.', 'D' => 'Hampir tidak pernah, karena feedback seringkali terasa seperti kritik.'],
                'weights' => ['A' => 4, 'B' => 3, 'C' => 2, 'D' => 1]
            ],
            [
                'text' => 'Apa pandangan Anda mengenai Sistem Perkaderan IPM (SPI) Putih yang baru?',
                'options' => ['A' => 'Inovasi yang harus segera dipelajari dan diterapkan secara kreatif.', 'B' => 'Perubahan yang menarik namun masih sulit untuk diimplementasikan.', 'C' => 'Aturan baru yang cukup diikuti saja apa adanya.', 'D' => 'Beban tambahan yang membuat gerak organisasi semakin rumit.'],
                'weights' => ['A' => 4, 'B' => 3, 'C' => 2, 'D' => 1]
            ],
            [
                'text' => 'Saat melihat rekan kader lain lebih sukses, apa yang Anda rasakan?',
                'options' => ['A' => 'Terinspirasi dan ingin mempelajari rahasia kesuksesannya.', 'B' => 'Senang, namun merasa sedikit tertinggal di belakang.', 'C' => 'Biasa saja, setiap orang punya jalannya masing-masing.', 'D' => 'Merasa terancam atau merasa tidak adil.'],
                'weights' => ['A' => 4, 'B' => 3, 'C' => 2, 'D' => 1]
            ],
            [
                'text' => 'Dalam rapat organisasi, seberapa berani Anda menyampaikan ide yang berbeda dari arus utama?',
                'options' => ['A' => 'Sangat berani, demi mencari solusi terbaik bagi organisasi.', 'B' => 'Berani jika ada beberapa rekan lain yang mendukung ide tersebut.', 'C' => 'Lebih memilih diam untuk menjaga harmoni forum.', 'D' => 'Selalu mengikuti pendapat pimpinan tertinggi tanpa membantah.'],
                'weights' => ['A' => 4, 'B' => 3, 'C' => 2, 'D' => 1]
            ],
            [
                'text' => 'Bagaimana Anda memandang tugas-tugas administratif di IPM?',
                'options' => ['A' => 'Bagian dari kedisiplinan dan profesionalitas yang harus dikembangkan.', 'B' => 'Kewajiban yang sebisa mungkin diselesaikan tepat waktu.', 'C' => 'Hal yang membosankan dan sering ditunda-tunda.', 'D' => 'Penghambat fokus utama dalam melakukan aksi nyata di lapangan.'],
                'weights' => ['A' => 4, 'B' => 3, 'C' => 2, 'D' => 1]
            ],
            [
                'text' => 'Apa yang Anda lakukan saat menghadapi tugas organisasi yang sangat sulit?',
                'options' => ['A' => 'Mencari referensi baru dan berkolaborasi untuk menyelesaikannya.', 'B' => 'Bertanya kepada senior tentang cara menyelesaikannya.', 'C' => 'Mengerjakannya pelan-pelan tanpa target yang jelas.', 'D' => 'Meminta pimpinan untuk mengalihkan tugas tersebut ke orang lain.'],
                'weights' => ['A' => 4, 'B' => 3, 'C' => 2, 'D' => 1]
            ],
            [
                'text' => 'Seberapa penting inovasi digital bagi gerakan IPM saat ini?',
                'options' => ['A' => 'Sangat krusial, IPM harus menjadi pelopor digital di kalangan pelajar.', 'B' => 'Penting, namun harus diseimbangkan dengan kegiatan konvensional.', 'C' => 'Menjadi tren saja, tidak terlalu berpengaruh pada substansi gerakan.', 'D' => 'Cukup merepotkan karena tidak semua kader siap dengan teknologi.'],
                'weights' => ['A' => 4, 'B' => 3, 'C' => 2, 'D' => 1]
            ],
            [
                'text' => 'Apa motivasi terbesar Anda tetap bertahan di IPM?',
                'options' => ['A' => 'Ingin terus bertumbuh secara personal dan memberi dampak sosial.', 'B' => 'Ingin menambah relasi dan jaringan untuk masa depan.', 'C' => 'Menjalankan amanah karena sudah telanjur dipilih dalam Musyda.', 'D' => 'Sekadar mengisi waktu luang agar tidak hampa sebagai pelajar.'],
                'weights' => ['A' => 4, 'B' => 3, 'C' => 2, 'D' => 1]
            ],
        ];

        foreach ($questions as $q) {
            ExamQuestion::create([
                'exam_id' => $exam->id,
                'type' => 'pg',
                'question_text' => $q['text'],
                'options' => $q['options'],
                'weights' => $q['weights'],
                'points' => 0 // Not using points for archetype
            ]);
        }
    }
}
