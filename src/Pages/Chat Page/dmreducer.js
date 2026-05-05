export const initialState = {
  messages: [],
  messageText: "",
  loading: true,
};

export function dmReducer(state, action) {
  switch (action.type) {
    case "SET_MESSAGES":
      return { ...state, messages: action.payload };

    case "ADD_MESSAGE":
      return { ...state, messages: [...state.messages, action.payload] };

    case "SET_TEXT":
      return { ...state, messageText: action.payload };

    case "SET_LOADING":
      return { ...state, loading: action.payload };

    case "CLEAR_TEXT":
      return { ...state, messageText: "" };

    default:
      return state;
  }
}