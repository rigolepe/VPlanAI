import React from 'react';
import { ChatMessage } from '../types/chat';
import styles from './ChatHistory.module.css';

interface ChatHistoryProps {
  history: ChatMessage[];
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ history }) => {
  return (
    <div className={styles.chatHistory}>
      {history.map((message, index) => (
        <div key={index} className={`${styles.message} ${styles[message.sender]}`}>
          <span className={styles.sender}>{message.sender}</span>
          <p>{message.content}</p>
        </div>
      ))}
    </div>
  );
};

export default ChatHistory;