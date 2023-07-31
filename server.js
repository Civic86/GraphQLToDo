const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');

// 初期サンプルデータ
const todoList = [
  { id: 1, text: 'Buy groceries', done: false },
  { id: 2, text: 'Walk the dog', done: true },
  { id: 3, text: 'Do laundry', done: false },
];

// GraphQLスキーマ
const schema = buildSchema(`
  type Todo {
    id: ID!
    text: String!
    done: Boolean!
  }

  type Query {
    getTodoList: [Todo!]!
    getTodoById(id: ID!): Todo
    getTodosByIds(ids: [ID!]!): [Todo!]!
  }

  type Mutation {
    createTodo(text: String!): Todo
    updateTodoDone(id: ID!, done: Boolean!): Todo
    deleteTodoById(id: ID!): Boolean
  }
`);

// リゾルバー関数

//query
const root = {
  getTodoList: () => todoList,
  getTodoById: ({ id }) => todoList.find(todo => todo.id === parseInt(id)),
  getTodosByIds: ({ ids }) => todoList.filter(todo => ids.includes(todo.id.toString())),
  createTodo: ({ text }) => {
    const newTodo = {
      id: todoList.length + 1,
      text: text,
      done: false,
    };
    todoList.push(newTodo);
    return newTodo;
  },

  //mutation
  updateTodoDone: ({ id, done }) => {
    const todo = todoList.find(todo => todo.id === parseInt(id));
    if (todo) {
      todo.done = done;
      return todo;
    }
    return null;
  },
  deleteTodoById: ({ id }) => {
    const index = todoList.findIndex(todo => todo.id === parseInt(id));
    if (index !== -1) {
      todoList.splice(index, 1);
      return true;
    }
    return false;
  },
};

// Expressアプリのセットアップ
const app = express();
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));

// サーバーを起動
app.listen(4000, () => {
  console.log('GraphQLサーバーが http://localhost:4000/graphql で起動しました');
});
