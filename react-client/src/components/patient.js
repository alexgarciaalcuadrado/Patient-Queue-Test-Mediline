import React, { useEffect, useState } from 'react';
import {over} from 'stompjs';
import SockJS from 'sockjs-client';

let stompClient = null;
const UrlWS = 'http://queue.mediline.com.ar/ws';

const PatientVirtualGuard = () => {

  const userData = {
    id :"f9012036-7ae6-4473-9d66-ebee493009ee"
  };
  const specialty = "b3792b24-85a8-4373-8b06-c0d48ec744a4";
  const [privatemessagews, setPrivatemessagews] = useState(new Map());     
  const [patientData, setPatientData] = useState({
    patientId: userData.id,
    professionalId: '',
    specialtyId: '',
    queueId: '',
    connected: true,
    orderNumber: ''
  });
  const [reason, setReason] = useState(""); 

  useEffect(()=>{
      //eslint-disable-next-line
      console.log(patientData);
  },[reason, patientData]);

  const connectAndGetOrder = () => {
    let Sock = new SockJS(UrlWS);
    stompClient = over(Sock);
    stompClient.connect({},onConnectedPatient, onError); 

    setTimeout(() => {
      var wsMessage = {
        patientId: userData.id,
        specialtyId: specialty,
        command: "GetOrder"
      };
              //eslint-disable-next-line
      console.log('GetOrder');
            //eslint-disable-next-line
      console.log(wsMessage);
      stompClient.send("/app/message", {}, JSON.stringify(wsMessage));
    }, 4000);
    
  }

  const onConnectedPatient = () => {
    if (patientData.patientId !== '') {
        stompClient.subscribe('/user/'+patientData.patientId+'/private', onPrivateMessagePatient);
    }
  }

  const onPrivateMessagePatient = (payload)=>{
    //eslint-disable-next-line
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
        //eslint-disable-next-line
    console.log('payloadData');
        //eslint-disable-next-line
    console.log(payloadData);
    setPatientData({...patientData,"patientId": payloadData.patientId,"orderNumber" : payloadData.orderNumber,"professionalId": payloadData.professionalId,
                 "queueId": payloadData.queueId, "specialtyId": payloadData.specialtyId, "connected": patientData.connected});
//eslint-disable-next-line
    console.log('userData');
          //eslint-disable-next-line
    console.log(patientData);
 }
       //eslint-disable-next-line
console.log(payloadData.command);
      //eslint-disable-next-line
console.log('onPrivateMessagePatient END');
}

const onError = (err) => {
  //eslint-disable-next-line
console.log(err);

}
  
  return (
    <div style={{
        textAlign : "center"
     }}>
        <h1>Paciente</h1>
      <div style={{margin: "2rem 0 1rem 0"}}>Motivo de Consulta</div>
      <div style={{marginLeft: "10px"}}>
          <input 
          placeholder="Ingresar aqui el motivo de su consulta"
          onChange={(evt) => setReason(evt.target.value)}
          />
      </div>
      <div style={{marginTop: "1rem"}}>
          <button
          onClick={() => {
            const reasonText = reason?.length ? reason.trim() : null;
            setPatientData({
              "patientId": userData.id,
              "professionalId": '',
              "specialtyId": specialty,
              "consulta" : reasonText,
              "queueId": '',
              "connected": true,
              "orderNumber": ''
            });
            connectAndGetOrder();  
          }}
          >Ingresar</button>
          <p>Al ingresar, se conecta al websocket y pide un número de sala de espera. Cuando el doctor llama al paciente le llega en el log la información de la conección</p>
      </div>
    </div>
  );
};

export default PatientVirtualGuard;
