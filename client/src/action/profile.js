import axios from "axios";
import { setAlert } from "./alert";

import { GET_PROFILE, PROFILE_ERROR } from "./types";

//getcurrentprofile
export const getCurrentProfile = () => async (dispatch) => {
  let url = "http://localhost:5000/api/profile/me";
  try {
    const res = await axios.get(url);

    dispatch({
      type: GET_PROFILE,
      payload: res.data,
    });
  } catch (err) {
    console.log(err, "err");
    dispatch({
      type: PROFILE_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status },
    });
  }
};

//Create or update profile

export const createProfile = ({ formData, history }, edit = false) => async (
  dispatch
) => {
  console.log(formData, "in action");
  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    let url = "http://localhost:5000/api/profile";

    const res = await axios.post(url, formData, config);

    dispatch({
      type: GET_PROFILE,
      payload: res.data,
    });

    dispatch(setAlert(edit ? "Profile Updated" : "Profile created", "success"));

    if (!edit) {
      history.push("/dashboard");
    }
  } catch (err) {
    const errors = err.response.data.errors;
    if (errors) {
      errors.forEach((error) => dispatch(setAlert(error.msg, "danger")));
    }
    dispatch({
      type: PROFILE_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status },
    });
  }
};

//Add Experience

export const addexperience = () => async (dispatch) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const url = "http://localhost:5000/api/profile";
};
