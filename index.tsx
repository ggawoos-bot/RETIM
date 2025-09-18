import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createRoot } from 'react-dom/client';

type Mode = 'select' | 'admin' | 'viewer';
type TimerStatus = 'default' | 'green' | 'yellow' | 'red' | 'grey';

// --- App State, Broadcast Channel, and LocalStorage for real-time sync ---
const broadcastChannel = new BroadcastChannel('presentation_timer_channel');
const STORAGE_KEY = 'presentation_timer_state';

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

const RoleSelection = ({ setMode }: { setMode: (mode: Mode) => void }) => (
    <div className="role-selection">
        <h1>발표 타이머</h1>
        <button className="button button-primary" onClick={() => setMode('viewer')} aria-label="발표 시간 확인하기">
            발표 시간 확인하기
        </button>
        <button className="button button-secondary" onClick={() => setMode('admin')} aria-label="타이머 관리하기">
            타이머 관리하기
        </button>
    </div>
);

const ViewerView = ({ appState }) => {
    const { remainingSeconds, meetingName, isActive, isPaused } = appState;
    const status = getStatus(remainingSeconds, isActive, isPaused);

    // Apply status to body for immersive background color
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

const AdminDashboard = ({ appState, updateAppState, setMode }) => {
    const [minutes, setMinutes] = useState(Math.floor(appState.totalSeconds / 60));
    const [seconds, setSeconds] = useState(appState.totalSeconds % 60);
    const [meetingName, setMeetingName] = useState(appState.meetingName);
    const [showQr, setShowQr] = useState(false);
    const [copied, setCopied] = useState(false);

    const shareUrl = `${window.location.origin}${window.location.pathname}#view&name=${encodeURIComponent(appState.meetingName)}&time=${appState.totalSeconds}`;

    // Effect to keep local form state in sync with global app state
    useEffect(() => {
        setMinutes(Math.floor(appState.totalSeconds / 60));
        setSeconds(appState.totalSeconds % 60);
        setMeetingName(appState.meetingName);
    }, [appState.totalSeconds, appState.meetingName]);

    // Timer logic - ONLY THE ADMIN RUNS THIS
    useEffect(() => {
        let intervalId: number | null = null;
        if (appState.isActive && !appState.isPaused) {
            intervalId = window.setInterval(() => {
                const newRemaining = appState.remainingSeconds - 1;
                if (newRemaining >= 0) {
                    updateAppState({
                        ...appState,
                        remainingSeconds: newRemaining,
                    });
                } else {
                    // Timer finished, stop it.
                    updateAppState({
                        ...appState,
                        remainingSeconds: 0,
                        isActive: false,
                    });
                }
            }, 1000);
        }
        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [appState.isActive, appState.isPaused, appState.remainingSeconds, updateAppState]);


    const handleSettingsSave = () => {
        const totalSeconds = (minutes * 60) + seconds;
        updateAppState({
            ...initialState,
            totalSeconds,
            remainingSeconds: totalSeconds,
            meetingName,
        });
    };

    const handleStartPause = () => {
        if (!appState.isActive) {
            updateAppState({ ...appState, isActive: true, isPaused: false });
        } else {
            updateAppState({ ...appState, isPaused: !appState.isPaused });
        }
    };

    const handleReset = () => {
        updateAppState({
            ...appState,
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
            <button onClick={() => setMode('select')} className="back-button" aria-label="뒤로가기">&larr;</button>
            <h2>타이머 관리</h2>

            {/* --- Settings Panel --- */}
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

            {/* --- Control & Share Panel --- */}
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
    const [mode, setMode] = useState<Mode | null>(null);
    const [appState, setAppState] = useState(initialState);

    // Central state update function that broadcasts to all tabs/windows
    const updateAppState = useCallback((newState) => {
        setAppState(newState);
        broadcastChannel.postMessage(newState);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
        } catch (error) {
            console.error("Could not write to localStorage:", error);
        }
    }, []);

    // Effect for initializing state and handling incoming sync messages
    useEffect(() => {
        // Function to handle state updates from any source
        const handleStateUpdate = (data) => {
            if (data && typeof data.remainingSeconds === 'number') {
                setAppState(data);
            }
        };

        // Listen for messages from other tabs in the same browser
        broadcastChannel.onmessage = (event) => {
            handleStateUpdate(event.data);
        };
        
        // Listen for storage changes from other tabs (more robust)
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === STORAGE_KEY && event.newValue) {
                try {
                    handleStateUpdate(JSON.parse(event.newValue));
                } catch (error) {
                    console.error("Could not parse state from localStorage:", error);
                }
            }
        };
        window.addEventListener('storage', handleStorageChange);

        // --- Initial State Loading Logic ---
        const hash = window.location.hash.slice(1);
        const savedStateJSON = localStorage.getItem(STORAGE_KEY);
        let loadedState = null;
        if (savedStateJSON) {
            try {
                loadedState = JSON.parse(savedStateJSON);
            } catch (e) {
                console.error("Failed to parse saved state.");
            }
        }

        if (hash.startsWith('view')) {
            const params = new URLSearchParams(hash.substring(hash.indexOf('&') + 1));
            const name = params.get('name');
            const time = parseInt(params.get('time') || '0', 10);

            if (name && time > 0) {
                 // A share link was used. Check if we have a more current state in storage.
                if (loadedState && loadedState.meetingName === name && loadedState.totalSeconds === time) {
                    setAppState(loadedState);
                } else {
                    // No matching state in storage, use the URL's data.
                    const newState = {
                        ...initialState,
                        meetingName: name,
                        totalSeconds: time,
                        remainingSeconds: time
                    };
                    setAppState(newState);
                }
                setMode('viewer');
                return; // Initial setup complete for viewer
            }
        }

        // If not a viewer link, restore previous session if it exists
        if(loadedState) {
            setAppState(loadedState);
        }
        
        setMode('select'); // Default mode if no other state is found

        return () => {
            broadcastChannel.onmessage = null;
            window.removeEventListener('storage', handleStorageChange);
        }
    }, []);


    const renderContent = () => {
        if (mode === null) {
            return <div className="loading">Loading...</div>; // Initial loading state
        }

        switch (mode) {
            case 'admin':
                return <AdminDashboard appState={appState} updateAppState={updateAppState} setMode={setMode} />;
            case 'viewer':
                return <ViewerView appState={appState} />;
            case 'select':
            default:
                return <RoleSelection setMode={setMode} />;
        }
    };
    
    // Viewer mode gets a full-screen, immersive view
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
