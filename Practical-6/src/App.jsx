import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { FaEdit, FaTrash, FaMicrophone, FaMicrophoneSlash, FaPlus, FaStar, FaClock, FaChartLine, FaRocket, FaFire, FaMagic, FaGem, FaLightbulb, FaBolt, FaSearch, FaCalendarAlt, FaBrain, FaInfinity, FaBullseye } from 'react-icons/fa';

const PRIORITY_LEVELS = {
  low: { color: '#10b981', label: 'Low', icon: FaLightbulb },
  medium: { color: '#f59e0b', label: 'Medium', icon: FaBullseye },
  high: { color: '#ef4444', label: 'High', icon: FaFire },
  urgent: { color: '#dc2626', label: 'Urgent', icon: FaBolt }
};

const CATEGORIES = [
  { id: 'work', label: 'Work', color: '#3b82f6', icon: '💼' },
  { id: 'personal', label: 'Personal', color: '#10b981', icon: '🌟' },
  { id: 'health', label: 'Health', color: '#f59e0b', icon: '💪' },
  { id: 'learning', label: 'Learning', color: '#8b5cf6', icon: '📚' },
  { id: 'finance', label: 'Finance', color: '#059669', icon: '💰' },
  { id: 'creative', label: 'Creative', color: '#ec4899', icon: '🎨' }
];

