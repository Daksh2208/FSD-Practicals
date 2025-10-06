# TODO for Automatic Next Question on Time Up Feature

- [x] Backend: Implement per-player question timeout handling in `websocket_helpers.py`
  - Use asyncio tasks to track TIME_PER_QUESTION per question per player
  - On timeout, mark question as answered incorrectly/skipped
  - Automatically send next question to player
- [x] Frontend: Modify `App.jsx`
  - Detect when timer reaches zero
  - Auto-submit empty answer or timeout signal to backend
  - Disable input and show timeout feedback
- [ ] Test end-to-end automatic question progression on time up
- [ ] Verify no regressions in game flow and UI
