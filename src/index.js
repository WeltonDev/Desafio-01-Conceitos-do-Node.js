const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(req, res, next) {
  const { username } = req.headers;

  const user = users.find(user => user.username === username);

  if(!user){
    return res.status(404).json({ error: 'Usuário não encontrado!' });
  }

  req.user = user;

  return next();
}

app.post('/users', (req, res) => {
  try {
    const { name, username } = req.body;

    const userExists = users.find(user => user.username === username);

    if(userExists){
      return res.status(400).json({ error: "Username já cadastrado!"});
    }

    const user = {
      id: uuidv4(),
      name,
      username,
      todos: []
    }

    users.push(user);

    return res.status(201).json(user);
  } catch (error) {
    return console.log(error);
  }
});

app.get('/todos', checksExistsUserAccount, (req, res) => {
try {
  const { user } = req;

  return res.json(user.todos);
} catch (error) {
  return console.log(error);
}
});

app.post('/todos', checksExistsUserAccount, (req, res) => {
  try {
    const { user } = req;

    const { title, deadline } = req.body;
  
    const todo = {
      id: uuidv4(),
      title,
      done: false,
      deadline: new Date(deadline),
      created_at: new Date()
    }
  
    user.todos.push(todo);
  
    return res.status(201).json(todo);
  } catch (error) {
   return console.log(error);
  }
});

app.put('/todos/:id', checksExistsUserAccount, (req, res) => {
  try {
    const { user } = req;
    const { title, deadline } = req.body;
    const { id } = req.params;
  
    const todo = user.todos.find(todo => todo.id === id);
  
    if(!todo){
      return res.status(404).json({ error: "To-do não encontrado!" })
    }
  
    todo.title = title;
    todo.deadline = new Date(deadline);
  
    return res.status(200).json(todo);
  } catch (error) {
   return console.log(error);
    
  }
});

app.patch('/todos/:id/done', checksExistsUserAccount, (req, res) => {
try {
  const { user } = req;
  const { id } = req.params;

  const todo = user.todos.find(todo => todo.id === id);

  if(!todo){
    return res.status(404).json({ error: "To-do não encontrado!" });
  }

  todo.done = true;

  return res.status(200).json(todo);
} catch (error) {
  return console.log(error);
}
});

app.delete('/todos/:id', checksExistsUserAccount, (req, res) => {
  try {
    const { user } = req;
    const { id } = req.params;
  
    const todoIndex = user.todos.findIndex(todo => todo.id === id);
  
    if(todoIndex === -1){
      return res.status(404).json({ error: "To-do não encontrado!" });
    }
  
    user.todos.splice(todoIndex, 1);
    
    return res.status(204).json();
  } catch (error) {
    return console.log(error);
  }
});

module.exports = app;