import axios from "axios";
import { API_BASE_URL } from "../config";
import { setCountItem } from "../redux/reducer/cartReducer";

export const getItemCount = async (dispatch) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/Carts/item-count`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    const action = setCountItem(response.data.ItemCount);

    dispatch(action);
  } catch (error) {
    return error;
  }
};