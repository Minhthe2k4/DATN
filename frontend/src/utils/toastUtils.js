/**
 * Utility to trigger global toast notifications
 * @param {string} type - Notification type (SUCCESS, ERROR, WARNING, INFO, SYSTEM, etc.)
 * @param {string} message - The message to display
 * @param {object} data - Optional additional data
 */
export const notify = (type, message, data = {}) => {
  const event = new CustomEvent('new-notification', {
    detail: {
      type: type.toUpperCase(),
      message,
      data
    }
  });
  window.dispatchEvent(event);
};

export const toast = {
  success: (msg, data) => notify('SUCCESS', msg, data),
  error: (msg, data) => notify('ERROR', msg, data),
  warning: (msg, data) => notify('WARNING', msg, data),
  info: (msg, data) => notify('INFO', msg, data),
  system: (msg, data) => notify('SYSTEM', msg, data),
};
