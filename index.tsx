import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { db } from './firebase';
// fix: Removed unused v9 Firebase imports
// import { ref, set, onValue, update, push } from 'firebase/database';

type Mode = 'select' | 'admin' | 'viewer' | 'loading';
type TimerStatus = 'default' | 'green' | 'yellow' | 'red' | 'grey';

// --- Initial State ---
const initialState = {
    meetingName: '팀 주간 회의',
    totalSeconds: 15 * 60,
    remainingSeconds: 15 * 60,
    isActive: false,
    isPaused: false,
};

// --- Helper Functions ---
const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const getStatus = (remainingSeconds: number, isActive: boolean, isPaused: boolean): TimerStatus => {
    if (!isActive || isPaused) return 'grey';
    if (remainingSeconds < 60) return 'red';
    if (remainingSeconds < 300) return 'yellow';
    return 'green';
};


// --- Components ---

const RoleSelection = ({ createAdminSession }: { createAdminSession: () => void }) => (
    <div className="role-selection">
        <h1>발표 타이머</h1>
        <p>타이머를 만들거나 공유받은 링크를 통해 참여하세요.</p>
        <button className="button button-primary" onClick={createAdminSession} aria-label="타이머 관리하기">
            새 타이머 만들기
        </button>
        <p className="description-text">타이머를 보려면 관리자가 공유한 링크 또는 QR 코드가 필요합니다.</p>
    </div>
);

const ViewerView = ({ appState }) => {
    const { remainingSeconds, meetingName, isActive, isPaused } = appState;
    const status = getStatus(remainingSeconds, isActive, isPaused);

    useEffect(() => {
        document.body.className = `status-${status}`;
        return () => {
            document.body.className = '';
        }
    }, [status]);

    return (
        <div className={`viewer-view`}>
            <h2 className="meeting-name">{meetingName || '회의'}</h2>
            <div className="timer-display">{formatTime(remainingSeconds)}</div>
        </div>
    );
};

