import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import LoginPage from './LoginPage';
import CategoryPage from './CategoryPage';

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = sessionStorage.getItem('user');
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      console.error("Failed to parse user from sessionStorage", e);
      sessionStorage.removeItem('user');
      return null;
    }
  });

  const [ws, setWs] = useState(null);
  const [currentView, setCurrentView] = useState('menu');
  const [gameState, setGameState] = useState({ players: [], question: '', questionIndex: 0, totalQuestions: 5, duration: 30, results: [], winner: null, });
  const [lobbyState, setLobbyState] = useState({ playerCount: 0, maxPlayers: 8 });
  const [answer, setAnswer] = useState('');
  const [answerResult, setAnswerResult] = useState(null);
  const [timer, setTimer] = useState(30);
  const timerRef = useRef(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [message, setMessage] = useState('');
  const [stats, setStats] = useState({});
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  useEffect(() => {
    if (currentView === 'playing') {
      timerRef.current = setInterval(() => { setTimer(t => (t > 0 ? t - 1 : 0)); }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [currentView, gameState.questionIndex]);

  useEffect(() => {
    if (timer === 0 && currentView === 'playing' && !answerResult) {
      // Auto-submit empty answer when time is up
      if (ws) {
        ws.send(JSON.stringify({ type: 'submit_answer', answer: '' }));
      }
    }
  }, [timer, currentView, answerResult, ws]);

  useEffect(() => {
    if (user && user.username) {
      sessionStorage.setItem('user', JSON.stringify(user));
      const websocket = new WebSocket(`ws://localhost:8000/ws/${user.username}`);
      websocket.onopen = () => setConnectionStatus('Connected');
      websocket.onclose = () => setConnectionStatus('Disconnected');
      websocket.onerror = () => setConnectionStatus('Error');
      websocket.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.type === 'stats_update') { setStats(data.stats); return; }
          
          switch (data.type) {
              case 'waiting_update':
                  setCurrentView('waiting');
                  setLobbyState({ playerCount: data.player_count, maxPlayers: data.max_players });
                  break;
              case 'new_question':
                  setCurrentView('playing');
                  setGameState(gs => ({ ...gs, question: data.question, questionIndex: data.question_index, totalQuestions: data.total_questions, duration: data.duration, }));
                  setTimer(data.duration);
                  setAnswer('');
                  setAnswerResult(null);
                  break;
              case 'answer_result':
                  setAnswerResult(data);
                  setTimeout(() => setAnswerResult(null), 1500);
                  break;
              case 'player_finished':
                  setCurrentView('waiting');
                  setMessage(data.message);
                  break;
              case 'game_end':
                  setMessage('');
                  setCurrentView('finished');
                  setGameState(gs => ({ ...gs, results: data.results, winner: data.winner }));
                  
                  const myResult = data.results.find(r => r.username === user.username);

                  if (myResult && myResult.new_total_score !== undefined) {
                      setUser(prevUser => ({ 
                          ...prevUser, 
                          score: myResult.new_total_score 
                      }));
                  }
                  
                  loadLeaderboard();
                  break;
              case 'match_failed':
                  setCurrentView('categories');
                  setMessage(data.message);
                  setTimeout(() => setMessage(''), 3000);
                  break;
          }
      };
      setWs(websocket);
      return () => { websocket.close(); };
    } else {
      sessionStorage.removeItem('user');
    }
  }, [user?.username]);

  useEffect(() => { loadLeaderboard(); loadStats(); }, []);

  const handleLogin = async (credentials) => {
    if(credentials.password === "") {
        const response = await fetch('http://localhost:8000/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({username: credentials.username, password: ''})});
        if (response.ok) { const data = await response.json(); setUser(data.user); }
        return;
    }
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(credentials) });
      if (response.ok) { const data = await response.json(); setUser(data.user); } else { const errorData = await response.json(); setMessage(errorData.detail || 'Login failed'); }
    } catch (error) { setMessage('Connection error'); } finally { setIsLoading(false); }
  };
  const handleSignup = async (userData) => { setIsLoading(true); try { const response = await fetch('http://localhost:8000/api/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(userData) }); if (response.status === 201) { const data = await response.json(); setUser(data.user); } else { const errorData = await response.json(); setMessage(errorData.detail || 'Signup failed'); } } catch (error) { setMessage('Connection error'); } finally { setIsLoading(false); } };
  const findMatch = () => setCurrentView('categories');
  const handleCategorySelect = (category) => { setSelectedCategory(category); if (ws) ws.send(JSON.stringify({ type: 'find_match', category: category.id })); };
  const handleBackToHome = () => { setCurrentView('menu'); setMessage(''); };
  const submitAnswer = (e) => { e.preventDefault(); if (ws && answer.trim()) { ws.send(JSON.stringify({ type: 'submit_answer', answer: answer.trim() })); setAnswer(''); } };
  const cancelSearch = () => { if (ws) ws.send(JSON.stringify({ type: 'cancel_search' })); setCurrentView('categories'); setMessage(''); };
  const loadLeaderboard = async () => { try { const response = await fetch('http://localhost:8000/api/leaderboard'); if (response.ok) { const data = await response.json(); setLeaderboard(data); } } catch (error) { console.error('Leaderboard error:', error); } };
  const loadStats = async () => { try { const response = await fetch('http://localhost:8000/api/stats'); if (response.ok) { const data = await response.json(); setStats(data); } } catch (error) { console.error('Stats error:', error); } };
  const logout = () => { setUser(null); };

  if (!user) return ( <LoginPage isLogin={isLogin} setIsLogin={setIsLogin} onLogin={handleLogin} onSignup={handleSignup} message={message} isLoading={isLoading} /> );
  if (currentView === 'categories') return ( <CategoryPage onSelectCategory={handleCategorySelect} onBackToHome={handleBackToHome} user={user} /> );
  
  return (
    <div className="app">
        <div className="container">
          <div className="app-header"><h1>🧠 MindMaze</h1><button className="logout-btn" onClick={logout}>Logout</button></div>
          <div className="user-info"><p>Welcome, <strong>{user.username}</strong>!</p><p>Score: <strong>{user.score || 0}</strong> points</p><p className={`status ${connectionStatus.toLowerCase()}`}>{connectionStatus}</p></div>
          {message && currentView !== 'waiting' && <div className="message-banner">{message}</div>}
          {currentView === 'menu' && ( <div className="menu"> <div className="menu-actions"><button className="play-button" onClick={findMatch}>🎮 Find Match</button><button className="refresh-button" onClick={loadLeaderboard}>🔄 Refresh Leaderboard</button></div> <div className="stats"><h3>📊 Live Stats</h3><div className="stats-grid"><div className="stat-item"><span className="stat-label">Total Players:</span><span className="stat-value">{stats.total_users || 0}</span></div><div className="stat-item"><span className="stat-label">Active Games:</span><span className="stat-value">{stats.active_games || 0}</span></div><div className="stat-item"><span className="stat-label">Online Now:</span><span className="stat-value">{stats.connected_players || 0}</span></div></div></div> <div className="leaderboard"><h3>🏆 Leaderboard</h3>{leaderboard.length === 0 ? (<p className="no-players">No players yet.</p>) : (<div className="leaderboard-list">{leaderboard.map((player, index) => (<div key={index} className="leaderboard-item"><span className="rank">#{index + 1}</span><span className="username">{player.username}</span><span className="score">{player.score || 0} pts</span></div>))}</div>)}</div> </div> )}
          {currentView === 'waiting' && ( <div className="waiting"> {message ? ( <> <h2>🏁 Finished!</h2> <div className="spinner">⟳</div> <p>{message}</p> </> ) : ( <> <h2>🔍 Waiting for Players...</h2> <div className="spinner">⟳</div> <h3>Players in Lobby: {lobbyState.playerCount} / {lobbyState.maxPlayers}</h3> <p>Starting in 10 seconds or when the room is full...</p> <button className="cancel-button" onClick={cancelSearch}>Cancel</button> </> )} </div> )}
          {currentView === 'playing' && ( <div className="game"> <h2>Question {gameState.questionIndex} / {gameState.totalQuestions}</h2> <div className="timer-bar-container"><div className="timer-bar" style={{ width: `${(timer / gameState.duration) * 100}%`, transition: 'width 1s linear' }}></div></div> <div className="timer">Time Left: <strong>{timer}s</strong></div> <div className="puzzle-container"> <h3 className="puzzle-question">{gameState.question}</h3> <form onSubmit={submitAnswer} className="answer-form"> <input type="text" value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Type your answer..." className="answer-input" autoFocus disabled={!!answerResult || timer === 0} /> <button type="submit" className="submit-answer-btn" disabled={!!answerResult || timer === 0}>Submit</button> </form> {answerResult && (<div className={`answer-feedback ${answerResult.correct ? 'correct' : 'incorrect'}`}>{answerResult.message}</div>)} </div> </div> )}
          
          {/* --- MODIFICATION START --- */}
          {currentView === 'finished' && (
              <div className="finished">
                  <h2>🎉 Game Over!</h2>
                  <h3>Winner: <strong className="winner-name">{gameState.winner}</strong></h3>
                  <div className="leaderboard">
                      <h4>Final Scores:</h4>
                      <div className="leaderboard-list">
                          {gameState.results.map((player, index) => (
                              <div key={player.username} className={`leaderboard-item ${player.username === gameState.winner ? 'winner' : ''}`}>
                                  <span className="rank">#{index + 1}</span>
                                  <span className="username">{player.username}</span>
                                  <span className="score">Score: {player.score} | Time: {player.time}s</span>
                              </div>
                          ))}
                      </div>
                  </div>
                  {/* Replaced the single "Play Again" button with two new options */}
                  <div className="finished-actions">
                    <button className="play-button" onClick={() => { setCurrentView('categories'); setMessage(''); }}>
                      🎮 Play Another Game
                    </button>
                    <button className="secondary-button" onClick={() => { setCurrentView('menu'); setMessage(''); }}>
                      🏠 Back to Home
                    </button>
                  </div>
              </div>
          )}
          {/* --- MODIFICATION END --- */}
          
        </div>
      </div>
  );
}
export default App;