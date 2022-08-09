import React, { useEffect, useState } from 'react'
import {over} from 'stompjs';
import SockJS from 'sockjs-client';

var stompClient =null;
const UrlWS = 'http://queue.url';

const MessagesConsole = () => {
    const [privatemessagews, setPrivatemessagews] = useState(new Map());     
    const [tab,setTab] =useState("MC");
    const [userData, setUserData] = useState({
        patientId: '',
        professionalId: '',
        specialtyId: '',
        queueId: '',
        connected: false,
        orderNumber: ''
      });
    useEffect(() => {
            //eslint-disable-next-line
      console.log(userData);
    }, [userData]);

    const connectPatient =()=>{
        if(userData.connected) {
                //eslint-disable-next-line
            console.log('disconnecting');
            stompClient.disconnect();
            setUserData({
                patientId: '',
                professionalId: '',
                specialtyId: '',
                queueId: '',
                connected: false,
                orderNumber: ''
              });
        }
        let Sock = new SockJS(UrlWS);
        stompClient = over(Sock);
        stompClient.connect({},onConnectedPatient, onError);
    }

    const connectProfessional =()=>{
        if(userData.connected) {
                //eslint-disable-next-line
            console.log('disconnecting');
            stompClient.disconnect();
            setUserData({
                patientId: '',
                professionalId: '',
                specialtyId: '',
                queueId: '',
                connected: false,
                orderNumber: ''
              });
        }
        let Sock = new SockJS(UrlWS);
        stompClient = over(Sock);
        stompClient.connect({},onConnectedProfessional, onError);
    }

    const onConnectedPatient = () => {
        setUserData({...userData,"connected": true});
        if (userData.patientId !== '') {
            stompClient.subscribe('/user/'+userData.patientId+'/private', onPrivateMessagePatient);
        }
    }

    const onConnectedProfessional = () => {
        setUserData({...userData,"connected": true});
        if (userData.professionalId !== '') {
            stompClient.subscribe('/user/'+userData.professionalId+'/private', onPrivateMessageProfessional);
        }
    }

    const GetOrder=()=>{
          var wsMessage = {
            patientId: userData.patientId,
            specialtyId: "b3792b24-85a8-4373-8b06-c0d48ec744a4",
            command: "GetOrder"
          };
                //eslint-disable-next-line
          console.log('GetOrder');
                //eslint-disable-next-line
          console.log(wsMessage);
          stompClient.send("/app/message", {}, JSON.stringify(wsMessage));
    }

    const doctorGetPatient=()=>{
          var wsMessage = {
            orderNumber: userData.orderNumber,
            specialtyId: "b3792b24-85a8-4373-8b06-c0d48ec744a4",
            command: "GetPatient",
            patientId: userData.patientId,
            professionalId: userData.professionalId,
            queueId: userData.queueId,
          };
                //eslint-disable-next-line
          console.log('doctorGetPatient');
                //eslint-disable-next-line
          console.log(wsMessage);
          stompClient.send("/app/message", {}, JSON.stringify(wsMessage));
    }

    const Enter=()=>{
        var wsMessage = {
          patientId: userData.patientId,
          orderNumber: userData.orderNumber,
          specialtyId: userData.specialtyId,
          command: "Enter",
          professionalId: userData.professionalId,
          queueId: userData.queueId,
        };
              //eslint-disable-next-line
        console.log('Enter');
              //eslint-disable-next-line
        console.log(wsMessage);
        stompClient.send("/app/message", {}, JSON.stringify(wsMessage));
  }

 const FinishDoctor=()=>{
    var wsMessage = {
      patientId: userData.patientId,
      orderNumber: userData.orderNumber,
      specialtyId: userData.specialtyId,
      command: "Finish",
      professionalId: userData.professionalId,
      queueId: userData.queueId,
    };
          //eslint-disable-next-line
    console.log('Finish');
          //eslint-disable-next-line
    console.log(wsMessage);
    stompClient.send("/app/message", {}, JSON.stringify(wsMessage));
}

 const FinishPatient = () => {
    var wsMessage = {
        patientId: userData.patientId,
        orderNumber: userData.orderNumber,
        specialtyId: userData.specialtyId,
        command: "Finish",
        professionalId: userData.professionalId,
        queueId: userData.queueId,
      };
            //eslint-disable-next-line
      console.log('Finish');
            //eslint-disable-next-line
      console.log(wsMessage);
      stompClient.send("/app/message", {}, JSON.stringify(wsMessage));
    //eslint-disable-next-line
    console.log('disconnecting');
    stompClient.disconnect();
}

    
const onPrivateMessagePatient = (payload)=>{
    console.log('onPrivateMessagePatient');

    var payloadData = JSON.parse(payload.body);

    if(privatemessagews.get(payloadData.patientId)){
        privatemessagews.get(payloadData.patientId).push(payloadData);
        setPrivatemessagews(new Map(privatemessagews));
    }else{
        let list =[];
        list.push(payloadData);
        privatemessagews.set(payloadData.patientId,list);
        setPrivatemessagews(new Map(privatemessagews));
    }
    if(payloadData.command==='SetProfessional') {
        console.log('payloadData');
        console.log(payloadData);
        setUserData({...userData,"patientId": payloadData.patientId,"orderNumber" : payloadData.orderNumber,"professionalId": payloadData.professionalId,
                     "queueId": payloadData.queueId, "specialtyId": payloadData.specialtyId, "connected": userData.connected});

        console.log('userData');
        console.log(userData);
     }
    console.log(payloadData.command);
    console.log('onPrivateMessagePatient END');
}


    const onPrivateMessageProfessional = (payload)=>{
            //eslint-disable-next-line
        console.log('onPrivateMessageProfessional');
        var payloadData = JSON.parse(payload.body);

        if(privatemessagews.get(payloadData.patientId)){
            privatemessagews.get(payloadData.patientId).push(payloadData);
            setPrivatemessagews(new Map(privatemessagews));
        }else{
            let list =[];
            list.push(payloadData);
            privatemessagews.set(payloadData.patientId,list);
            setPrivatemessagews(new Map(privatemessagews));
        }
        if(payloadData.command==='Start') {
                //eslint-disable-next-line
            console.log('Start');
                  //eslint-disable-next-line
            console.log(payloadData);

            setUserData({...userData,"patientId": payloadData.patientId,"orderNumber" : payloadData.orderNumber,"professionalId": payloadData.professionalId,
                         "queueId": payloadData.queueId, "specialtyId": payloadData.specialtyId, "connected": userData.connected});
      //eslint-disable-next-line
            console.log('userData');
                  //eslint-disable-next-line
            console.log(userData);
         }
         if(payloadData.command==='GetPatient') {
                //eslint-disable-next-line
            console.log('GetPatient');
                  //eslint-disable-next-line
            console.log(payloadData);

            setUserData({...userData,"patientId": payloadData.patientId,"orderNumber" : payloadData.orderNumber,"professionalId": payloadData.professionalId,
                         "queueId": payloadData.queueId, "specialtyId": payloadData.specialtyId, "connected": userData.connected});
      //eslint-disable-next-line
            console.log('userData');
                  //eslint-disable-next-line
            console.log(userData);
         }
               //eslint-disable-next-line
        console.log(payloadData.command);
              //eslint-disable-next-line
        console.log('onPrivateMessageProfessional END');
    }

    const onError = (err) => {
            //eslint-disable-next-line
        console.log(err);
        
    }

    const handlepatientId=(event)=>{
        const {value}=event.target;
        setUserData({...userData,"patientId": value});
    }
    const handleprofessionalId=(event)=>{
        const {value}=event.target;
        setUserData({...userData,"professionalId": value});
    }

    
    return (
    <div><div className="container">
            <input
                id="patientid"
                placeholder="Patient ID"
                name="patientId"
                value={userData.patientId}
                onChange={handlepatientId}
                margin="normal" />
            <button type="button" onClick={connectPatient}>
                conectar paciente
            </button>
            <p></p>
            <input
                id="professionalid"
                placeholder="Professional ID"
                name="patientId"
                value={userData.professionalId}
                onChange={handleprofessionalId}
                margin="normal" />
            <button type="button" onClick={connectProfessional}>
                conectar doctor
            </button>
        </div><div className="container">
            <div>
                <p>Paciente</p>
                <button type="button" onClick={GetOrder}>
                    Paciente Obtiene Numero
                </button>
                <p></p>
                <button type="button" onClick={Enter}>
                    Paciente Ingresa a consulta
                </button>
                </div>
                <div>
                <p>Doctor</p>
                <button type="button" onClick={doctorGetPatient}>
                    Doctor llama Paciente
                </button>
                <p></p>
                <button type="button" onClick={FinishDoctor}>
                    Finalizar doctor
                </button>
                <button style={{ marginLeft: "1rem"}} type="button" onClick={FinishPatient}>
                    Finalizar paciente
                </button>
                </div>
            </div></div>
    )
}

export default MessagesConsole
