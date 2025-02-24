import React, { useState, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import WaitingClients from "./WaitingClients";
import ChatService from "./ChatService";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  height: 100vh;
`;

const MainScreen = () => {
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [messages, setMessages] = useState([]);
  const serviceId = useRef(uuidv4()).current;

  return (
    <Container>
      {/* 傳遞 setMessages 使 WaitingClients 能更新訊息 */}
      <WaitingClients 
        serviceId={serviceId} 
        onClientSelect={setSelectedClientId} 
        setMessages={setMessages} 
      />
      <ChatService 
        clientId={selectedClientId} 
        serviceId={serviceId} 
        messages={messages} 
        setMessages={setMessages}
     />
    </Container>
  );
};

export default MainScreen;
