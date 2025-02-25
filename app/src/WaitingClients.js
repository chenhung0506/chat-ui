import React, { useEffect, useState } from "react";
import styled from "styled-components";

const Sidebar = styled.div`
  width: 300px;
  height: 100vh;
  background: #f1f1f1;
  padding: 15px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow: hidden; /* 禁止 Sidebar 本身滾動 */
`;

const ClientList = styled.div`
  flex: 1;
  overflow-y: auto; /* 讓內部可以滾動，但 Sidebar 不會 */
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: calc(100vh - 50px); /* 避免超出畫面 */
  padding-right: 5px; /* 避免滾動條壓住內容 */
`;

const ClientItem = styled.div`
  padding: 10px;
  background: white;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: #d9eaff;
  }
`;

const WaitingClients = ({ serviceId, onClientSelect, setMessages }) => {
  const [clients, setClients] = useState([]);
  const protocol = window.location.protocol;
  const Domain = process.env.REACT_APP_WEBSOCKET_DOMAIN;
  const Port = process.env.REACT_APP_WEBSOCKET_PORT;
  const hostname = `${Domain}${Port}`;

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const waitingClientsUrl = `${protocol}//${hostname}/waiting-clients`;
        const response = await fetch(waitingClientsUrl);
        const data = await response.json();
        console.log(data);
        setClients(data.waiting_clients || []);
      } catch (error) {
        console.error("Error fetching waiting clients:", error);
      }
    };

    fetchClients();
    const intervalId = setInterval(fetchClients, 5000);
    return() => clearInterval(intervalId);
  }, [serviceId, protocol, hostname]);

  const handleAssignClient = async (clientId) => {
    try {
      const handleAssignClientUrl = `${protocol}//${hostname}/assign-client`;
      const response = await fetch(handleAssignClientUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          client_id: clientId, 
          service_id: serviceId 
        }),
      });
      const data = await response.json();
      console.log(data.data.Messages);

      if (data.data && data.data.Messages) {
        const messages = data.data.Messages;
        setMessages([]); // 先清空 Messages
        for (let i = 0; i < messages.length; i++) {
            setMessages((prev) => [...prev,{ text: messages[i].value, isClient: messages[i].isClient, showOptions: false }]);
        }
      }

      setClients((prev) => prev.filter(client => client.id !== clientId));
      onClientSelect(clientId);
    } catch (error) {
      console.error("Error assigning client:", error);
    }
  };

  return (
    <Sidebar>
      <h3>等待中的客戶</h3>
      <ClientList>
        {clients.map((clientId) => (
          <ClientItem key={clientId} onClick={() => handleAssignClient(clientId)}>
            {clientId} {/* 顯示 ID，或後續補上 client name */}
          </ClientItem>
        ))}
      </ClientList>
    </Sidebar>
  );
};

export default WaitingClients;
