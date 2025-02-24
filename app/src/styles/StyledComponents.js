import styled from "styled-components";

export const Header = styled.div`
  text-align: center;
  font-size: 16px;
  margin-bottom: 10px;
  color: #666;
`;

export const MessageContainer = styled.div`
  display: flex;
  flex-direction: column; /* 垂直排列訊息與按鈕 */
  align-items: ${(props) => (props.$isClient ? "flex-end" : "flex-start")}; /* 根據訊息的方向對齊 */
  margin: 10px 0; /* 增加垂直間距 */
`;

export const Message = styled.div`
  display: flex;
  align-items: center;
  background: ${(props) => (props.$isClient ? "#007bff" : "#e9ecef")};
  color: ${(props) => (props.$isClient ? "white" : "black")};
  padding: 10px;
  border-radius: ${(props) =>
    props.$isClient ? "10px 10px 0 10px" : "10px 10px 10px 0"};
  max-width: 70%;
  word-break: break-word;
  white-space: pre-wrap; /* 支援換行符號 */
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
`;

export const ButtonContainer = styled.div`
  display: flex;
  justify-content: ${(props) => (props.isClient ? "flex-end" : "flex-start")}; /* 按鈕根據訊息對齊 */
  gap: 10px; /* 按鈕間距 */
  margin-top: 5px; /* 與訊息之間的距離 */
  width: 100%; /* 讓按鈕容器與父元素保持一致寬度 */
`;

export const DefaultButtonContainer = styled.div`
  display: flex;
  justify-content: ${(props) => (props.isClient ? "flex-end" : "flex-start")}; /* 按鈕根據訊息對齊 */
  gap: 10px; /* 按鈕間距 */
  margin-top: 5px; /* 與訊息之間的距離 */
`;

export const OptionButton = styled.button`
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

export const InputContainer = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  position: relative; /* Needed for absolute positioning of SuggestionsContainer */
`;

export const Input = styled.input`
  flex: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

export const SendButton = styled.button`
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

export const SuggestionsContainer = styled.div`
  position: absolute;
  bottom: 100%; /* Position above the input */
  left: 0;
  width: 100%;
  background-color: rgba(255, 255, 255, 0.8); /* Slightly transparent background */
  border: 1px solid #ccc;
  border-radius: 5px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); /* Optional: shadow for better visibility */
`;

export const Suggestion = styled.div`
  padding: 10px;
  cursor: pointer;
  background: ${(props) => (props.selected ? "#f0f0f0" : "transparent")};
  &:hover {
    background: #f0f0f0;
  }
`;