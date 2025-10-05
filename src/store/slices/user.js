import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-hot-toast";

// Async thunk for user sign-in


export const forgetPassword = createAsyncThunk(
  "User/forgetPassword",
  async ({ email }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(
        "https://tn360-122923924979.europe-west1.run.app/api/v1/auth/password/email",
        { email } // Ensure the body is structured correctly (email should be inside an object)
      );
      toast.success("Un lien de réinitialisation a été envoyé à votre e-mail.");
      return data;
    } catch (error) {
      // Handle error, providing more detailed feedback
      if (error.response) {
        toast.error(error.response.data.message || "Une erreur est survenue.");
        return rejectWithValue(error.response.data.message || "Une erreur est survenue.");
      } else {
        toast.error("Problème de connexion. Veuillez réessayer.");
        return rejectWithValue("Problème de connexion. Veuillez réessayer.");
      }
    }
  }
);

export const signUp = createAsyncThunk(
  "user/signup",
  async ({ userData, navigate }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(
        "https://tn360-back-office-122923924979.europe-west1.run.app/api/v1/auth/register",
        userData // pas besoin de le mettre dans {user}, juste l’objet direct
      );

      toast.success("Account created Successfully");
      navigate("/login");

      return data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Registration failed";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);



export const fetchUserProfile = createAsyncThunk(
  "User/fetchUserProfile",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token"); // Assuming token is stored in localStorage
      const { data } = await axios.get("https://tn360-122923924979.europe-west1.run.app/api/v1/customer/info1", {
        headers: {
          Authorization: `Bearer ${token}`, // Add token for authentication
        },
      });
      return data; // Return the profile data
    } catch (error) {
      // Handle errors and return an error message
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch user profile"
      );
    }
  }
);

// Update user profile
export const updateUserProfile = createAsyncThunk(
  "User/updateUserProfile",
  async (profileData, { getState, rejectWithValue }) => {
    try {
      // Retrieve token from state or localStorage
      const state = getState();
      const token = state.auth?.token || localStorage.getItem("token");

      if (!token) {
        throw new Error("Authentication token is missing");
      }

      // Make API request
      const { data } = await axios.post(
        "https://tn360-122923924979.europe-west1.run.app/api/v1/auth/profile/update",
        profileData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("account update");
      return data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || "Failed to update profile";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);
export const updateCagnotteInDB = createAsyncThunk(
  "U/updateCagnotteInDB",
  async (updatedBalance, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = state.auth?.token || localStorage.getItem("token");

      if (!token) {
        throw new Error("Authentication token is missing");
      }

      // Appel à l'API pour mettre à jour le cagnotte_balance dans la base de données
      const { data } = await axios.post
      (
        "https://tn360-122923924979.europe-west1.run.app/api/v1/customer/update-cagnotte", // Remplacez par votre URL API
        { cagnotte_balance: updatedBalance },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Cagnotte mise à jour avec succès");
      return data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || "Erreur lors de la mise à jour de la cagnotte";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

const UserSlice = createSlice({
  name: "User",
  initialState: {
    Userprofile: null,
    loggedInUser: null, // Initially no user logged in
    loading: false, // Track loading state
    error: null, // Track error message
  },
  reducers: {
  
  },
  extraReducers: (builder) => {
    builder.addCase(signUp.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(signUp.fulfilled, (state, action) => {
      state.loading = false;
      state.createdUser = action.payload;
    });
    builder.addCase(signUp.rejected, (state) => {
      state.loading = false;
    });

    builder.addCase(fetchUserProfile.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchUserProfile.fulfilled, (state, action) => {
      state.loading = false;
      state.Userprofile = action.payload;
    });
    builder.addCase(fetchUserProfile.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    builder.addCase(updateUserProfile.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateUserProfile.fulfilled, (state, action) => {
      state.loading = false;
      state.Userprofile = action.payload;
    });
    builder.addCase(updateUserProfile.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    builder.addCase(updateCagnotteInDB.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(updateCagnotteInDB.fulfilled, (state, action) => {
      state.loading = false;
      state.Userprofile = action.payload;
    });
    builder.addCase(updateCagnotteInDB.rejected, (state, action) => {
      state.loading = false;
      toast.error(action.payload);
    });
    builder.addCase(forgetPassword.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(forgetPassword.fulfilled, (state, action) => {
      state.loading = false;
      state.Userprofile = action.payload;
    });
    builder.addCase(forgetPassword.rejected, (state, action) => {
      state.loading = false;
      toast.error(action.payload);
    });
  },
});


export default UserSlice.reducer;