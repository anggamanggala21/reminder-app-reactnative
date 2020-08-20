import Realm from 'realm'

export const TODO_SCHEMA = 'Todo'

export const TodoSchema = {
    name: TODO_SCHEMA,
    primaryKey: '_id',
    properties: {
        _id: 'string',
        title: { type: 'string', indexed: true },
        description: { type: 'string', indexed: true },
        reminderDate: { type: 'date' },
        isComplete: { type: 'bool', indexed: true, default: false },
        createdAt: { type: 'date'},
    }
}

const databaseOptions = {
    path: 'TodoApp.realm',
    schema: [TodoSchema]    
}

export const getAllTodo = () => new Promise((resolve, reject) => {
    Realm.open(databaseOptions).then(realm => {
        let todos = realm.objects(TODO_SCHEMA).sorted('createdAt', true)
        resolve(todos)
    }).catch((err) => reject(err))
})

export const insertTodo = newTodo => new Promise((resolve, reject) => {
    Realm.open(databaseOptions).then(realm => {
        realm.write(() => {
            realm.create(TODO_SCHEMA, newTodo)
            resolve(newTodo)
        })
    }).catch((err) => reject(err))
})

export const deleteAllTodo = () => new Promise((resolve, reject) => {
    Realm.open(databaseOptions).then(realm => {
        realm.write(() => {
            let todos = realm.objects(TODO_SCHEMA)
            realm.delete(todos)
            resolve()
        })
    }).catch((err) => reject(err))
})

export const deleteTodoById = todoId => new Promise((resolve, reject) => {
    Realm.open(databaseOptions).then(realm => {
        realm.write(() => {            
            let todo = realm.objectForPrimaryKey(TODO_SCHEMA, todoId)
            console.log(todo)
            realm.delete(todo)            
            resolve()
        })
    }).catch((err) => reject(err))
})

export default new Realm(databaseOptions);