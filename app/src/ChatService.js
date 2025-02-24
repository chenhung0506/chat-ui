import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { Header, MessageContainer, Message, ButtonContainer, DefaultButtonContainer, OptionButton, InputContainer, Input, SendButton, SuggestionsContainer, Suggestion } from "./styles/StyledComponents";

const AppContainer = styled.div`
  font-family: Arial, sans-serif;
  width: 100vw;
  height: 100vh;
  padding: 10px;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* 確保不會出現滾動條 */
  box-sizing: border-box;
`;

const ChatWindow = styled.div`
  flex: 1;
  background: #f7f7f7;
  border-radius: 5px;
  padding: 10px;
  overflow-y: auto; /* 允許內部滾動 */
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: calc(100vh - 95px); /* 根據畫面大小調整最大高度，避免超出 */
`;

const ClientChat = ({ clientId, serviceId, messages, setMessages }) => {
  const [inputValue, setInputValue] = useState("");
  const ws = useRef(null);
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
    if (!serviceId) return;
    const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
    const websocketDomain = process.env.REACT_APP_WEBSOCKET_DOMAIN;
    const websocketPort = process.env.REACT_APP_WEBSOCKET_PORT;
    const hostname = `${websocketDomain}${websocketPort}`;
    const websocketUrl = `${protocol}${hostname}/websocket/service/${serviceId}`;
    console.log("Connecting to WebSocket URL:", websocketUrl);
    ws.current = new WebSocket(websocketUrl);

    ws.current.onopen = () => {
      console.log("WebSocket connected");
      setIsConnected(true);
      ws.current.send(JSON.stringify(
        {
          code: 1,
          mess: "功能列表",
          domain: "example.com",
          sessionId: serviceId,
          uuid: serviceId,
        }
      ));
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.subType === "relatelist") {
        setMessages((prev) => [...prev, { text: data.value, isClient: data.isClient, options: data.data, showOptions: true }]);
      } else {
        setMessages((prev) => [...prev, { text: data.value, isClient: data.isClient, showOptions: true }]);
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
      if (ws.current) {
        ws.current.close();
        console.log("WebSocket connection closed.");
      }
    };
  }, [serviceId, setMessages]);

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = (message) => {
    if (ws.current && isConnected) {
      const messageRequest = {
        code: 1,
        value: message,
        domain: "example.com",
        sessionId: serviceId,
        uuid: serviceId,
      };

      ws.current.send(JSON.stringify(messageRequest));
      setMessages((prev) => [...prev, { text: message, isClient: false, showOptions: true }]);
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
    if (inputValue && inputValue.trim()) {
      console.log(inputValue)
      sendMessage(inputValue.trim());
      setInputValue("");
    } else {
      console.warn("Input value is invalid or empty.");
    }
  };

  const fetchSuggestions = async (query) => {
    if (!query.trim()) return setSuggestions([]);
    const elkDomain = process.env.REACT_APP_ELK_DOMAIN;
    const elkPort = process.env.REACT_APP_ELK_PORT;
    const response = await fetch(`${window.location.protocol === 'https:' ? 'https' : 'http'}://${elkDomain}${elkPort}/elk/autocomplete?query=${query}`);
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
    if (e.key === "Enter") {
      if (selectedSuggestionIndex !== -1) {
        setSelectedSuggestionIndex(-1)
        handleSuggestionClick(suggestions[selectedSuggestionIndex]);
      } else {
        handleSend(); // 如果沒有選中建議，發送當前輸入值
      }
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
        <MessageContainer key={index} $isClient={msg.isClient}>
          <Message $isClient={msg.isClient}>
            <span>{msg.text}</span>
          </Message>
          {msg.options && msg.showOptions && (
            <ButtonContainer $isClient={msg.isClient}>
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

      <InputContainer>
        <Input
          placeholder="想問什麼問題？"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
        <DefaultButtonContainer>
          {helloMsg.data.map((option) => (
            <OptionButton key={option} onClick={() => handleButtonClick(option)}>
              {option}
            </OptionButton>
          ))}
        </DefaultButtonContainer>
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

export default ClientChat;