function App() {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [editText, setEditText] = useState('');
  const [editPriority, setEditPriority] = useState('medium');
  const [editCategory, setEditCategory] = useState('personal');
  const [editDueDate, setEditDueDate] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [priority, setPriority] = useState('medium');
  const [category, setCategory] = useState('personal');
  const [dueDate, setDueDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('created');
  const [showCompleted, setShowCompleted] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [showStats, setShowStats] = useState(false);
  const [productivity, setProductivity] = useState({ streak: 0, points: 0, level: 1 });
  
  const recognitionRef = useRef(null);
  const particlesRef = useRef([]);
  const canvasRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (!recognitionRef.current && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
    }
  }, []);

  // Particle system for celebrations
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particlesRef.current = particlesRef.current.filter(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.1;
        particle.life -= particle.decay;
        
        ctx.save();
        ctx.globalAlpha = particle.life;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        
        return particle.life > 0;
      });

      requestAnimationFrame(animate);
    };
    
    animate();
  }, []);

  // AI-powered task suggestions
  const generateAiSuggestions = useCallback((taskText) => {
    const suggestions = [
      'Break this into smaller subtasks',
      'Set a specific deadline',
      'Add a reward for completion',
      'Schedule focused time blocks',
      'Find an accountability partner',
      'Identify potential obstacles'
    ];
    return suggestions.slice(0, 3);
  }, []);

  // Smart task analysis
  const analyzeTask = useCallback((text) => {
    const urgentKeywords = ['urgent', 'asap', 'immediately', 'deadline', 'due'];
    const workKeywords = ['meeting', 'project', 'report', 'email', 'presentation'];
    const healthKeywords = ['exercise', 'doctor', 'workout', 'meditation', 'health'];
    
    let suggestedPriority = 'medium';
    let suggestedCategory = 'personal';
    
    const lowerText = text.toLowerCase();
    
    if (urgentKeywords.some(keyword => lowerText.includes(keyword))) {
      suggestedPriority = 'urgent';
    }
    
    if (workKeywords.some(keyword => lowerText.includes(keyword))) {
      suggestedCategory = 'work';
    } else if (healthKeywords.some(keyword => lowerText.includes(keyword))) {
      suggestedCategory = 'health';
    }
    
    return { suggestedPriority, suggestedCategory };
  }, []);

  const handleMicClick = () => {
    const recognition = recognitionRef.current;
    if (!recognition) {
      alert('Speech Recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      recognition.stop();
      return;
    }

    setIsListening(true);
    recognition.start();

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';
      for (let i = 0; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      
      const currentText = finalTranscript || interimTranscript;
      setTask(currentText);
      
      if (finalTranscript) {
        const analysis = analyzeTask(finalTranscript);
        setPriority(analysis.suggestedPriority);
        setCategory(analysis.suggestedCategory);
        setAiSuggestions(generateAiSuggestions(finalTranscript));
        setIsListening(false);
      }
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
  };

  const addTask = (e) => {
    e.preventDefault();
    if (task.trim() === '') return;
    
    const newTask = {
      id: Date.now(),
      text: task,
      completed: false,
      priority,
      category,
      dueDate: dueDate || null,
      createdAt: new Date(),
      completedAt: null,
      streak: 0,
      points: getPriorityPoints(priority)
    };
    
    setTasks(prev => [...prev, newTask]);
    setTask('');
    setDueDate('');
    setAiSuggestions([]);
    
    // Celebration particles
    for (let i = 0; i < 20; i++) {
      particlesRef.current.push({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        vx: (Math.random() - 0.5) * 15,
        vy: (Math.random() - 0.5) * 15,
        life: 1,
        decay: 0.015,
        size: Math.random() * 4 + 2,
        color: CATEGORIES.find(c => c.id === category)?.color || '#3b82f6'
      });
    }
  };

  const getPriorityPoints = (priority) => {
    const points = { low: 10, medium: 20, high: 50, urgent: 100 };
    return points[priority] || 10;
  };

  const toggleComplete = (id) => {
    const taskToUpdate = tasks.find(t => t.id === id);
    if (!taskToUpdate) return;

    setTasks(prev =>
      prev.map(t => {
        if (t.id === id) {
          const newCompleted = !t.completed;
          if (newCompleted && !t.completed) {
            // Task completed - add points and celebration
            setProductivity(p => ({
              ...p,
              points: p.points + t.points,
              streak: p.streak + 1,
              level: Math.floor((p.points + t.points) / 100) + 1
            }));
            
            // Epic celebration particles
            for (let i = 0; i < 50; i++) {
              particlesRef.current.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                vx: (Math.random() - 0.5) * 20,
                vy: (Math.random() - 0.5) * 20,
                life: 1,
                decay: 0.01,
                size: Math.random() * 8 + 3,
                color: `hsl(${Math.random() * 60 + 300}, 100%, 60%)`
              });
            }
          }
          return { ...t, completed: newCompleted, completedAt: newCompleted ? new Date() : null };
        }
        return t;
      })
    );
  };

  const deleteTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    
    // Destruction particles
    for (let i = 0; i < 15; i++) {
      particlesRef.current.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 0.5) * 12,
        life: 1,
        decay: 0.03,
        size: Math.random() * 3 + 1,
        color: '#ef4444'
      });
    }
  };

  const startEditing = (task) => {
    setIsEditing(true);
    setCurrentTask(task);
    setEditText(task.text);
    setEditPriority(task.priority);
    setEditCategory(task.category);
    setEditDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
  };

  const submitEdit = (e) => {
    e.preventDefault();
    if (!editText.trim()) return;
    
    setTasks(prev =>
      prev.map(t =>
        t.id === currentTask.id
          ? { ...t, text: editText, priority: editPriority, category: editCategory, dueDate: editDueDate || null }
          : t
      )
    );
    
    setIsEditing(false);
    setCurrentTask(null);
    setEditText('');
  };

  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks.filter(task => {
      const matchesSearch = task.text.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
      const matchesCategory = filterCategory === 'all' || task.category === filterCategory;
      const matchesCompleted = showCompleted || !task.completed;
      
      return matchesSearch && matchesPriority && matchesCategory && matchesCompleted;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'dueDate':
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate) - new Date(b.dueDate);
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return b.createdAt - a.createdAt;
      }
    });

    return filtered;
  }, [tasks, searchTerm, filterPriority, filterCategory, sortBy, showCompleted]);

  const stats = useMemo(() => {
    const completed = tasks.filter(t => t.completed).length;
    const total = tasks.length;
    const completionRate = total > 0 ? (completed / total * 100).toFixed(1) : 0;
    const totalPoints = tasks.filter(t => t.completed).reduce((sum, t) => sum + t.points, 0);
    
    return {
      completed,
      total,
      completionRate,
      totalPoints,
      overdue: tasks.filter(t => !t.completed && t.dueDate && new Date(t.dueDate) < new Date()).length
    };
  }, [tasks]);

  return (
    <div className={`app ${darkMode ? 'dark' : 'light'}`}>
      <canvas 
        ref={canvasRef} 
        className="particles-canvas"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          zIndex: 1000
        }}
      />
      
      <div className="container">
        {/* Header */}
        <header className="header">
          <div className="header-content">
            <h1 className="title">
              <FaInfinity className="title-icon" />
              Infinity Tasks
              <FaGem className="gem-icon" />
            </h1>
            <div className="productivity-display">
              <div className="level-badge">
                <FaRocket />
                Level {productivity.level}
              </div>
              <div className="points-badge">
                <FaStar />
                {productivity.points} pts
              </div>
              <div className="streak-badge">
                <FaFire />
                {productivity.streak} streak
              </div>
            </div>
          </div>
          
          <div className="controls">
            <button 
              className={`control-btn ${darkMode ? 'active' : ''}`}
              onClick={() => setDarkMode(!darkMode)}
            >
              🌓
            </button>
            <button 
              className={`control-btn ${showStats ? 'active' : ''}`}
              onClick={() => setShowStats(!showStats)}
            >
              <FaChartLine />
            </button>
          </div>
        </header>

        {/* Stats Panel */}
        {showStats && (
          <div className="stats-panel">
            <div className="stat-card">
              <FaBullseye />
              <div>
                <div className="stat-number">{stats.completed}/{stats.total}</div>
                <div className="stat-label">Completed</div>
              </div>
            </div>
            <div className="stat-card">
              <FaChartLine />
              <div>
                <div className="stat-number">{stats.completionRate}%</div>
                <div className="stat-label">Success Rate</div>
              </div>
            </div>
            <div className="stat-card">
              <FaStar />
              <div>
                <div className="stat-number">{stats.totalPoints}</div>
                <div className="stat-label">Total Points</div>
              </div>
            </div>
            <div className="stat-card">
              <FaClock />
              <div>
                <div className="stat-number">{stats.overdue}</div>
                <div className="stat-label">Overdue</div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="filters-section">
          <div className="search-bar">
            <FaSearch />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-controls">
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Priorities</option>
              {Object.entries(PRIORITY_LEVELS).map(([key, { label }]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.icon} {cat.label}</option>
              ))}
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="created">Sort by Created</option>
              <option value="priority">Sort by Priority</option>
              <option value="dueDate">Sort by Due Date</option>
              <option value="category">Sort by Category</option>
            </select>
            
            <button
              className={`toggle-btn ${showCompleted ? 'active' : ''}`}
              onClick={() => setShowCompleted(!showCompleted)}
            >
              Show Completed
            </button>
          </div>
        </div>

        {/* Task Form */}
        {!isEditing && (
          <form onSubmit={addTask} className="task-form">
            <div className="input-group">
              <div className="main-input-container">
                <input
                  type="text"
                  className="main-input"
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                  placeholder="What needs to be conquered today?"
                />
                <button
                  type="button"
                  className={`mic-btn ${isListening ? 'listening' : ''}`}
                  onClick={handleMicClick}
                >
                  {isListening ? <FaMicrophoneSlash /> : <FaMicrophone />}
                  {isListening && <div className="pulse-ring"></div>}
                </button>
              </div>
              
              <div className="form-controls">
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="priority-select"
                >
                  {Object.entries(PRIORITY_LEVELS).map(([key, { label }]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
                
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="category-select"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.label}</option>
                  ))}
                </select>
                
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="date-input"
                />
                
                <button type="submit" className="add-btn">
                  <FaPlus />
                  <span>Add Task</span>
                </button>
              </div>
            </div>
            
            {aiSuggestions.length > 0 && (
              <div className="ai-suggestions">
                <FaBrain />
                <div className="suggestions-list">
                  {aiSuggestions.map((suggestion, index) => (
                    <div key={index} className="suggestion">{suggestion}</div>
                  ))}
                </div>
              </div>
            )}
          </form>
        )}

        {/* Edit Form */}
        {isEditing && (
          <form onSubmit={submitEdit} className="edit-form">
            <div className="input-group">
              <input
                type="text"
                className="main-input"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                placeholder="Update your task..."
                autoFocus
              />
              
              <div className="form-controls">
                <select
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value)}
                  className="priority-select"
                >
                  {Object.entries(PRIORITY_LEVELS).map(([key, { label }]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
                
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="category-select"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.label}</option>
                  ))}
                </select>
                
                <input
                  type="date"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  className="date-input"
                />
                
                <button type="submit" className="update-btn">
                  <FaMagic />
                  Update
                </button>
                
                <button 
                  type="button" 
                  onClick={() => setIsEditing(false)}
                  className="cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Tasks List */}
        <div className="tasks-container">
          {filteredAndSortedTasks.map((task) => {
            const priorityConfig = PRIORITY_LEVELS[task.priority];
            const categoryConfig = CATEGORIES.find(c => c.id === task.category);
            const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;
            
            return (
              <div
                key={task.id}
                className={`task-card ${task.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''} priority-${task.priority}`}
                style={{ '--priority-color': priorityConfig.color }}
              >
                <div className="task-main">
                  <div 
                    className={`task-checkbox ${task.completed ? 'checked' : ''}`}
                    onClick={() => toggleComplete(task.id)}
                  >
                    {task.completed && <span className="checkmark">✓</span>}
                  </div>
                  
                  <div className="task-content">
                    <p className={`task-text ${task.completed ? 'completed-text' : ''}`}>
                      {task.text}
                    </p>
                    
                    <div className="task-meta">
                      <div className="task-badges">
                        <span 
                          className="priority-badge"
                          style={{ backgroundColor: priorityConfig.color }}
                        >
                          <priorityConfig.icon />
                          {priorityConfig.label}
                        </span>
                        
                        <span 
                          className="category-badge"
                          style={{ backgroundColor: categoryConfig.color }}
                        >
                          {categoryConfig.icon} {categoryConfig.label}
                        </span>
                        
                        {task.dueDate && (
                          <span className={`due-badge ${isOverdue ? 'overdue' : ''}`}>
                            <FaCalendarAlt />
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                        
                        <span className="points-badge">
                          <FaStar />
                          {task.points} pts
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="task-actions">
                  <button 
                    className="action-btn edit-btn"
                    onClick={() => startEditing(task)}
                  >
                    <FaEdit />
                  </button>
                  <button 
                    className="action-btn delete-btn"
                    onClick={() => deleteTask(task.id)}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredAndSortedTasks.length === 0 && (
          <div className="empty-state">
            <FaRocket className="empty-icon" />
            <h3>Ready to conquer the world?</h3>
            <p>Add your first task and start building your empire!</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .app {
          min-height: 100vh;
          transition: all 0.3s ease;
          position: relative;
          overflow-x: hidden;
        }

        .app.dark {
          background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
          color: #ffffff;
        }

        .app.light {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #333333;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
          position: relative;
          z-index: 10;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .header-content {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .title {
          display: flex;
          align-items: center;
          gap: 1rem;
          font-size: 3rem;
          font-weight: 900;
          background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57);
          background-size: 400% 400%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: gradientShift 4s ease-in-out infinite;
          text-shadow: 0 0 30px rgba(255, 255, 255, 0.1);
        }

        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .title-icon, .gem-icon {
          font-size: 2rem;
          animation: float 3s ease-in-out infinite;
        }

        .gem-icon {
          animation-delay: 1.5s;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        .productivity-display {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .level-badge, .points-badge, .streak-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 25px;
          font-weight: bold;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .controls {
          display: flex;
          gap: 1rem;
        }

        .control-btn {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: inherit;
          padding: 0.75rem;
          border-radius: 15px;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .control-btn:hover, .control-btn.active {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        }

        .stats-panel {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          background: rgba(255, 255, 255, 0.15);
        }

        .stat-card svg {
          font-size: 2rem;
          opacity: 0.8;
        }

        .stat-number {
          font-size: 2rem;
          font-weight: bold;
          line-height: 1;
        }

        .stat-label {
          font-size: 0.875rem;
          opacity: 0.7;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .filters-section {
          margin-bottom: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .search-bar {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-bar svg {
          position: absolute;
          left: 1rem;
          opacity: 0.5;
          z-index: 1;
        }

        .search-bar input {
          width: 100%;
          padding: 1rem 1rem 1rem 3rem;
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: 25px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          color: inherit;
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .search-bar input:focus {
          outline: none;
          border-color: rgba(255, 255, 255, 0.4);
          background: rgba(255, 255, 255, 0.15);
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }

        .filter-controls {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          align-items: center;
        }

        .filter-select {
          padding: 0.75rem 1rem;
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: 15px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          color: inherit;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .filter-select:focus {
          outline: none;
          border-color: rgba(255, 255, 255, 0.4);
          transform: translateY(-2px);
        }

        .toggle-btn {
          padding: 0.75rem 1.5rem;
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: 15px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          color: inherit;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 500;
        }

        .toggle-btn:hover, .toggle-btn.active {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        }

        .task-form, .edit-form {
          margin-bottom: 2rem;
          padding: 2rem;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: 25px;
          animation: slideIn 0.5s ease-out;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .main-input-container {
          position: relative;
          display: flex;
          align-items: center;
        }

        .main-input {
          flex: 1;
          padding: 1.25rem 5rem 1.25rem 1.5rem;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(15px);
          color: inherit;
          font-size: 1.125rem;
          transition: all 0.3s ease;
        }

        .main-input:focus {
          outline: none;
          border-color: rgba(255, 255, 255, 0.5);
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-3px);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
        }

        .main-input::placeholder {
          color: rgba(255, 255, 255, 0.6);
        }

        .mic-btn {
          position: absolute;
          right: 1rem;
          background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
          border: none;
          color: white;
          padding: 0.75rem;
          border-radius: 15px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
        }

        .mic-btn:hover {
          transform: scale(1.1);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        }

        .mic-btn.listening {
          background: linear-gradient(45deg, #ff4757, #ff3742);
          animation: recordPulse 1s infinite;
        }

        @keyframes recordPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        .pulse-ring {
          position: absolute;
          border: 2px solid rgba(255, 255, 255, 0.5);
          border-radius: 50%;
          animation: pulseRing 2s infinite;
        }

        @keyframes pulseRing {
          0% {
            width: 100%;
            height: 100%;
            opacity: 1;
          }
          100% {
            width: 200%;
            height: 200%;
            opacity: 0;
          }
        }

        .form-controls {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          align-items: center;
        }

        .priority-select, .category-select, .date-input {
          padding: 0.875rem 1rem;
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: 15px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          color: inherit;
          transition: all 0.3s ease;
        }

        .priority-select:focus, .category-select:focus, .date-input:focus {
          outline: none;
          border-color: rgba(255, 255, 255, 0.4);
          transform: translateY(-2px);
        }

        .add-btn, .update-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 2rem;
          background: linear-gradient(45deg, #4ecdc4, #44a08d);
          border: none;
          border-radius: 20px;
          color: white;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 1rem;
        }

        .add-btn:hover, .update-btn:hover {
          transform: translateY(-3px) scale(1.05);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
        }

        .cancel-btn {
          padding: 1rem 2rem;
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 20px;
          color: inherit;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .cancel-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
        }

        .ai-suggestions {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: rgba(138, 92, 246, 0.15);
          border: 2px solid rgba(138, 92, 246, 0.3);
          border-radius: 15px;
          backdrop-filter: blur(10px);
        }

        .ai-suggestions svg {
          font-size: 1.5rem;
          color: #8b5cf6;
        }

        .suggestions-list {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .suggestion {
          padding: 0.5rem 1rem;
          background: rgba(138, 92, 246, 0.2);
          border-radius: 20px;
          font-size: 0.875rem;
          border: 1px solid rgba(138, 92, 246, 0.3);
        }

        .tasks-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .task-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          transition: all 0.4s ease;
          animation: taskSlideIn 0.5s ease-out;
          position: relative;
          overflow: hidden;
        }

        .task-card::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 5px;
          background: var(--priority-color);
          border-radius: 0 5px 5px 0;
        }

        @keyframes taskSlideIn {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .task-card:hover {
          transform: translateY(-5px) scale(1.02);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          border-color: rgba(255, 255, 255, 0.4);
        }

        .task-card.completed {
          opacity: 0.7;
          transform: scale(0.98);
        }

        .task-card.overdue {
          border-color: #ef4444;
          box-shadow: 0 0 20px rgba(239, 68, 68, 0.3);
        }

        .task-main {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex: 1;
        }

        .task-checkbox {
          width: 2rem;
          height: 2rem;
          border: 2px solid rgba(255, 255, 255, 0.4);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          background: rgba(255, 255, 255, 0.1);
        }

        .task-checkbox:hover {
          transform: scale(1.1);
          border-color: rgba(255, 255, 255, 0.6);
        }

        .task-checkbox.checked {
          background: linear-gradient(45deg, #4ecdc4, #44a08d);
          border-color: #4ecdc4;
          animation: checkBounce 0.4s ease-out;
        }

        @keyframes checkBounce {
          0% { transform: scale(0.5); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }

        .checkmark {
          color: white;
          font-weight: bold;
          font-size: 1.25rem;
        }

        .task-content {
          flex: 1;
        }

        .task-text {
          margin: 0 0 0.75rem 0;
          font-size: 1.125rem;
          font-weight: 500;
          line-height: 1.4;
        }

        .task-text.completed-text {
          text-decoration: line-through;
          opacity: 0.6;
        }

        .task-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .task-badges {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .priority-badge, .category-badge, .due-badge, .points-badge {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.25rem 0.75rem;
          border-radius: 15px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .priority-badge {
          color: white;
        }

        .category-badge {
          color: white;
        }

        .due-badge {
          background: rgba(59, 130, 246, 0.8);
          color: white;
        }

        .due-badge.overdue {
          background: rgba(239, 68, 68, 0.8);
          animation: urgentBlink 2s infinite;
        }

        @keyframes urgentBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }

        .points-badge {
          background: rgba(245, 158, 11, 0.8);
          color: white;
        }

        .task-actions {
          display: flex;
          gap: 0.5rem;
        }

        .action-btn {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: inherit;
          padding: 0.75rem;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .action-btn:hover {
          transform: translateY(-2px) scale(1.1);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
        }

        .edit-btn:hover {
          background: rgba(59, 130, 246, 0.3);
          border-color: #3b82f6;
        }

        .delete-btn:hover {
          background: rgba(239, 68, 68, 0.3);
          border-color: #ef4444;
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          opacity: 0.7;
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
          opacity: 0.5;
          animation: float 3s ease-in-out infinite;
        }

        .empty-state h3 {
          font-size: 2rem;
          margin-bottom: 0.5rem;
          font-weight: 700;
        }

        .empty-state p {
          font-size: 1.125rem;
          opacity: 0.8;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .container {
            padding: 1rem;
          }

          .title {
            font-size: 2rem;
          }

          .header {
            flex-direction: column;
            gap: 1rem;
          }

          .productivity-display {
            justify-content: center;
          }

          .filter-controls {
            flex-direction: column;
            align-items: stretch;
          }

          .form-controls {
            flex-direction: column;
            align-items: stretch;
          }

          .task-card {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
          }

          .task-main {
            align-items: flex-start;
          }

          .task-actions {
            justify-content: flex-end;
          }

          .stats-panel {
            grid-template-columns: 1fr;
          }
        }

        /* Dark/Light mode specific styles */
        .app.dark .filter-select option,
        .app.dark .priority-select option,
        .app.dark .category-select option {
          background: #1a1a2e;
          color: white;
        }

        .app.light .filter-select option,
        .app.light .priority-select option,
        .app.light .category-select option {
          background: white;
          color: #333;
        }

        /* Advanced animations */
        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        .task-card.completed::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.2),
            transparent
          );
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}

export default App;