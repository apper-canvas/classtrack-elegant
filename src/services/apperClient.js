let apperClientInstance = null;

export const getApperClient = () => {
  if (apperClientInstance) {
    return apperClientInstance;
  }

  if (typeof window === 'undefined' || !window.ApperSDK) {
    console.error('ApperSDK not loaded');
    return null;
  }

  const { ApperClient } = window.ApperSDK;
  
  try {
    apperClientInstance = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    
    return apperClientInstance;
  } catch (error) {
    console.error('Failed to initialize ApperClient:', error);
    return null;
  }
};