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
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/dist/FontAwesome';

class App extends Component {

  constructor() {
    super();
    this.state = {
      todos: [],
      dueDates: [],
      todoTitle: '',
      todoDescription: '',
      calendarDate: new Date(),
      todoDate: '',
      showDate: false,
      showModalCreate: false,
      modalCreateContentTransition: 'fadeInUpBig',
      modalCreateCloseTransition: 'fadeInDownBig',
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
      smallIcon: "ic_launcher",

    });
  }

  addNotif(datas) {    
    PushNotification.localNotificationSchedule({
      messageId: datas.id,
      smallIcon: "ic_launcher",
      title: datas.title,
      message: datas.description ? datas.description : datas.title,
      date: new Date(datas.date),
      allowWhileIdle: false,
    });
  }

  cancleNotif(id) {    
    PushNotification.cancelLocalNotifications({ messageId: id });
  }

  addTodo() {
    
    if (!this.state.todoTitle || !this.state.todoDate) return Alert.alert('Opss...', 'Title and date cannot null !');

    let _id = Math.random().toString().split('.')[1]
    insertTodo({
      _id: _id,
      title: this.state.todoTitle,
      description: this.state.todoDescription,
      reminderDate: new Date(this.state.todoDate),
      createdAt: new Date()
    }).then((res) => {
      this.addNotif({
        id: _id,
        title: this.state.todoTitle,
        description: this.state.todoDescription,
        date: this.state.todoDate,
      })
      setTimeout(() => {
        this.setState({ 
          todoTitle: '',
          todoDescription: '',
          calendarDate: new Date(),
          todoDate: ''
        })
      }, 200)
      this.toggleModalCreate()
      this.selectTodo()
    })

  }  

  selectTodo() {
    getAllTodo().then((res) => {      
      this.setState({ todos: [], dueDates: [] })
      let dateNow = new Date()
      res.map((dt, i) => {
        if (dt.reminderDate < dateNow) {          
          this.setState({ dueDates: this.state.dueDates.concat(dt) })
        } else {
          this.setState({ todos: this.state.todos.concat(dt) })
        }        
      })
    })
  }

  deleteTodo(id) {

    Alert.alert(
      "Warning",
      "Do you want to delete this reminder ?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Canceled"),
          style: "cancel"
        },
        { text: "OK", 
          onPress: () => {
            if (id) {
              deleteTodoById(id).then((res) => {
                this.cancleNotif(id)
                this.selectTodo()
              })
            } else {
              deleteAllTodo().then((res) => {      
                this.setState({ todos: [] })
              })
            }
          } 
        }
      ],
      { cancelable: false }
    );        
  }

  componentDidMount() {
    this.selectTodo()
    setInterval(() => {
      this.selectTodo()
    }, 60000)
  }

  dateToText(date) {
    let parseDate = new Date(date)
    return parseDate.getDate() + '-' + (parseDate.getMonth() + 1) + '-' + parseDate.getFullYear() + ' ' + parseDate.getHours() + ':' + parseDate.getMinutes()
  }

  onChangeDate(val, type) {

    if(!val.nativeEvent.timestamp) return

    let dateSet = new Date(val.nativeEvent.timestamp)    
    dateSet = new Date(dateSet).setSeconds(0)
    this.setState({ 
      calendarDate: dateSet,
      todoDate: dateSet,
      showDate: false,
      showTime: false
    })
    
    if (type == 'date') {      
      setTimeout(() => {
        this.setState({        
          showTime: true
        })
      }, 10)
    }

  }

  toggleModalCreate() {
    
    if (this.state.showModalCreate == true) {
      this.setState({
        modalCreateContentTransition: 'fadeOutDownBig',
        modalCreateCloseTransition: 'fadeOutUpBig'
      })
      setTimeout(() => {
        this.setState({
          showModalCreate: false
        })
      }, 250)
    } else {
      this.setState({
        modalCreateContentTransition: 'fadeInUpBig',
        modalCreateCloseTransition: 'fadeInDownBig',
        showModalCreate: true
      })
    }    

  }

  render(){
    return (
      <>
        <StatusBar backgroundColor="#21277B" barStyle="light-content" />
        <SafeAreaView style={{ backgroundColor: 'white', minHeight: Dimensions.get('screen').height }}>
          <View style={{ backgroundColor: '#21277B', height: 125, width: Dimensions.get('screen').width, padding: 30, justifyContent: 'center' }}>
              <Text style={{ color: 'white', fontSize: 24, fontFamily: 'Montserrat-Bold', marginTop: -20 }}>REMINDER APP</Text>              
          </View>
          
          <View style={styles.containerScrollView}>
            <ScrollView 
            style={{ maxHeight: Dimensions.get('screen').height - 90 }}
            showsVerticalScrollIndicator={true}>                          

              <View>
                  <View style={{ backgroundColor: '#F0F0F0', width: Dimensions.get('screen').width, padding: 30, paddingTop: 20, zIndex: 10, paddingBottom: this.state.dueDates.length > 0 ? 50 : 0, marginTop: 90, borderTopLeftRadius: 30, borderTopRightRadius: 30 }}>

                  {
                    this.state.dueDates.length
                    ? <Text style={{ color: 'black', fontSize: 18, fontFamily: 'Montserrat-Bold', marginHorizontal: 10 }}>Due Date</Text>
                    : <View></View>
                  }

                  {
                    this.state.dueDates.map((dt, i) => {
                      return(
                        <View key={i} style={{ backgroundColor: 'white', borderRadius: 15, minHeight: 80, marginTop: 10, paddingVertical: 10, paddingHorizontal: 15, flexDirection: 'row', justifyContent: 'space-between' }}>
                          <View style={{ justifyContent: 'space-evenly', width: '85%' }}>
                            <Text style={{ fontSize: 16, fontFamily: 'Montserrat-Bold', color: '#000000' }}>{ dt.title }</Text>
                            {
                              dt.description
                              ? <Text style={{ fontSize: 14, marginBottom: 10, color: '#5c5c5c', fontFamily: 'Montserrat-Medium' }}>{ dt.description }</Text>
                              : <View></View>                            
                            }
                            <Text style={{ color: '#9c9c9c', fontSize: 12, fontFamily: 'Montserrat-Medium', color: '#21277B' }}>{ this.dateToText(dt.reminderDate) }</Text>
                          </View>
                          <View style={{ justifyContent: 'flex-end' }}>
                            <TouchableOpacity 
                              onPress={() => { this.deleteTodo(dt._id) }}
                              style={{ padding: 15, marginLeft: -10 }}>
                              <Icon name="trash" size={20} color="#FC210D" />
                            </TouchableOpacity>
                          </View>
                        </View>
                      )
                    })
                  }

                  </View>

                  <View style={{ backgroundColor: 'white', borderTopLeftRadius: 30, borderTopRightRadius: 30, width: Dimensions.get('screen').width, marginTop: -30, zIndex: 20, padding: 30, paddingBottom: 100 }}>

                  <Text style={{ color: 'black', fontSize: 18, fontFamily: 'Montserrat-Bold', marginHorizontal: 10 }}>Comming Up</Text>

                  {
                    this.state.todos.map((dt, i) => {
                      return(
                        <View key={i} style={{ backgroundColor: '#F5F5F5', borderRadius: 15, minHeight: 80, marginTop: 10, paddingVertical: 10, paddingHorizontal: 15, flexDirection: 'row', justifyContent: 'space-between' }}>
                          <View style={{ justifyContent: 'space-evenly', width: '85%' }}>
                            <Text style={{ fontSize: 16, fontFamily: 'Montserrat-Bold', color: '#000000' }}>{ dt.title }</Text>
                            {
                              dt.description
                              ? <Text style={{ fontSize: 14, marginBottom: 10, color: '#5c5c5c', fontFamily: 'Montserrat-Medium' }}>{ dt.description }</Text>
                              : <View></View>                            
                            }          
                            <Text style={{ color: '#9c9c9c', fontSize: 12, fontFamily: 'Montserrat-Medium', color: '#21277B' }}>{ this.dateToText(dt.reminderDate) }</Text>
                          </View>
                          <View style={{ justifyContent: 'flex-end' }}>
                            <TouchableOpacity 
                              onPress={() => { this.deleteTodo(dt._id) }}
                              style={{ padding: 15, marginLeft: -10 }}>
                              <Icon name="trash" size={20} color="#FC210D" />
                            </TouchableOpacity>
                          </View>
                        </View>
                      )
                    })
                  }

                  </View>
              </View>

            </ScrollView>            

          </View>

          <View style={{ width: Dimensions.get('screen').width, justifyContent: 'flex-end', alignItems: 'center', position: 'absolute', height: Dimensions.get('screen').height/1.12 }}>
            <TouchableOpacity 
              onPress={() => { this.toggleModalCreate() }}
              style={{ height: 60, width: 60, backgroundColor: '#21277B', marginBottom: 20, borderRadius: 50, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: 'white', fontSize: 24, fontFamily: 'Montserrat-Bold' }}>+</Text>
            </TouchableOpacity>
          </View>

          {
            this.state.showModalCreate == true 
            ? <View style={{ position: 'absolute', backgroundColor: '#00000050', width: Dimensions.get('screen').width, height: Dimensions.get('screen').height, justifyContent: 'flex-end', alignItems: 'center' }}>

                <Animatable.View 
                animation={this.state.modalCreateCloseTransition}
                duration={500}                            
                useNativeDriver>
                  <TouchableOpacity 
                    onPress={() => { this.toggleModalCreate() }}
                    style={{ height: 60, width: 60, backgroundColor: 'red', marginBottom: 20, borderRadius: 50, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: 'white', fontSize: 24, fontFamily: 'Montserrat-Bold' }}>X</Text>
                  </TouchableOpacity>
                </Animatable.View>

                <Animatable.View 
                animation={this.state.modalCreateContentTransition}
                duration={500}                            
                useNativeDriver
                style={{ backgroundColor: 'white', height: Dimensions.get('screen').height / 1.4, width: Dimensions.get('screen').width, borderTopRightRadius: 30, borderTopLeftRadius: 30, padding: 30, justifyContent: 'space-between', paddingBottom: 120 }}>

                    <View>

                      <Text style={{ fontSize: 18, fontFamily: 'Montserrat-Bold', marginBottom: 20, marginLeft: 10 }}>Create Reminder</Text>

                      <TextInput
                        placeholder="Input title"
                        value={this.state.todoTitle}
                        onChangeText={(text) => { this.setState({ todoTitle: text }) }}
                        style={{ backgroundColor: '#E9E9E9', borderRadius: 50, paddingHorizontal: 20, marginBottom: 10, fontFamily: 'Montserrat-Medium' }}
                      />

                      <TextInput
                        placeholder="Input description"
                        value={this.state.todoDescription}
                        multiline = {true}
                        numberOfLines = {4}
                        onChangeText={(text) => { this.setState({ todoDescription: text }) }}
                        style={{ backgroundColor: '#E9E9E9', borderRadius: 15, paddingHorizontal: 20, textAlignVertical: 'top', marginBottom: 10, fontFamily: 'Montserrat-Medium' }}
                      />

                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ 
                            backgroundColor: '#E9E9E9', 
                            borderRadius: 50, 
                            paddingHorizontal: 20, 
                            marginBottom: 10, 
                            height: 45, 
                            width: '70%',
                            borderTopRightRadius: 0,
                            borderBottomRightRadius: 0,
                            textAlignVertical: 'center', 
                            fontFamily: 'Montserrat-Medium' }}>
                              { this.state.todoDate ? this.dateToText(this.state.todoDate) : '' }
                        </Text>
                        <TouchableOpacity 
                          onPress={() => { this.setState({ showDate: true, showTime: false }); }}
                          style={{ backgroundColor: '#21277B', borderRadius: 50, height: 45, width: '30%', justifyContent: 'center', alignItems: 'center', borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}>
                          <Text style={{ color: 'white', fontFamily: 'Montserrat-Medium' }}>Select Date</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    <TouchableOpacity 
                      onPress={() => { this.addTodo() }}
                      style={{ backgroundColor: '#21277B', borderRadius: 50, padding: 15, alignItems: 'center' }}>
                      <Text style={{ color: 'white', fontSize: 18, fontFamily: 'Montserrat-Medium' }}>SAVE</Text>
                    </TouchableOpacity>
                  
                </Animatable.View>
              </View>
            : <View></View>
          }

          <View>
            {
              this.state.showDate == true && this.state.showTime == false
              ? <DateTimePicker
                  testID="dateTimePicker"
                  value={this.state.calendarDate}
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
                  value={this.state.calendarDate}
                  mode="time"
                  is24Hour={true}
                  display="default"
                  onChange={(val) => { this.onChangeDate(val, 'time') }}
                />
              : <View></View>
            }
          </View>

        </SafeAreaView>
      </>
    );
  }
};

const styles = StyleSheet.create({
  containerScrollView: {
    backgroundColor: 'transparent',
    marginTop: -125,
    borderTopLeftRadius: 30, 
    borderTopRightRadius: 30,
    overflow: 'hidden'
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
