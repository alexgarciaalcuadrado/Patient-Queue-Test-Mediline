import React, { useEffect, useState } from 'react'
import {over} from 'stompjs';
import SockJS from 'sockjs-client';

var stompClient =null;
const MessagesConsole = () => {
    const [privatemessagews, setPrivatemessagews] = useState(new Map());     
    const [publicmessagews, setPublicmessagews] = useState([]); 
    const [tab,setTab] =useState("MC");
    const [userData, setUserData] = useState({
        username: '',
        receivername: '',
        connected: false,
        message: ''
      });
    useEffect(() => {
      console.log(userData);
    }, [userData]);

    const connect =()=>{
        let Sock = new SockJS('http://queue.mediline.com.ar/ws');
        stompClient = over(Sock);
        stompClient.connect({},onConnected, onError);
    }

    const onConnected = () => {
        setUserData({...userData,"connected": true});
        stompClient.subscribe('/allusers/public', onMessageReceived);
        stompClient.subscribe('/user/'+userData.username+'/private', onPrivateMessage);
        userJoin();
    }

    const userJoin=()=>{
          var wsMessage = {
            senderName: userData.username,
            status:"JOIN",
            message: "",
            specialtyId: "b3792b24-85a8-4373-8b06-c0d48ec744a4",
            command: "GetOrder"
          };
          stompClient.send("/app/message", {}, JSON.stringify(wsMessage));
    }

    const doctorGetPatient=()=>{
          var wsMessage = {
            senderName: userData.username,
            status:"MESSAGE",
            message: "",
            specialtyId: "b3792b24-85a8-4373-8b06-c0d48ec744a4",
            command: "GetPatient"
          };
          stompClient.send("/app/message", {}, JSON.stringify(wsMessage));
    }

    const PatientReady=(doctor)=>{
           console.log('PatientReady');
            if (stompClient) {
              var wsMessage = {
            senderName: userData.username,
            receiverName:doctor,
            message: userData.message,
            status:"MESSAGE",
            command: "SetPatient"
              };
              console.log(wsMessage);
              stompClient.send("/app/private-message", {}, JSON.stringify(wsMessage));
            }
    }

    const onMessageReceived = (payload)=>{
        console.log('onMessageReceived ');
        var payloadData = JSON.parse(payload.body);
        switch(payloadData.status){
            case "JOIN":
                if(!privatemessagews.get(payloadData.senderName)){
                    privatemessagews.set(payloadData.senderName,[]);
                    setPrivatemessagews(new Map(privatemessagews));
                }
                break;
            case "MESSAGE":
                publicmessagews.push(payloadData);
                setPublicmessagews([...publicmessagews]);

                break;
        }
    }
    
    const onPrivateMessage = (payload)=>{
        console.log(payload);
        console.log('onPrivateMessage');

        var payloadData = JSON.parse(payload.body);
        if(privatemessagews.get(payloadData.senderName)){
            privatemessagews.get(payloadData.senderName).push(payloadData);
            setPrivatemessagews(new Map(privatemessagews));
        }else{
            let list =[];
            list.push(payloadData);
            privatemessagews.set(payloadData.senderName,list);
            setPrivatemessagews(new Map(privatemessagews));
        }
        if(payloadData.command=='SetProfessional') {
           console.log(payloadData.message);
          PatientReady(payloadData.message);
        }
    }

    const onError = (err) => {
        console.log(err);
        
    }

    const sendValue=()=>{
            if (stompClient) {
              var wsMessage = {
                senderName: userData.username,
                message: userData.message,
                status:"MESSAGE"
              };
              console.log(wsMessage);
              stompClient.send("/app/private-message", {}, JSON.stringify(wsMessage));
              setUserData({...userData,"message": ""});
            }
    }

    const sendPrivateValue=()=>{
        if (stompClient) {
          var wsMessage = {
            senderName: userData.username,
            receiverName:tab,
            message: userData.message,
            status:"MESSAGE"
          };
          
          if(userData.username !== tab){
            privatemessagews.get(tab).push(wsMessage);
            setPrivatemessagews(new Map(privatemessagews));
          }
          stompClient.send("/app/private-message", {}, JSON.stringify(wsMessage));
          setUserData({...userData,"message": ""});
        }
    }

    const handleUsername=(event)=>{
        const {value}=event.target;
        setUserData({...userData,"username": value});
    }

    const registerUser=()=>{
        connect();
    }
    return (
    <div className="container">
        {userData.connected?
        <div className="messagews-box">
            <div className="member-list">
                <ul>
                    <li onClick={()=>{setTab("MC")}} className={`member ${tab==="MC" && "active"}`}>Doctor</li>
                    {[...privatemessagews.keys()].map((name,index)=>(
                        <li onClick={()=>{setTab(name)}} className={`member ${tab===name && "active"}`} key={index}>{name}</li>
                    ))}
                </ul>
            </div>
            {tab==="MC" && <div className="messagews-content">
                <ul className="messagews-messages">
                    {publicmessagews.map((messagews,index)=>(
                        <li className={`message ${messagews.senderName === userData.username && "self"}`} key={index}>
                            {messagews.senderName !== userData.username && <div className="avatar">Paciente {messagews.senderName}</div>}
                            <div className="message-data">{messagews.message}</div>
                            {messagews.senderName === userData.username && <div className="avatar self">Paciente {messagews.senderName}</div>}
                        </li>
                    ))}
                </ul>
            </div>}
            {tab!=="MC" && <div className="messagews-content">
                <ul className="messagews-messages">
                    {[...privatemessagews.get(tab)].map((messagews,index)=>(
                        <li className={`message ${messagews.senderName === userData.username && "self"}`} key={index}>
                            {messagews.senderName !== userData.username && <div className="avatar">{messagews.senderName}</div>}
                            <div className="message-data">{messagews.message}</div>
                            {messagews.senderName === userData.username && <div className="avatar self">{messagews.senderName}</div>}
                        </li>
                    ))}
                </ul>
            </div>}
              <button type="button" onClick={doctorGetPatient}>
                    Doctor llama Paciente
              </button> 
        </div>
        :
        <div className="register">
            <input
                id="user-name"
                placeholder="Patient ID"
                name="userName"
                value={userData.username}
                onChange={handleUsername}
                margin="normal"
              />
              <button type="button" onClick={registerUser}>
                    connect
              </button> 
        </div>}
    </div>
    )
}

export default MessagesConsole