const AdminDashboard = ({ appState, sessionId, updateRealtimeDBState }) => {
    const [minutes, setMinutes] = useState(Math.floor(appState.totalSeconds / 60));
    const [seconds, setSeconds] = useState(appState.totalSeconds % 60);
    const [meetingName, setMeetingName] = useState(appState.meetingName);
    const [showQr, setShowQr] = useState(false);
    const [copied, setCopied] = useState(false);

    const shareUrl = `${window.location.origin}${window.location.pathname}#view/${sessionId}`;

    useEffect(() => {
        setMinutes(Math.floor(appState.totalSeconds / 60));
        setSeconds(appState.totalSeconds % 60);
        setMeetingName(appState.meetingName);
    }, [appState.totalSeconds, appState.meetingName]);
    
    const handleSettingsSave = () => {
        const totalSeconds = (minutes * 60) + seconds;
        updateRealtimeDBState({
            ...initialState,
            totalSeconds,
            remainingSeconds: totalSeconds,
            meetingName,
        });
    };

    const handleStartPause = () => {
        if (!appState.isActive) {
            updateRealtimeDBState({ isActive: true, isPaused: false });
        } else {
            updateRealtimeDBState({ isPaused: !appState.isPaused });
        }
    };

    const handleReset = () => {
        updateRealtimeDBState({
            isActive: false,
            isPaused: false,
            remainingSeconds: appState.totalSeconds
        });
    };
    
    const handleCopyUrl = () => {
        navigator.clipboard.writeText(shareUrl).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const getButtonText = () => {
        if (!appState.isActive) return '시작';
        if (appState.isPaused) return '계속';
        return '일시정지';
    };

    return (
        <div className="admin-dashboard">
            <button onClick={() => window.location.hash = ''} className="back-button" aria-label="뒤로가기">&larr;</button>
            <h2>타이머 관리</h2>

            <div className="admin-panel">
                <h3>설정</h3>
                <div className="input-group">
                    <label htmlFor="meetingName">회의명</label>
                    <input
                        id="meetingName" type="text" className="input-field"
                        value={meetingName} onChange={(e) => setMeetingName(e.target.value)}
                        placeholder="회의명을 입력하세요"
                        disabled={appState.isActive}
                    />
                </div>
                <div className="input-group">
                    <label>총 발표 시간</label>
                    <div className="time-input-group">
                        <input type="number" value={minutes} onChange={(e) => setMinutes(Math.max(0, parseInt(e.target.value, 10) || 0))} aria-label="분" disabled={appState.isActive}/>
                        <span>:</span>
                        <input type="number" value={seconds} onChange={(e) => setSeconds(Math.max(0, Math.min(59, parseInt(e.target.value, 10) || 0)))} aria-label="초" disabled={appState.isActive}/>
                    </div>
                </div>
                <button className="button button-primary" onClick={handleSettingsSave} disabled={appState.isActive}>설정 적용</button>
            </div>

            <div className="admin-panel">
                <h3>제어 및 공유</h3>
                <div className="timer-display-small">{formatTime(appState.remainingSeconds)}</div>
                <div className="controls">
                    <button className="button button-primary" onClick={handleStartPause} disabled={appState.totalSeconds === 0}>{getButtonText()}</button>
                    <button className="button button-secondary" onClick={handleReset}>초기화</button>
                </div>
                <div className="share-controls">
                     <button className="button button-secondary" onClick={handleCopyUrl}>
                        {copied ? '복사 완료!' : 'URL 복사'}
                    </button>
                    <button className="button button-secondary" onClick={() => setShowQr(!showQr)}>
                        {showQr ? 'QR 숨기기' : 'QR 코드 보기'}
                    </button>
                </div>
                {showQr && (
                    <div className="qr-code-container">
                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(shareUrl)}`} alt="Timer Share QR Code" />
                        <p>이 QR 코드를 스캔하여 타이머를 공유하세요.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Main App Component ---

const App = () => {
    const [mode, setMode] = useState<Mode>('loading');
    const [appState, setAppState] = useState(initialState);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const intervalRef = useRef<number | null>(null);

    // Update RealtimeDB with new state
    const updateRealtimeDBState = useCallback((newState) => {
        if (sessionId) {
            // fix: Updated to use Firebase v8 namespaced API.
            db.ref('timers/' + sessionId).update(newState);
        }
    }, [sessionId]);

    // Admin-only countdown timer logic
    useEffect(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        
        if (mode === 'admin' && appState.isActive && !appState.isPaused) {
            intervalRef.current = window.setInterval(() => {
                const newRemaining = appState.remainingSeconds - 1;
                if (newRemaining >= 0) {
                     // Update only remainingSeconds to avoid race conditions with other state changes
                    updateRealtimeDBState({ remainingSeconds: newRemaining });
                } else {
                    updateRealtimeDBState({ remainingSeconds: 0, isActive: false });
                    if (intervalRef.current) clearInterval(intervalRef.current);
                }
            }, 1000);
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [mode, appState.isActive, appState.isPaused, appState.remainingSeconds, updateRealtimeDBState]);


    // URL hash change listener to determine mode and session
    useEffect(() => {
        // fix: Added proper subscription management to prevent memory leaks.
        let unsubscribeFromDB: (() => void) | null = null;

        const handleHashChange = () => {
            // fix: Unsubscribe from any previous listener before creating a new one.
            if (unsubscribeFromDB) {
                unsubscribeFromDB();
                unsubscribeFromDB = null;
            }

            const hash = window.location.hash.slice(1);
            const [hashMode, id] = hash.split('/');

            if ((hashMode === 'admin' || hashMode === 'view') && id) {
                setSessionId(id);
                // fix: Updated to use Firebase v8 namespaced API and added listener management.
                const sessionRef = db.ref('timers/' + id);
                const listener = (snapshot: any) => {
                    if (snapshot.exists()) {
                        setAppState(snapshot.val() as typeof initialState);
                    } else {
                        console.error("Timer session not found!");
                        window.location.hash = ''; // Redirect to home
                    }
                };
                sessionRef.on('value', listener);
                unsubscribeFromDB = () => sessionRef.off('value', listener);
                setMode(hashMode as Mode);

            } else {
                setSessionId(null);
                setAppState(initialState);
                setMode('select');
            }
        };

        window.addEventListener('hashchange', handleHashChange);
        handleHashChange(); // Initial call

        return () => {
            window.removeEventListener('hashchange', handleHashChange);
            // fix: Ensure cleanup of the DB listener on component unmount.
            if (unsubscribeFromDB) {
                unsubscribeFromDB();
            }
        };
    }, []);

    const createAdminSession = async () => {
        try {
            // fix: Updated to use Firebase v8 namespaced API.
            const newSessionRef = db.ref('timers').push();
            await newSessionRef.set(initialState);
            window.location.hash = `admin/${newSessionRef.key}`;
        } catch (error) {
            console.error("Error creating new session:", error);
            alert("타이머를 생성하는데 실패했습니다. 다시 시도해주세요.");
        }
    };

    const renderContent = () => {
        if (mode === 'loading') {
            return <div className="loading">Loading...</div>;
        }

        switch (mode) {
            case 'admin':
                return <AdminDashboard appState={appState} sessionId={sessionId} updateRealtimeDBState={updateRealtimeDBState} />;
            case 'viewer':
                return <ViewerView appState={appState} />;
            case 'select':
            default:
                return <RoleSelection createAdminSession={createAdminSession} />;
        }
    };
    
    if (mode === 'viewer') {
        return <ViewerView appState={appState} />;
    }

    return (
        <div className="app-container">
            {renderContent()}
        </div>
    );
};

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);
