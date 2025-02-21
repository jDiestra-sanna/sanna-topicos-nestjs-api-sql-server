export const cleanErrorMessages = (messages: string[]) => {
  function processMessage(message: string) {
    let parts = message.split('.');

    if (parts.length > 2) {
      return processMessage(parts.slice(1).join('.'));
    }

    return parts.length > 1 ? parts[1] : message;
  }
  return messages.map(processMessage);
}