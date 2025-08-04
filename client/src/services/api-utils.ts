import { toast } from "@/hooks/use-toast";

// Reusable error handling function
export const handleApiError = (error: any): string => {
  // Extract server error message if available
  if (error?.response?.data?.message) {
    return error.response.data.message;
  } else if (error?.response?.data?.error) {
    return error.response.data.error;
  } else if (error?.response?.data?.details) {
    return error.response.data.details;
  } else if (error?.message) {
    return error.message;
  } else {
    return "Đã xảy ra lỗi không mong muốn";
  }
};

// Reusable function to show error toast
export const showErrorToast = (error: any, title: string = "Có lỗi xảy ra") => {
  const errorMessage = handleApiError(error);
  toast({
    title,
    description: errorMessage,
    variant: "destructive",
  });
};

// Reusable function to show success toast
export const showSuccessToast = (title: string, description: string) => {
  toast({
    title,
    description,
  });
};

// Generic mutation error handler
export const createMutationErrorHandler = (title: string) => {
  return (error: any) => {
    console.error(title, error);
    showErrorToast(error, title);
  };
};

// Generic mutation success handler
export const createMutationSuccessHandler = (
  title: string,
  description: string,
  onSuccess?: () => void
) => {
  return () => {
    showSuccessToast(title, description);
    onSuccess?.();
  };
};
