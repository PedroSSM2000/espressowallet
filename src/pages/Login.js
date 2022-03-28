import { LoadingButton } from "@mui/lab";
import {
  Box,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useRef, useState } from "react";
import { loginEmail, signUpEmail } from "services";
import signInGoogle from "services/signInGoogle";

const noErrors = {
  emailError: " ",
  passwordError: " ",
};

const notLoading = {
  loginLoading: false,
  signUpLoading: false,
};

const emptyForm = {
  email: "",
  password: "",
};

export default function Login() {
  const [loading, setLoading] = useState(notLoading);
  const { loginLoading, signUpLoading } = loading;

  const [form, setForm] = useState(emptyForm);
  const { email, password } = form;

  const [errorState, setErrorState] = useState(noErrors);
  const { emailError, passwordError } = errorState;

  const isSignUp = useRef(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setErrorState(noErrors);

    if (isSignUp.current) {
      setLoading({ ...notLoading, signUpLoading: true });
      const { error } = await signUpEmail(email, password);
      setLoading(notLoading);
      if (error) setErrorState(humanErrorParse(error));
    }

    if (!isSignUp.current) {
      setLoading({ ...notLoading, loginLoading: true });
      const { error } = await loginEmail(email, password);
      setLoading(notLoading);
      if (error) setErrorState(humanErrorParse(error));
    }

    isSignUp.current = false;
  }

  async function handleGoogleSignIn() {
    setLoading({ ...notLoading, loginLoading: true });
    const { error } = await signInGoogle();
    setLoading(notLoading);
    if (error) setErrorState(humanErrorParse(error));
  }

  const emailRegex = /^[\w-.]+@([\w-]+\.)+\w{2,4}$/g;
  const minPasswordLength = 6;
  const disabled =
    !emailRegex.test(email) || password.length < minPasswordLength;

  return (
    <Box sx={containerStyle}>
      <Paper
        component="form"
        elevation={2}
        sx={formStyle}
        onSubmit={handleSubmit}
      >
        <Typography mb={2} textAlign="center" fontWeight={600} variant="h5">
          Poliwallet 💼
        </Typography>
        <TextField
          name="email"
          type="email"
          label="Email"
          size="small"
          value={email}
          onChange={handleChange}
          error={emailError !== " "}
          helperText={emailError}
        />

        <TextField
          name="password"
          type="password"
          label="Password"
          size="small"
          value={password}
          onChange={handleChange}
          error={passwordError !== " "}
          helperText={passwordError}
        />

        <Stack direction="row" justifyContent="space-between">
          <LoadingButton
            onClick={e => {
              isSignUp.current = true;
              handleSubmit(e);
            }}
            disabled={disabled || loading !== notLoading}
            loading={signUpLoading}
          >
            Sign up
          </LoadingButton>

          <LoadingButton
            disabled={disabled || loading !== notLoading}
            type="submit"
            variant="contained"
            disableElevation
            loading={loginLoading}
          >
            Login
          </LoadingButton>
        </Stack>
      </Paper>

      <Divider sx={{ width: "20rem" }}>
        <Typography>or</Typography>
      </Divider>

      <button className="login-with-google-btn" onClick={handleGoogleSignIn}>
        Sign in with Google
      </button>
    </Box>
  );
}

const containerStyle = {
  display: "flex",
  gap: 2,
  flexFlow: "column nowrap",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "100vh",
  boxSizing: "border-box",
  pb: 8,
  bgcolor: "grey.50",
};

const formStyle = {
  p: 4,
  borderRadius: 4,
  display: "flex",
  flexDirection: "column",
  width: "20rem",
  gap: 2,
};

function humanErrorParse(error) {
  error = error.split("/")[1].split("-").join(" ");
  error = error.charAt(0).toUpperCase() + error.slice(1);
  return /password/g.test(error)
    ? {
        ...noErrors,
        passwordError: error,
      }
    : {
        ...noErrors,
        emailError: error,
      };
}
