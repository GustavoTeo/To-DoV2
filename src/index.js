const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();
//Esse é o novo
app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

    const user = users.find(user => user.username == username);

    if(!user){
        return response.status(404).send({error:"User not exists"})
    }

    request.user = user;
    return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body
  if(users.some(user => user.username === username)){
      return response.status(400).send({error:"User already exists"})
  }
   let user = {
       id: uuidv4(),
       name,
       username,
       todos:[]
   };
   users.push(user);
   return response.status(201).send(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
    const { title, deadline } = request.body;
    let todo = {
        id: uuidv4(),
        title,
        done:false,
        deadline: new Date(deadline),
        created_at: new Date(),
    }
    user.todos.push(todo)
    return response.status(201).send(todo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  let modifyTodo = user.todos.find(todo => todo.id === id);
  if(!modifyTodo){
      return response.status(404).send({error:"ToDo not found"})
  }

  modifyTodo.title = title;
  modifyTodo.deadline = new Date(deadline);

  return response.send(modifyTodo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  let modifyTodo = user.todos.find(todo => todo.id == id);
  if(!modifyTodo){
      return response.status(404).send({error:"ToDo not found"})
  }
  modifyTodo.done = true;

  return response.send(modifyTodo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  let modifyTodo = user.todos.findIndex(todo => todo.id == id);
  if(modifyTodo === -1){
      return response.status(404).send({error:"ToDo not found"})
  }

  user.todos.splice(modifyTodo, 1)

  return response.status(204).json();
});

module.exports = app;