import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { v4 as uuidv4 } from "uuid";

const AppContainer = styled.div`
  font-family: Arial, sans-serif;
  max-width: 600px;
  margin: 0 auto;
  padding: 10px;
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

const Header = styled.div`
  text-align: center;
  font-size: 16px;
  margin-bottom: 10px;
  color: #666;
`;

const ChatWindow = styled.div`
  flex: 1;
  background: #f7f7f7;
  border-radius: 5px;
  padding: 10px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Message = styled.div`
  display: flex;
  justify-content: ${(props) => (props.isUser ? "flex-end" : "flex-start")};
  align-items: center;
  background: ${(props) => (props.isUser ? "#007bff" : "#e9ecef")};
  color: ${(props) => (props.isUser ? "white" : "black")};
  padding: 10px;
  margin: 5px 0;
  border-radius: ${(props) =>
    props.isUser ? "10px 10px 0 10px" : "10px 10px 10px 0"};
  max-width: 70%;
  word-break: break-word; /* 確保文字能換行 */
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
`;


const ButtonContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
`;

const OptionButton = styled.button`
  padding: 10px 15px;
  margin: 5px;
  border: 1px solid #007bff;
  border-radius: 20px;
  background: white;
  color: #007bff;
  cursor: pointer;
  text-align: center;
  transition: all 0.3s ease;
  font-size: 14px;

  &:hover {
    background: #007bff;
    color: white;
  }
`;


const InputContainer = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const Input = styled.input`
  flex: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const SendButton = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  background: ${(props) => (props.disabled ? "#ccc" : "#007bff")};
  color: ${(props) => (props.disabled ? "#666" : "white")};
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  transition: background 0.3s;
  &:hover {
    background: ${(props) => (props.disabled ? "#ccc" : "#0056b3")};
  }
`;

const App = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const ws = useRef(null);
  const uuid = useRef(uuidv4());
  const sessionId = useRef(uuidv4());
  const [isConnected, setIsConnected] = useState(false); // 新增連線狀態

  // 預設按鈕數據
  const helloMsg = {
    data: ["明日天氣預報", "降雨預報", "近期飆股", "留言"],
    subType: "relatelist",
    type: "text",
    value: "歡迎使用以下功能",
  };

  // 初始化 WebSocket
  useEffect(() => {
    ws.current = new WebSocket(`ws://localhost:3002/websocket/${uuid.current}`);

    ws.current.onopen = () => {
      console.log("WebSocket connected");
      setIsConnected(true);
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      // 如果 subType 為 "relatelist"，顯示按鈕選項
      if (data.subType === "relatelist") {
        setMessages((prev) => [
          ...prev,
          { text: data.value, isUser: false, options: data.data },
        ]);
      } else {
        setMessages((prev) => [...prev, { text: data.value, isUser: false }]);
      }
      console.log(data);
    };

    ws.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.current.onclose = () => {
      console.log("WebSocket closed");
      setIsConnected(false);
    };
    return () => {
      // if (ws.current) ws.current.close();
    };
  }, []);

  const sendMessage = (message) => {
    if (ws.current && isConnected) {
      const messageRequest = {
        code: 1,
        mess: message,
        domain: "example.com",
        userList: ["user1", "user2"],
        sessionId: sessionId.current,
        uuid: uuid.current,
      };

      ws.current.send(JSON.stringify(messageRequest));
      setMessages((prev) => [...prev, { text: message, isUser: true }]);
    } else {
      console.warn("WebSocket is not ready yet");
    }
  };

  const handleButtonClick = (text) => {
    sendMessage(text);
  };

  const handleSend = () => {
    if (inputValue.trim()) {
      sendMessage(inputValue.trim());
      setInputValue("");
    }
  };

  return (
    <AppContainer>
    <ChatWindow>
      <Header>
        {new Date()
          .toLocaleDateString("zh-TW", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          })
          .replace(/\//g, ".")}
      </Header>
      {messages.map((msg, index) => (
        <div key={index}>
          <Message isUser={msg.isUser}>
            <span>{msg.text}</span>
          </Message>
          {msg.options && (
            <ButtonContainer>
              {msg.options.map((option, idx) => (
                <OptionButton key={idx} onClick={() => handleButtonClick(option)}>
                  {option}
                </OptionButton>
              ))}
            </ButtonContainer>
          )}
        </div>
      ))}
    </ChatWindow>


      <ButtonContainer>
        {helloMsg.data.map((option) => (
          <OptionButton key={option} onClick={() => handleButtonClick(option)}>
            {option}
          </OptionButton>
        ))}
      </ButtonContainer>

      <InputContainer>
        <Input
          placeholder="想問什麼問題？"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSend();
            }
          }}
        />
        <SendButton onClick={handleSend} disabled={!inputValue.trim() || !isConnected}>
          發送
        </SendButton>
      </InputContainer>
    </AppContainer>
  );
};

export default App;
