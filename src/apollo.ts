import { gql, ApolloClient, InMemoryCache } from '@apollo/client';

export const client = new ApolloClient({
  uri:
    location.protocol !== 'https'
      ? 'http://localhost:3001'
      : 'https://grapql-todo-001.onrender.com',
  cache: new InMemoryCache(),
});

export const LOGIN_USER_AND_GET_TODOS = gql`
  mutation login($email: String!) {
    loginUser(email: $email) {
      name
      id
      email
      todos {
        text
        createdAt
        updatedAt
        completed
        id
        owner {
          name
          id
          email
        }
      }
    }
  }
`;

export const GET_USER_TODOS = gql`
  query userTodos($userId: Int!) {
    todosByUser(userId: $userId) {
      text
      createdAt
      updatedAt
      completed
      id
      owner {
        name
        id
        email
      }
    }
  }
`;

export const CREATE_USER = gql`
  mutation singUp($data: CreateUserInput!) {
    createUser(data: $data) {
      name
      email
      id
      todos {
        text
        createdAt
        updatedAt
        completed
        id
        owner {
          name
          id
          email
        }
      }
    }
  }
`;

export const CREATE_TODO = gql`
  mutation createTodo($data: CreateTodoInput!) {
    createTodo(data: $data) {
      text
      createdAt
      updatedAt
      completed
      id
      owner {
        name
        id
        email
      }
    }
  }
`;

export const UPDATE_TODO = gql`
  mutation updateTodo($updateTodoId: Int!, $data: UpdateTodoInput!) {
    updateTodo(id: $updateTodoId, data: $data) {
      text
      createdAt
      updatedAt
      completed
      id
      owner {
        name
        id
        email
      }
    }
  }
`;

export const DELETE_TODO = gql`
  mutation deleteTodo($deleteTodoId: Int!) {
    deleteTodo(id: $deleteTodoId) {
      id
      completed
    }
  }
`;

export const GET_TODOS = gql`
  query getTodos {
    todos {
      id
      text
      completed
      owner {
        email
      }
    }
  }
`;
