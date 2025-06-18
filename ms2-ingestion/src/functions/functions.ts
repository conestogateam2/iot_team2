import * as fs from 'fs'; // Library for File System Operations
import logger from './logger.js';

// Get the formatted timestamp
export const getFormattedTimestamp = (): string => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };
  