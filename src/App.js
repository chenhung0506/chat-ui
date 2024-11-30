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

const MessageContainer = styled.div`
  display: flex;
  flex-direction: column; /* 垂直排列訊息與按鈕 */
  align-items: ${(props) => (props.isUser ? "flex-end" : "flex-start")}; /* 根據訊息的方向對齊 */
  margin: 10px 0; /* 增加垂直間距 */
`;

const Message = styled.div`
  display: flex;
  align-items: center;
  background: ${(props) => (props.isUser ? "#007bff" : "#e9ecef")};
  color: ${(props) => (props.isUser ? "white" : "black")};
  padding: 10px;
  border-radius: ${(props) =>
    props.isUser ? "10px 10px 0 10px" : "10px 10px 10px 0"};
  max-width: 70%;
  word-break: break-word;
  white-space: pre-wrap; /* 支援換行符號 */
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: ${(props) => (props.isUser ? "flex-end" : "flex-start")}; /* 按鈕根據訊息對齊 */
  gap: 10px; /* 按鈕間距 */
  margin-top: 5px; /* 與訊息之間的距離 */
  width: 100%; /* 讓按鈕容器與父元素保持一致寬度 */
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

const SuggestionsContainer = styled.div`
  position: absolute;
  top: 40px;
  left: 0;
  width: 100%;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 5px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
`;

const Suggestion = styled.div`
  padding: 10px;
  cursor: pointer;
  background: ${(props) => (props.selected ? "#f0f0f0" : "transparent")};
  &:hover {
    background: #f0f0f0;
  }
`;

const App = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const ws = useRef(null);
  const uuid = useRef(uuidv4());
  const sessionId = useRef(uuidv4());
  const [isConnected, setIsConnected] = useState(false);
  const chatWindowRef = useRef(null);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);

  // 預設按鈕數據
  const helloMsg = {
    data: ["功能列表"],
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
      ws.current.send(JSON.stringify(
        {
          code: 1,
          mess: "功能列表",
          domain: "example.com",
          sessionId: sessionId.current,
          uuid: uuid.current,
        }
      ));
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      // 如果 subType 為 "relatelist"，顯示按鈕選項
      if (data.subType === "relatelist") {
        setMessages((prev) => [
          ...prev,
          { text: data.value, isUser: false, options: data.data, showOptions: true },
        ]);
      } else {
        setMessages((prev) => [...prev, { text: data.value, isUser: false, showOptions: true }]);
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

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = (message) => {
    if (ws.current && isConnected) {
      const messageRequest = {
        code: 1,
        mess: message,
        domain: "example.com",
        sessionId: sessionId.current,
        uuid: uuid.current,
      };

      ws.current.send(JSON.stringify(messageRequest));
      setMessages((prev) => [...prev, { text: message, isUser: true, showOptions: true }]);
    } else {
      console.warn("WebSocket is not ready yet");
    }
  };

  const handleButtonClick = (option, index) => {
    setMessages((prevMessages) =>
      prevMessages.map((msg, i) =>
        i === index ? { ...msg, showOptions: false } : msg
      )
    );
    sendMessage(option);
  };

  const handleSend = () => {
    if (inputValue.trim()) {
      console.log(inputValue)
      sendMessage(inputValue.trim());
      setInputValue("");
    }
  };

  const fetchSuggestions = async (query) => {
    if (!query.trim()) return setSuggestions([]);
    const response = await fetch(`http://localhost:3002/elk/autocomplete?query=${query}`);
    console.log(response)
    const data = await response.json();
    setSuggestions(data || []);
  };
  
  
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    fetchSuggestions(e.target.value);
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
    setSuggestions([]);
  };
  
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && selectedSuggestionIndex !== -1) {
      handleSuggestionClick(suggestions[selectedSuggestionIndex]);
    } else if (e.key === "ArrowDown") {
      setSelectedSuggestionIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : prev));
    }
  };

  return (
    <AppContainer>
    <ChatWindow ref={chatWindowRef}>
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
        <MessageContainer key={index} isUser={msg.isUser}>
          <Message isUser={msg.isUser}>
            <span>{msg.text}</span>
          </Message>
          {msg.options && msg.showOptions && (
            <ButtonContainer isUser={msg.isUser}>
              {msg.options.map((option, idx) => (
                <OptionButton key={idx} onClick={() => handleButtonClick(option, index)}>
                  {option}
                </OptionButton>
              ))}
            </ButtonContainer>
          )}
        </MessageContainer>
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
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
        <SendButton onClick={handleSend} disabled={!inputValue.trim() || !isConnected}>
          發送
        </SendButton>
        {suggestions.length > 0 && (
          <SuggestionsContainer>
            {suggestions.map((suggestion, index) => (
              <Suggestion
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                selected={index === selectedSuggestionIndex}
              >
                {suggestion}
              </Suggestion>
            ))}
          </SuggestionsContainer>
        )}
      </InputContainer>
    </AppContainer>
  );
};

export default App;