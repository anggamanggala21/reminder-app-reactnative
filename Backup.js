import React, { Component } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  FlatList,
  Dimensions,
  TextInput,
  Alert
} from 'react-native';

import {
  Header,
  LearnMoreLinks,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

import { getAllTodo, insertTodo, deleteAllTodo, deleteTodoById } from './src/database/allSchema';
import Realm from './src/database/allSchema';
import ranstr from 'ranstr';
import PushNotification from 'react-native-push-notification'
import DateTimePicker from '@react-native-community/datetimepicker';

class Backup extends Component {

  constructor() {
    super();
    this.state = {
      todos: [],
      todoTitle: '',
      todoDate: new Date(),
      todoTime: new Date(),
      showDate: false,      
    }
    PushNotification.configure({            
          
      onNotification: function (notification) {        
        notification.finish(PushNotificationIOS.FetchResult.NoData);
      },

      onRegistrationError: function(err) {
        console.error(err.message, err);
      },

      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      popInitialNotification: true,
      requestPermissions: true,

    });
  }

  addNotif(message = 'Reminder') {    
    PushNotification.localNotificationSchedule({      
      message: message, // (required)
      date: new Date(this.state.todoDate), // in 60 secs
      allowWhileIdle: false, // (optional) set notification to work while on doze, default: false
    });
  }

  addTodo() {
    
    if (!this.state.todoTitle) return Alert.alert('Todo tittle cannot null');

    insertTodo({
      _id: ranstr(20),
      name: this.state.todoTitle,
      createdAt: new Date()
    }).then((res) => {      
      this.addNotif(this.state.todoTitle)
      this.setState({ 
        todoTitle: ''
      })      
      this.selectTodo()
    })

  }  

  selectTodo() {
    getAllTodo().then((res) => {
      this.setState({ todos: [] })
      res.map((dt, i) => {
        this.setState({ todos: this.state.todos.concat(dt) })
      })
    })
  }

  deleteTodo(id) {
    if (id) {
      deleteTodoById(id).then((res) => {        
        this.selectTodo()        
      })
    } else {
      deleteAllTodo().then((res) => {      
        this.setState({ todos: [] })
      })
    }    
  }

  componentDidMount() {
    getAllTodo().then((res) => {      
      this.setState({ todos: [] })
      res.map((dt, i) => {
        this.setState({ todos: this.state.todos.concat(dt) })
      })
    })
  }

  dateToText(date) {
    let parseDate = new Date(date)
    return parseDate.getDay() + '-' + (parseDate.getMonth() + 1) + '-' + parseDate.getFullYear() + ' ' + parseDate.getHours() + ':' + parseDate.getMinutes()
  }

  onChangeDate(val, type) {

    if(!val.nativeEvent.timestamp) return

    let dateSet = new Date(val.nativeEvent.timestamp)
    dateSet = new Date(dateSet).setSeconds(0)
    this.setState({ todoDate: dateSet })
    
    if (type == 'date') {
      this.setState({        
        showDate: false
      })
      setTimeout(() => {
        this.setState({        
          showTime: true
        })
      }, 50)
    } else {
      
      this.setState({        
        showTime: false
      })
      setTimeout(() => {
        this.setState({        
          showDate: false
        })
      }, 50)

    }

  }

  setTimeZone(datetime) {
    let data = new Date(datetime)
    return new Date(new Date(data).setHours(data.getHours() + 8))
  }

  render(){
    return (
      <>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView>
          <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            style={styles.scrollView}>
              
            <View style={{ margin: 20 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                <TextInput 
                  placeholder="Todo title" 
                  style={{ backgroundColor: 'white', width: '75%' }} 
                  value={this.state.todoTitle}
                  onChangeText={(text) => { this.setState({ todoTitle: text }) }}/>
                <TouchableOpacity onPress={() => { this.addTodo() }} style={{ padding: 10, width: '25%', backgroundColor: 'blue', alignItems: 'center', justifyContent: 'center' }}>
                  <Text>Add Todo</Text>
                </TouchableOpacity>
              </View>

              <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                <TouchableOpacity onPress={() => { this.setState({ showDate: true, showTime: false }) }} style={{ padding: 10, width: '25%', backgroundColor: 'blue', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                  <Text>Date</Text>
                </TouchableOpacity>
              </View>
              
              <View>
                {
                  this.state.showDate == true && this.state.showTime == false
                  ? <DateTimePicker
                      testID="dateTimePicker"
                      value={this.state.todoDate}
                      mode="date"
                      is24Hour={true}
                      display="default"
                      onChange={(val) => { this.onChangeDate(val, 'date') }}
                    />
                  : <View></View>
                }
                {
                  this.state.showTime == true && this.state.showDate == false
                  ? <DateTimePicker
                      testID="dateTimePicker"
                      value={this.state.todoDate}
                      mode="time"
                      is24Hour={true}
                      display="default"
                      onChange={(val) => { this.onChangeDate(val, 'time') }}
                    />
                  : <View></View>
                }
              </View>

              <TouchableOpacity onPress={() => { this.deleteTodo() }} style={{ marginBottom: 10, padding: 10, backgroundColor: 'red' }}>
                <Text>Delete All Todo</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { this.addNotif() }} style={{ marginBottom: 10, padding: 10, backgroundColor: 'yellow' }}>
                <Text>Notif</Text>
              </TouchableOpacity>
            </View>

            {
              this.state.todos.map((dt, i) => {
                return(
                  <View 
                    key={i} 
                    style={{ 
                      width: Dimensions.get('screen').width - 20, 
                      backgroundColor: 'white', 
                      padding: 10, 
                      marginHorizontal: 10, 
                      marginVertical: 5,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                    <View>
                      <Text style={{ fontSize: 16 }}>{ dt.name }</Text>
                      <Text style={{ color: '#9c9c9c', fontSize: 12 }}>{ this.dateToText(dt.createdAt) }</Text>
                    </View>
                    <TouchableOpacity 
                      onPress={ () => { this.deleteTodo(dt._id) } } 
                      style={{ 
                        backgroundColor: 'red', 
                        width: 30,
                        height: 30,
                        borderRadius: 50,
                        justifyContent: 'center',
                        alignItems: 'center'
                      }}>
                      <Text style={{ color: 'white', fontWeight: 'bold' }}>X</Text>
                    </TouchableOpacity>
                  </View>
                )
              })
            }

          </ScrollView>
        </SafeAreaView>
      </>
    );
  }
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.lighter,
  },
  engine: {
    position: 'absolute',
    right: 0,
  },
  body: {
    backgroundColor: Colors.white,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: Colors.dark,
  },
  highlight: {
    fontWeight: '700',
  },
  footer: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: '600',
    padding: 4,
    paddingRight: 12,
    textAlign: 'right',
  },
});

export default App;
