const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const {v4: uuidv4} = require('uuid');
const { title } = require('process');
const app = express();
const port = process.env.PORT || 3000;
const DATA_FILE = './tasks.json';

app.use(bodyParser.json());

function readTasks() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (err) {
    return [];
  }
}

function writeTasks(tasks) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2));
}

app.get('/tasks', (req, res) => {
  res.json(readTasks());
});

app.post('/tasks', (req, res) => {
  const tasks = readTasks();
  const newTask = req.body;
  newTask.id = uuidv4();
  tasks.push(newTask);
  writeTasks(tasks);
  res.status(201).json(newTask);
});

app.delete('/tasks/:id', (req, res) => {
  const tasks = readTasks();
  const taskId = req.params.id;
  const newTasks = tasks.filter(task => task.id !== taskId);
  if (newTasks.length === tasks.length) {
    res.status(404).send('Task not found');
  }
    writeTasks(newTasks);
    res.status(204).send();
  
});

app.put('/tasks/:id', (req, res) => {
  const tasks = readTasks();
  const taskId = req.params.id;
  const taskIndex = tasks.findIndex(task => task.id === taskId);
  if (taskIndex === -1) {
    res.status(404).send('Task not found');
  }
  tasks[taskIndex] = {
    ...tasks[taskIndex],
    title: req.body.title !== undefined ? req.body.title : tasks[taskIndex].title,
    completed: req.body.completed !== undefined ? req.body.completed : tasks[taskIndex].completed
  }

  writeTasks(tasks);
  res.json(tasks[taskIndex]);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});