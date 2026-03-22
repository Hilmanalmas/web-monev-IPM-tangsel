import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ClipboardEdit, FileText, Loader2, AlertCircle } from 'lucide-react';

const EvaluationForm = () => {
    const [target, setTarget] = useState(null);
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
    const [status, setStatus] = useState("loading");
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTarget = async () => {
             try {
                 const response = await axios.get('/api/manito/target');
                 setTarget(response.data.target);
                 setStatus("idle");
             } catch (err) {
                 if (err.response?.status === 404 || err.response?.status === 403) {
                     setError("You have not been assigned a Manito target yet.");
                 } else {
                     setError("Failed to load your Manito target.");
                 }
                 setStatus("error");
             }
        };
        fetchTarget();
    }, []);

    const handleScoreChange = (field, value) => {
        setScores(prev => ({ ...prev, [field]: value }));
    };

    const submit = async (e) => {
        e.preventDefault();
        
        // Validation minimum scores
        const hasZeroScore = Object.values(scores).some(val => val === 0);
        if (hasZeroScore) {
             setError("Please provide a score for all criteria.");
             return;
        }

        setStatus("submitting");
        setError(null);

        try {
            await axios.post('/api/evaluations', { 
                ...scores, 
                evidence_notes: evidence 
            });
            setStatus("success");
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Failed to submit evaluation. Please try again.");
            setStatus("idle");
        }
    };

    if (status === "loading") {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-gray-500">
                <Loader2 className="animate-spin mb-4" size={32} />
                <p>Loading your assigned target...</p>
            </div>
        );
    }

    if (status === "error") {
        return (
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 text-center border-t-4 border-red-500">
                <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
                <h2 className="text-xl font-bold text-gray-800 mb-2">Notice</h2>
                <p className="text-gray-600">{error}</p>
            </div>
        );
    }

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
                                    ${scores[f.key] === val ? 'bg-amber-500 text-white border-transparent' : 'bg-white text-gray-600 border border-gray-200 hover:bg-amber-50'}`}
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
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden p-6 sm:p-8 w-full border-t-4 border-amber-500">
            <div className="flex items-center gap-3 mb-6 border-b pb-4 border-gray-100">
                <div className="p-3 bg-amber-100 text-amber-600 rounded-lg"><ClipboardEdit size={24} /></div>
                <div>
                     <h2 className="text-2xl font-bold text-gray-800">Manito Evaluation</h2>
                     <p className="text-sm text-gray-500">Evaluating: <span className="font-semibold text-gray-700 bg-yellow-100 px-2 rounded">{target?.name || "Unknown"}</span></p>
                </div>
            </div>

            {status === "success" ? (
                 <div className="text-center p-10 bg-green-50 border border-green-200 rounded-xl">
                    <div className="text-green-600 font-bold text-xl mb-2">Evaluation Submitted!</div>
                    <p className="text-green-700 text-sm">Thank you, your confidential evaluation has been securely recorded.</p>
                 </div>
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
                        <p className="text-xs text-gray-500 mb-3">Provide a clear statement justifying the scores. Explain what you observed.</p>
                        <textarea 
                            required rows="3" minLength={10}
                            className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-shadow resize-none"
                            placeholder="e.g. He completed the task quickly but struggled with..."
                            value={evidence} onChange={e => setEvidence(e.target.value)}
                        />
                    </div>
                    
                    {error && <p className="text-red-500 text-sm mb-4 font-medium text-center">{error}</p>}

                    <button 
                        type="submit" 
                        disabled={status === "submitting"}
                        className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 px-6 rounded-xl transition-transform transform active:scale-[0.98] shadow-lg disabled:opacity-50 flex justify-center items-center gap-2"
                    >
                        {status === "submitting" ? <><Loader2 className="animate-spin" size={20}/> Submitting...</> : "Submit Confidential Evaluation"}
                    </button>
                </form>
            )}
        </div>
    );
}

export default EvaluationForm;
