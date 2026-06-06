import React, { useState, useEffect } from 'react';
import ReadingState from '../game/state.js';
import { useAuth } from '../contexts/AuthContext'

export default function ReactQuiz({ mapKey, onClose }) {
    const { user } = useAuth()
    const [error, setError] = useState('')
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState(() => {
        if (ReadingState?.quizAnswers?.[mapKey]) {
            return [...ReadingState.quizAnswers[mapKey]];
        }
        return ["", "", ""];
    });

    const resubmittable = ReadingState.isLevelPendingResubmission(mapKey)
    const isReadOnly = !!(!resubmittable && ReadingState?.quizAnswers && ReadingState.quizAnswers[mapKey]);

    const questions = [
        "Mikä on tämän tarinan juoni?",
        "Ketkä ovat tarinan päähenkilöt?",
        "Mitä ajatuksia tai tunteita tämä tarina herätti sinussa?"
    ];

    const handleNext = async () => {
        if (step < questions.length - 1) {
            setStep(step + 1);
        } else {
            if (!isReadOnly) {
                // Submit quiz answers to backend and wait for result
                const quizError = await ReadingState.submitQuizAnswers(mapKey, questions, answers);
                if (quizError) {
                    setError('Vastauksien lähettäminen epäonnistui. Tarkistathan että vastaukset ovat vähintään 3 merkkiä pitkiä.');
                    setStep(0);
                    return;
                }

                // Makes quiz readonly only after quiz has been successfully submitted
                if (!ReadingState.quizAnswers) ReadingState.quizAnswers = {};
                ReadingState.quizAnswers[mapKey] = answers;

                // After successful submission, mark the level complete (this will also unlock the next map)
                try {
                    ReadingState.saveLevelComplete(mapKey, user?.id);
                } catch (err) {
                    console.warn('Failed to mark level complete locally:', err);
                }

                // clear pending resubmission flag after re-submit
                if (resubmittable) ReadingState.levelsPendingResubmission[mapKey] = false;
            }
            onClose();
        }
    };

    const handlePrev = () => {
        if (step > 0) {
            setStep(step - 1);
        }
    };

    if (!mapKey) return null;

    return (
        <div style={styles.overlay}>
            <div style={styles.box} onClick={(e) => e.stopPropagation()}>
                <h2 style={styles.title}>{isReadOnly ? "OMAT VASTAUKSET" : "TARINAKYSELY"}</h2>
                <div style={styles.divider}></div>
                
                <p style={styles.question}>{questions[step]}</p>
                
                <textarea
                    autoFocus
                    readOnly={isReadOnly}
                    value={answers[step]}
                    onChange={(e) => {
                        const newAns = [...answers];
                        newAns[step] = e.target.value;
                        setAnswers(newAns);
                    }}
                    placeholder="Kirjoita vastauksesi tähän..."
                    style={{
                        ...styles.textarea,
                        backgroundColor: isReadOnly ? '#dcd7ca' : '#fdf6e3'
                    }}
                />

                <div style={styles.footer}>
                    <div style={styles.btnGroup}>
                        {step > 0 && (
                            <button onClick={handlePrev} style={styles.prevButton}>
                                EDELLINEN
                            </button>
                        )}
                        
                        <button onClick={handleNext} style={styles.nextButton}>
                            {step === questions.length - 1 ? (isReadOnly ? "SULJE" : "LÄHETÄ") : "SEURAAVA"}
                        </button>
                    </div>
                    <span style={styles.stepInfo}>Vaihe {step + 1} / 3</span>
                </div>
                {error && <p className="section-error">{error}</p>}
            </div>
        </div>
    );
}

const styles = {
    overlay: {
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        backgroundColor: 'rgba(10, 25, 47, 0.9)',
        display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100000
    },
    box: {
        width: '92%', maxWidth: '420px', maxHeight: '90vh',
        backgroundColor: '#1e3a5f', border: '3px solid #c4973a',
        borderRadius: '12px', padding: '20px', textAlign: 'center',
        color: 'white', fontFamily: 'Nunito, sans-serif', boxSizing: 'border-box',
        overflowY: 'auto'
    },
    title: { color: '#c4973a', fontSize: '24px', margin: '0 0 10px 0', fontFamily: 'Cinzel Decorative, serif' },
    divider: { height: '2px', backgroundColor: '#c4973a', margin: '0 auto 15px', width: '40%' },
    question: { fontSize: '18px', marginBottom: '15px', minHeight: '50px', lineHeight: '1.4' },
    textarea: {
        width: '100%', height: '130px', padding: '12px', fontSize: '16px',
        borderRadius: '8px', border: '1px solid #c4973a', outline: 'none',
        color: '#1e3a5f', boxSizing: 'border-box', marginBottom: '20px'
    },
    footer: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' },
    btnGroup: { display: 'flex', gap: '10px', width: '100%', justifyContent: 'center' },
    nextButton: {
        backgroundColor: '#c4973a', color: 'white', border: 'none',
        padding: '10px 20px', fontSize: '16px', fontWeight: 'bold',
        cursor: 'pointer', borderRadius: '4px', flex: 1
    },
    prevButton: {
        backgroundColor: 'transparent', color: '#c4973a', border: '2px solid #c4973a',
        padding: '8px 20px', fontSize: '16px', fontWeight: 'bold',
        cursor: 'pointer', borderRadius: '4px', flex: 1
    },
    stepInfo: { fontSize: '14px', color: '#c4973a', opacity: 0.8 }
};