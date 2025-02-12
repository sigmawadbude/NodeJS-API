const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const {v4: uuidv4} = require('uuid');
const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

const db = new sqlite3.Database('./tasks.db', (err) => {
  if (err) {
    console.error('Error opening database ' + err.message);
  } else {
    db.run('CREATE TABLE IF NOT EXISTS tasks (id TEXT PRIMARY KEY, title TEXT NOT NULL, completed BOOLEAN)', (err) => {
      if (err) {
        console.error('Error creating table ' + err.message);
      }
    });
  }
})

// remove
function readTasks() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (err) {
    return [];
  }
}
// remove
function writeTasks(tasks) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2));
}

app.get('/tasks', (req, res) => {
  db.all('SELECT * FROM tasks', (err, tasks) => {
    if(err) return res.status(500).json({error: err.message});

    res.json(tasks);
  })
});

app.post('/tasks', (req, res) => {
  const {title, completed} = req.body;
  const newId = uuidv4();
  db.run('INSERT INTO tasks (id, title, completed) VALUES (?, ?, ?)', [newId, title, completed], (err) => {
    if(err) return res.status(500).json({error: err.message});

    res.status(201).json({id: newId, title, completed});
  });
});

app.delete('/tasks/:id', (req, res) => {
  const taskId = req.params.id;
  db.run('DELETE FROM tasks WHERE id = ?', [taskId], (err) => {
    if(err) return res.status(500).json({error: err.message});
    if(this.changes === 0) return res.status(404).send('Task not found');

    res.status(204).send();
  });
  
});

app.put('/tasks/:id', (req, res) => {
  const taskId = req.params.id;
  const {title, completed} = req.body;
  
  db.run('UPDATE tasks SET title = COALESCE(?, title), completed = COALESCE(?, completed) WHERE id = ?', [title, completed, taskId], (err) => {
    if(err) return res.status(500).json({error: err.message});
    if(this.changes === 0) return res.status(404).send('Task not found');

    res.json({id: taskId, title, completed});
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});