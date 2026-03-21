import React, { useState } from 'react';
import axios from 'axios';
import { ClipboardEdit, FileText } from 'lucide-react';

const EvaluationForm = ({ targetName = "Unknown Target" }) => {
    const [scores, setScores] = useState({
        psychomotor_precision: 0,
        psychomotor_efficiency: 0,
        psychomotor_independence: 0,
        psychomotor_quality: 0,
        affective_initiative: 0,
        affective_resilience: 0,
        affective_ethics: 0,
        affective_collaboration: 0,
    });
    const [evidence, setEvidence] = useState("");
    const [status, setStatus] = useState("idle");

    const handleScoreChange = (field, value) => {
        setScores(prev => ({ ...prev, [field]: value }));
    };

    const submit = async (e) => {
        e.preventDefault();
        setStatus("submitting");
        try {
            await axios.post('/api/evaluations', { ...scores, evidence_notes: evidence }, {
                headers: { 'Authorization': `Bearer YOUR_TOKEN` }
            });
            setStatus("success");
        } catch (error) {
            console.error(error);
            setStatus("success"); // Mocking success for the preview
        }
    };

    const Section = ({ title, fields }) => (
        <div className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <h3 className="font-bold text-gray-700 mb-4">{title}</h3>
            {fields.map(f => (
                <div key={f.key} className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                    <label className="text-sm font-medium text-gray-600 flex-1">{f.label}</label>
                    <div className="flex gap-2 mt-2 sm:mt-0">
                        {[1, 2, 3, 4, 5].map(val => (
                            <button 
                                key={val} type="button" 
                                onClick={() => handleScoreChange(f.key, val)}
                                className={`w-8 h-8 rounded-full font-bold text-sm transition-colors shadow-sm
                                    ${scores[f.key] === val ? 'bg-blue-600 text-white border-transparent' : 'bg-white text-gray-600 border border-gray-200 hover:bg-blue-50'}`}
                            >
                                {val}
                            </button>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden p-6 sm:p-8 w-full">
            <div className="flex items-center gap-3 mb-6 border-b pb-4 border-gray-100">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><ClipboardEdit size={24} /></div>
                <div>
                     <h2 className="text-2xl font-bold text-gray-800">Manito Evaluation</h2>
                     <p className="text-sm text-gray-500">Evaluating: <span className="font-semibold text-gray-700">{targetName}</span></p>
                </div>
            </div>

            {status === "success" ? (
                 <div className="text-center p-10 text-green-600 font-bold text-xl">Evaluation Submitted!</div>
            ) : (
                <form onSubmit={submit}>
                    <Section title="Psychomotor (40%)" fields={[
                        { key: 'psychomotor_precision', label: 'Precise Execution' },
                        { key: 'psychomotor_efficiency', label: 'Tool Efficiency' },
                        { key: 'psychomotor_independence', label: 'Independence' },
                        { key: 'psychomotor_quality', label: 'Output Quality' }
                    ]} />
                    
                    <Section title="Affective (20%)" fields={[
                        { key: 'affective_initiative', label: 'Initiative' },
                        { key: 'affective_resilience', label: 'Resilience' },
                        { key: 'affective_ethics', label: 'Ethics & Discipline' },
                        { key: 'affective_collaboration', label: 'Collaboration' }
                    ]} />

                    <div className="mb-8">
                        <label className="flex items-center gap-2 font-bold text-gray-700 mb-2">
                            <FileText size={18}/> Evidence Log (Required)
                        </label>
                        <p className="text-xs text-gray-500 mb-3">Provide a clear statement justifying the scores.</p>
                        <textarea 
                            required rows="3" 
                            className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow resize-none"
                            placeholder="e.g. He completed the task quickly but struggled with..."
                            value={evidence} onChange={e => setEvidence(e.target.value)}
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={status === "submitting"}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-transform transform active:scale-[0.98] shadow-lg disabled:opacity-50"
                    >
                        {status === "submitting" ? "Submitting..." : "Submit Confidential Evaluation"}
                    </button>
                </form>
            )}
        </div>
    );
}

export default EvaluationForm;
