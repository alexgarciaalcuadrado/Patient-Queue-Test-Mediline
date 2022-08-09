import React, { useState, useEffect } from 'react';
import {over} from 'stompjs';
import SockJS from 'sockjs-client';

const UrlWS = 'http://queue.url';
let stompClient = null;

const DoctorVirtualGuard = () => {
    const userData ={
        id: "699e615c-af2e-49d2-a650-eb61beaf2569",

    }
   const [patientData, setPatientData] = useState({
      patientId: '',
      professionalId: userData.id,
      specialtyId: "",
      queueId: '',
      connected: true,
      orderNumber: ''
    });
   const [privatemessagews, setPrivatemessagews] = useState(new Map());        

   useEffect(() => {
      //eslint-disable-next-line
      console.log(userData);
      let Sock = new SockJS(UrlWS);
      stompClient = over(Sock);
      stompClient.connect({},onConnectedProfessional, onError);  

      setInterval(() => {
         var wsMessage = {
            orderNumber: patientData.orderNumber,
            specialtyId: patientData.id,
            command: "GetPatient",
            patientId: patientData.id,
            professionalId: patientData.professionalId,
            queueId: patientData.queueId,
          };
                  //eslint-disable-next-line
          console.log('doctorGetPatient');
                //eslint-disable-next-line
          console.log(wsMessage);
          stompClient.send("/app/message", {}, JSON.stringify(wsMessage));
      }, 5000)

   }, []);


   const onConnectedProfessional = () => {
      if (userData.id !== '') {
          stompClient.subscribe('/user/'+userData.id+'/private', onPrivateMessageProfessional);
      }
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

         setPatientData({ ...patientData,"patientId": payloadData.patientId,"orderNumber" : payloadData.orderNumber,"professionalId": payloadData.professionalId,
              "queueId": payloadData.queueId, "specialtyId": payloadData.specialtyId, "connected": patientData.connected});
         //eslint-disable-next-line
         console.log('patientData');
         //eslint-disable-next-line
         console.log(patientData);
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

   return (
      <div style={{
        textAlign : "center"
        }}>
         <div className="header">
            <h2>Doctor</h2>
         </div>
         <div >
           <div>
               <h3>Pacientes en sala de espera: 0</h3>
               <p>El doctor se conecta al queue en el momento en que abre su sesión</p>
               <p>Al llamar al comando GetPatient debería obtener la información del paciente en la cola en el log</p>
            </div>
            <button onClick={FinishDoctor}>Desconectar llamada</button>
         </div> 
      </div>
   );
};

export default DoctorVirtualGuard;
